#!/usr/bin/env python3
import hashlib
import json
import os
import secrets
import sqlite3
import time
from datetime import datetime, timezone
from email.utils import parseaddr
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
DB_FILE = DATA_DIR / "app.db"
STATE_FILE = DATA_DIR / "state.json"
ACCOUNTS_FILE = DATA_DIR / "accounts.json"
SESSION_COOKIE = "essinge_session"
SESSION_TTL_SECONDS = 60 * 60 * 24 * 14
PBKDF2_ITERATIONS = 240_000


def utc_now_iso():
  return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def ensure_data_dir():
  DATA_DIR.mkdir(parents=True, exist_ok=True)


def read_json_file(path, fallback):
  try:
    if not path.exists():
      return fallback
    return json.loads(path.read_text(encoding="utf-8"))
  except Exception:
    return fallback


def write_json_file(path, data):
  text = json.dumps(data, ensure_ascii=False, indent=2)
  path.write_text(text, encoding="utf-8")


def get_db():
  conn = sqlite3.connect(DB_FILE)
  conn.row_factory = sqlite3.Row
  return conn


def ensure_db():
  with get_db() as conn:
    conn.execute(
      """
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      )
      """
    )
    conn.execute(
      """
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
      """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)")


def normalize_email(value):
  return parseaddr((value or "").strip())[1].strip().lower()


def validate_email(value):
  email = normalize_email(value)
  return email if email and "@" in email else ""


def validate_password(value):
  password = str(value or "")
  return password if len(password) >= 8 else ""


def hash_password(password, salt_hex=None):
  salt = bytes.fromhex(salt_hex) if salt_hex else secrets.token_bytes(16)
  digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
  return salt.hex(), digest.hex()


def verify_password(password, salt_hex, digest_hex):
  _, candidate = hash_password(password, salt_hex)
  return secrets.compare_digest(candidate, digest_hex)


def fetch_user_count():
  with get_db() as conn:
    row = conn.execute("SELECT COUNT(*) AS count FROM users").fetchone()
    return int(row["count"] if row else 0)


def create_user(email, display_name, password, role="admin"):
  normalized_email = validate_email(email)
  normalized_password = validate_password(password)
  display_name = str(display_name or "").strip()
  if not normalized_email:
    raise ValueError("Ange en giltig e-postadress.")
  if not normalized_password:
    raise ValueError("Lösenord måste vara minst 8 tecken.")
  if not display_name:
    raise ValueError("Ange namn för användaren.")

  salt_hex, digest_hex = hash_password(normalized_password)
  user_id = secrets.token_hex(16)
  created_at = utc_now_iso()
  with get_db() as conn:
    conn.execute(
      """
      INSERT INTO users (id, email, display_name, role, password_salt, password_hash, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      """,
      (user_id, normalized_email, display_name, role, salt_hex, digest_hex, created_at),
    )
  return {
    "id": user_id,
    "email": normalized_email,
    "displayName": display_name,
    "role": role,
    "createdAt": created_at,
    "isActive": True,
  }


def authenticate_user(email, password):
  normalized_email = validate_email(email)
  if not normalized_email or not password:
    return None
  with get_db() as conn:
    row = conn.execute(
      """
      SELECT id, email, display_name, role, password_salt, password_hash, is_active, created_at
      FROM users
      WHERE email = ?
      """,
      (normalized_email,),
    ).fetchone()
  if not row or int(row["is_active"]) != 1:
    return None
  if not verify_password(password, row["password_salt"], row["password_hash"]):
    return None
  return serialize_user(row)


def serialize_user(row):
  return {
    "id": row["id"],
    "email": row["email"],
    "displayName": row["display_name"],
    "role": row["role"],
    "createdAt": row["created_at"],
    "isActive": bool(row["is_active"]),
  }


def create_session(user_id):
  token = secrets.token_urlsafe(32)
  created_at = utc_now_iso()
  expires_at = int(time.time()) + SESSION_TTL_SECONDS
  with get_db() as conn:
    conn.execute(
      "INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
      (token, user_id, expires_at, created_at),
    )
  return token


def delete_session(token):
  if not token:
    return
  with get_db() as conn:
    conn.execute("DELETE FROM sessions WHERE token = ?", (token,))


def get_session_token(handler):
  cookie_header = handler.headers.get("Cookie", "")
  if not cookie_header:
    return ""
  jar = SimpleCookie()
  jar.load(cookie_header)
  morsel = jar.get(SESSION_COOKIE)
  return morsel.value if morsel else ""


def get_current_user(handler):
  token = get_session_token(handler)
  if not token:
    return None
  now_ts = int(time.time())
  with get_db() as conn:
    conn.execute("DELETE FROM sessions WHERE expires_at <= ?", (now_ts,))
    row = conn.execute(
      """
      SELECT u.id, u.email, u.display_name, u.role, u.is_active, u.created_at
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > ? AND u.is_active = 1
      """,
      (token, now_ts),
    ).fetchone()
  return serialize_user(row) if row else None


def list_users():
  with get_db() as conn:
    rows = conn.execute(
      """
      SELECT id, email, display_name, role, is_active, created_at
      FROM users
      WHERE is_active = 1
      ORDER BY lower(display_name), lower(email)
      """
    ).fetchall()
  return [serialize_user(row) for row in rows]


def update_user_password(user_id, new_password):
  normalized_password = validate_password(new_password)
  if not normalized_password:
    raise ValueError("Lösenord måste vara minst 8 tecken.")
  salt_hex, digest_hex = hash_password(normalized_password)
  with get_db() as conn:
    conn.execute(
      "UPDATE users SET password_salt = ?, password_hash = ? WHERE id = ? AND is_active = 1",
      (salt_hex, digest_hex, user_id),
    )


def change_password(user_id, current_password, new_password):
  normalized_password = validate_password(new_password)
  if not normalized_password:
    raise ValueError("Nytt lösenord måste vara minst 8 tecken.")
  with get_db() as conn:
    row = conn.execute(
      "SELECT password_salt, password_hash FROM users WHERE id = ? AND is_active = 1",
      (user_id,),
    ).fetchone()
  if not row or not verify_password(current_password or "", row["password_salt"], row["password_hash"]):
    raise ValueError("Nuvarande lösenord stämmer inte.")
  update_user_password(user_id, normalized_password)


def load_payload():
  return {
    "state": read_json_file(STATE_FILE, None),
    "accountsByType": read_json_file(ACCOUNTS_FILE, None),
  }


def save_payload(payload):
  if not isinstance(payload, dict):
    return
  if "state" in payload:
    write_json_file(STATE_FILE, payload["state"])
  if "accountsByType" in payload:
    write_json_file(ACCOUNTS_FILE, payload["accountsByType"])


class Handler(SimpleHTTPRequestHandler):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

  def _send_json(self, data, status=HTTPStatus.OK, headers=None):
    body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    self.send_response(status)
    self.send_header("Content-Type", "application/json; charset=utf-8")
    self.send_header("Content-Length", str(len(body)))
    if headers:
      for key, value in headers.items():
        self.send_header(key, value)
    self.end_headers()
    self.wfile.write(body)

  def _read_json(self):
    length = int(self.headers.get("Content-Length", "0"))
    raw_body = self.rfile.read(length) if length > 0 else b"{}"
    try:
      return json.loads(raw_body.decode("utf-8"))
    except Exception:
      return None

  def _cookie_header(self, token, expires_at=SESSION_TTL_SECONDS):
    parts = [
      f"{SESSION_COOKIE}={token}",
      "HttpOnly",
      "Path=/",
      "SameSite=Lax",
      f"Max-Age={expires_at}",
    ]
    if os.environ.get("APP_SECURE_COOKIES") == "1":
      parts.append("Secure")
    return "; ".join(parts)

  def _clear_cookie_header(self):
    parts = [f"{SESSION_COOKIE}=;", "HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=0"]
    if os.environ.get("APP_SECURE_COOKIES") == "1":
      parts.append("Secure")
    return "; ".join(parts)

  def _require_auth(self):
    user = get_current_user(self)
    if not user:
      self._send_json({"ok": False, "error": "authentication_required"}, status=HTTPStatus.UNAUTHORIZED)
      return None
    return user

  def _require_admin(self):
    user = self._require_auth()
    if not user:
      return None
    if user["role"] != "admin":
      self._send_json({"ok": False, "error": "admin_required"}, status=HTTPStatus.FORBIDDEN)
      return None
    return user

  def do_GET(self):
    path = urlparse(self.path).path

    if path == "/api/auth/status":
      user = get_current_user(self)
      self._send_json(
        {
          "ok": True,
          "needsSetup": fetch_user_count() == 0,
          "authenticated": bool(user),
          "user": user,
        }
      )
      return

    if path == "/api/auth/me":
      user = get_current_user(self)
      self._send_json({"ok": True, "authenticated": bool(user), "user": user})
      return

    if path == "/api/admin/users":
      user = self._require_admin()
      if not user:
        return
      self._send_json({"ok": True, "users": list_users()})
      return

    if path == "/api/storage/load":
      user = self._require_auth()
      if not user:
        return
      self._send_json({"ok": True, **load_payload()})
      return

    if path == "/api/storage/ping":
      self._send_json({"ok": True})
      return

    return super().do_GET()

  def do_POST(self):
    path = urlparse(self.path).path

    if path == "/api/auth/bootstrap":
      if fetch_user_count() > 0:
        self._send_json({"ok": False, "error": "setup_completed"}, status=HTTPStatus.CONFLICT)
        return
      payload = self._read_json()
      if payload is None:
        self._send_json({"ok": False, "error": "invalid_json"}, status=HTTPStatus.BAD_REQUEST)
        return
      try:
        user = create_user(payload.get("email"), payload.get("displayName"), payload.get("password"), "admin")
      except ValueError as exc:
        self._send_json({"ok": False, "error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
        return
      token = create_session(user["id"])
      self._send_json(
        {"ok": True, "user": user},
        headers={"Set-Cookie": self._cookie_header(token)},
      )
      return

    if path == "/api/auth/login":
      payload = self._read_json()
      if payload is None:
        self._send_json({"ok": False, "error": "invalid_json"}, status=HTTPStatus.BAD_REQUEST)
        return
      user = authenticate_user(payload.get("email"), payload.get("password"))
      if not user:
        self._send_json({"ok": False, "error": "invalid_credentials"}, status=HTTPStatus.UNAUTHORIZED)
        return
      token = create_session(user["id"])
      self._send_json(
        {"ok": True, "user": user},
        headers={"Set-Cookie": self._cookie_header(token)},
      )
      return

    if path == "/api/auth/logout":
      delete_session(get_session_token(self))
      self._send_json({"ok": True}, headers={"Set-Cookie": self._clear_cookie_header()})
      return

    if path == "/api/auth/change-password":
      user = self._require_auth()
      if not user:
        return
      payload = self._read_json()
      if payload is None:
        self._send_json({"ok": False, "error": "invalid_json"}, status=HTTPStatus.BAD_REQUEST)
        return
      try:
        change_password(user["id"], payload.get("currentPassword"), payload.get("newPassword"))
      except ValueError as exc:
        self._send_json({"ok": False, "error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
        return
      self._send_json({"ok": True})
      return

    if path == "/api/admin/users":
      user = self._require_admin()
      if not user:
        return
      payload = self._read_json()
      if payload is None:
        self._send_json({"ok": False, "error": "invalid_json"}, status=HTTPStatus.BAD_REQUEST)
        return
      try:
        created = create_user(payload.get("email"), payload.get("displayName"), payload.get("password"), "admin")
      except sqlite3.IntegrityError:
        self._send_json({"ok": False, "error": "En användare med den e-posten finns redan."}, status=HTTPStatus.CONFLICT)
        return
      except ValueError as exc:
        self._send_json({"ok": False, "error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
        return
      self._send_json({"ok": True, "user": created})
      return

    if path.startswith("/api/admin/users/") and path.endswith("/password"):
      user = self._require_admin()
      if not user:
        return
      user_id = path.split("/")[4]
      payload = self._read_json()
      if payload is None:
        self._send_json({"ok": False, "error": "invalid_json"}, status=HTTPStatus.BAD_REQUEST)
        return
      try:
        update_user_password(user_id, payload.get("newPassword"))
      except ValueError as exc:
        self._send_json({"ok": False, "error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
        return
      self._send_json({"ok": True})
      return

    if path == "/api/storage/save":
      user = self._require_auth()
      if not user:
        return
      payload = self._read_json()
      if payload is None:
        self._send_json({"ok": False, "error": "invalid_json"}, status=HTTPStatus.BAD_REQUEST)
        return
      try:
        save_payload(payload)
        self._send_json({"ok": True})
      except Exception as exc:
        self._send_json({"ok": False, "error": str(exc)}, status=HTTPStatus.INTERNAL_SERVER_ERROR)
      return

    self.send_error(HTTPStatus.NOT_FOUND, "Not Found")


def main():
  ensure_data_dir()
  ensure_db()
  host = os.environ.get("APP_HOST") or ("0.0.0.0" if os.environ.get("PORT") else "127.0.0.1")
  port = int(os.environ.get("PORT", "8080"))
  server = ThreadingHTTPServer((host, port), Handler)
  print(f"Essinge Rover IK server running on http://{host}:{port}")
  print(f"Data folder: {DATA_DIR}")
  print(f"Database: {DB_FILE}")
  try:
    server.serve_forever()
  except KeyboardInterrupt:
    pass
  finally:
    server.server_close()


if __name__ == "__main__":
  main()
