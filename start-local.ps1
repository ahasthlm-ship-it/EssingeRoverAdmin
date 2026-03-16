$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

function Find-BrowserPath {
  $candidates = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe",
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe"
  )

  foreach ($path in $candidates) {
    if (Test-Path $path) {
      return $path
    }
  }

  return $null
}

$browserPath = Find-BrowserPath
if (-not $browserPath) {
  Write-Host "Kunde inte hitta Chrome eller Edge." -ForegroundColor Red
  Write-Host "Installera Chrome eller Edge och prova igen."
  exit 1
}

$pythonCmd = Get-Command py -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
  $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
}

if (-not $pythonCmd) {
  Write-Host "Kunde inte hitta Python (py/python) i PATH." -ForegroundColor Red
  Write-Host "Installera Python 3 och bocka i 'Add Python to PATH'."
  exit 1
}

$pythonExe = $pythonCmd.Source
$serverArgs = @("run_local.py")
$server = Start-Process -FilePath $pythonExe -ArgumentList $serverArgs -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 1

$url = "http://localhost:8080"
$persistentProfile = Join-Path $projectDir ".browser-profile"
if (-not (Test-Path $persistentProfile)) {
  New-Item -Path $persistentProfile -ItemType Directory | Out-Null
}
$browserArgs = @("--new-window", "--user-data-dir=$persistentProfile", $url)
$browser = Start-Process -FilePath $browserPath -ArgumentList $browserArgs -PassThru

try {
  Wait-Process -Id $browser.Id
}
finally {
  if (-not $server.HasExited) {
    Stop-Process -Id $server.Id -Force
  }
}
