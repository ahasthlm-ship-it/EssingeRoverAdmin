const KEY = "essinge_rovers_ik_v1";
const SESSION_KEY = "essinge_rovers_session_v1";
const PINS_KEY = "essinge_rovers_pins_v1";
const ACCOUNTS_KEY = "essinge_rovers_accounts_v1";
const ONBOARDING_KEY = "essinge_rovers_onboarding_seen_v1";
const MAX_REFERENCE_FILE_BYTES = 2 * 1024 * 1024;

const defaultPins = {
  admin: "1122",
};

const authLabels = {
  admin: "Admin",
};

const defaultAccountsByType = {
  income: [
    { code: "3911", name: "Medlemsavgifter" },
    { code: "3921", name: "Träningsavgifter" },
    { code: "3985", name: "Kommunala bidrag" },
    { code: "3987", name: "Statliga bidrag" },
    { code: "3993", name: "Gåvor och donationer" },
    { code: "3051", name: "Kioskförsäljning" },
    { code: "3054", name: "Klubbkläder och utrustning" },
    { code: "3973", name: "Sponsring" },
    { code: "3990", name: "Övriga intäkter" },
  ],
  expense: [
    { code: "5010", name: "Plan och lokalhyra" },
    { code: "5460", name: "Idrottsmaterial" },
    { code: "5410", name: "Förbrukningsinventarier" },
    { code: "5800", name: "Resor och transport" },
    { code: "6310", name: "Försäkringar" },
    { code: "6570", name: "Bankkostnader" },
    { code: "6110", name: "Kontorsmaterial" },
    { code: "6212", name: "Telefoni och data" },
    { code: "7110", name: "Arvoden ledare och domare" },
    { code: "6990", name: "Övriga kostnader" },
  ],
};

const state = loadState();
let accountsByType = loadAccounts();
let pins = loadPins();
let session = loadSession();
let editingTxId = null;
let currentTxFilter = "all";
let undoTimeout = null;
let undoAction = null;

const refs = {
  authScreen: document.getElementById("authScreen"),
  appRoot: document.getElementById("appRoot"),
  authForm: document.getElementById("authForm"),
  authRole: document.getElementById("authRole"),
  authPin: document.getElementById("authPin"),
  authStatus: document.getElementById("authStatus"),
  authPinHint: document.getElementById("authPinHint"),
  currentUser: document.getElementById("currentUser"),
  logoutBtn: document.getElementById("logoutBtn"),
  roleHint: document.getElementById("roleHint"),
  topMonthStatus: document.getElementById("topMonthStatus"),
  topRoleStatus: document.getElementById("topRoleStatus"),
  topSavedStatus: document.getElementById("topSavedStatus"),
  topUnpaidStatus: document.getElementById("topUnpaidStatus"),

  seedBtn: document.getElementById("seedBtn"),
  wipeBtn: document.getElementById("wipeBtn"),
  balanceCard: document.getElementById("balanceCard"),
  incomeCard: document.getElementById("incomeCard"),
  expenseCard: document.getElementById("expenseCard"),
  memberCard: document.getElementById("memberCard"),
  kpiGrid: document.getElementById("kpiGrid"),

  monthFilter: document.getElementById("monthFilter"),
  txSearch: document.getElementById("txSearch"),
  transactionForm: document.getElementById("transactionForm"),
  txDate: document.getElementById("txDate"),
  txType: document.getElementById("txType"),
  txAmount: document.getElementById("txAmount"),
  txCategory: document.getElementById("txCategory"),
  txDesc: document.getElementById("txDesc"),
  toggleReferenceBox: document.getElementById("toggleReferenceBox"),
  referenceBox: document.getElementById("referenceBox"),
  txRefType: document.getElementById("txRefType"),
  txRefFile: document.getElementById("txRefFile"),
  txRefClear: document.getElementById("txRefClear"),
  txRefHint: document.getElementById("txRefHint"),
  txStatus: document.getElementById("txStatus"),
  txBody: document.getElementById("txBody"),
  txEmpty: document.getElementById("txEmpty"),
  exportExcelBtn: document.getElementById("exportExcelBtn"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  saveTxBtn: document.getElementById("saveTxBtn"),
  cancelEditTxBtn: document.getElementById("cancelEditTxBtn"),
  lockMonthBtn: document.getElementById("lockMonthBtn"),
  unlockMonthBtn: document.getElementById("unlockMonthBtn"),
  monthLockStatus: document.getElementById("monthLockStatus"),

  reportMonth: document.getElementById("reportMonth"),
  reportBox: document.getElementById("reportBox"),

  memberPanel: document.getElementById("memberPanel"),
  memberForm: document.getElementById("memberForm"),
  memberName: document.getElementById("memberName"),
  memberEmail: document.getElementById("memberEmail"),
  memberRole: document.getElementById("memberRole"),
  memberStatus: document.getElementById("memberStatus"),
  memberList: document.getElementById("memberList"),
  memberEmpty: document.getElementById("memberEmpty"),

  invoicePanel: document.getElementById("invoicePanel"),
  invoiceForm: document.getElementById("invoiceForm"),
  invoiceSeriesSelect: document.getElementById("invoiceSeriesSelect"),
  invoiceMemberSelect: document.getElementById("invoiceMemberSelect"),
  invoiceAmountInput: document.getElementById("invoiceAmountInput"),
  invoiceDueDateInput: document.getElementById("invoiceDueDateInput"),
  invoiceNoteInput: document.getElementById("invoiceNoteInput"),
  exportInvoicesCsvBtn: document.getElementById("exportInvoicesCsvBtn"),
  printInvoicesBtn: document.getElementById("printInvoicesBtn"),
  invoiceSearch: document.getElementById("invoiceSearch"),
  invoiceFilterStatus: document.getElementById("invoiceFilterStatus"),
  invoiceStatus: document.getElementById("invoiceStatus"),
  invoiceList: document.getElementById("invoiceList"),
  invoiceEmpty: document.getElementById("invoiceEmpty"),

  activityPanel: document.getElementById("activityPanel"),
  activityForm: document.getElementById("activityForm"),
  activityDate: document.getElementById("activityDate"),
  activityType: document.getElementById("activityType"),
  activityNote: document.getElementById("activityNote"),
  activityStatus: document.getElementById("activityStatus"),
  activityList: document.getElementById("activityList"),
  activityEmpty: document.getElementById("activityEmpty"),

  securityPanel: document.getElementById("securityPanel"),
  pinForm: document.getElementById("pinForm"),
  adminPinInput: document.getElementById("adminPinInput"),
  pinStatus: document.getElementById("pinStatus"),

  accountsPanel: document.getElementById("accountsPanel"),
  accountForm: document.getElementById("accountForm"),
  accountTypeInput: document.getElementById("accountTypeInput"),
  accountCodeInput: document.getElementById("accountCodeInput"),
  accountNameInput: document.getElementById("accountNameInput"),
  exportAccountsBtn: document.getElementById("exportAccountsBtn"),
  importAccountsBtn: document.getElementById("importAccountsBtn"),
  importAccountsFile: document.getElementById("importAccountsFile"),
  accountStatus: document.getElementById("accountStatus"),
  incomeAccountsList: document.getElementById("incomeAccountsList"),
  expenseAccountsList: document.getElementById("expenseAccountsList"),

  auditPanel: document.getElementById("auditPanel"),
  auditList: document.getElementById("auditList"),
  auditEmpty: document.getElementById("auditEmpty"),

  backupPanel: document.getElementById("backupPanel"),
  exportBackupBtn: document.getElementById("exportBackupBtn"),
  importBackupBtn: document.getElementById("importBackupBtn"),
  importBackupFile: document.getElementById("importBackupFile"),
  backupStatus: document.getElementById("backupStatus"),

  integrationPanel: document.getElementById("integrationPanel"),
  integrationForm: document.getElementById("integrationForm"),
  clubNameInput: document.getElementById("clubNameInput"),
  orgNoInput: document.getElementById("orgNoInput"),
  bankgiroInput: document.getElementById("bankgiroInput"),
  plusgiroInput: document.getElementById("plusgiroInput"),
  bankAccountInput: document.getElementById("bankAccountInput"),
  swishNumberInput: document.getElementById("swishNumberInput"),
  swishRecipientInput: document.getElementById("swishRecipientInput"),
  emailWebhookInput: document.getElementById("emailWebhookInput"),
  integrationStatus: document.getElementById("integrationStatus"),

  undoToast: document.getElementById("undoToast"),
  undoToastText: document.getElementById("undoToastText"),
  undoToastBtn: document.getElementById("undoToastBtn"),
  onboardingModal: document.getElementById("onboardingModal"),
  onboardingCloseBtn: document.getElementById("onboardingCloseBtn"),
  onboardingLaterBtn: document.getElementById("onboardingLaterBtn"),
};

init();

function init() {
  normalizeStoredTextEncoding();

  const today = new Date();
  refs.txDate.value = toDateInput(today);
  if (refs.activityDate) {
    refs.activityDate.value = toDateInput(today);
  }
  refs.invoiceDueDateInput.value = toDateInput(addDays(today, 30));
  refs.monthFilter.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  refs.clubNameInput.value = state.settings.clubName || "Essinge Rovers IK";
  refs.orgNoInput.value = state.settings.orgNo || "";
  refs.bankgiroInput.value = state.settings.bankgiro || "";
  refs.plusgiroInput.value = state.settings.plusgiro || "";
  refs.bankAccountInput.value = state.settings.bankAccount || "";
  refs.swishNumberInput.value = state.settings.swishNumber || "";
  refs.swishRecipientInput.value = state.settings.swishRecipient || "Essinge Rovers IK";
  refs.emailWebhookInput.value = state.settings.emailWebhookUrl || "";

  hydrateCategorySelect();
  bindEvents();
  renderAuthPinHint();
  applyAuthUi();
  resetTxFormState();
  clearTxErrors();
  setReferenceBoxExpanded(false);
  renderAll();
  showOnboardingIfNeeded();
}

function normalizeStoredTextEncoding() {
  let stateChanged = false;
  let accountsChanged = false;

  const normalize = (value) => normalizeMojibakeText(value);

  for (const tx of state.transactions) {
    const nextDescription = normalize(tx.description);
    const nextCategory = normalize(tx.category);
    const nextAccountName = normalize(tx.accountName);
    const nextReferenceName = normalize(tx.referenceName);
    if (nextDescription !== tx.description) {
      tx.description = nextDescription;
      stateChanged = true;
    }
    if (nextCategory !== tx.category) {
      tx.category = nextCategory;
      stateChanged = true;
    }
    if (nextAccountName !== tx.accountName) {
      tx.accountName = nextAccountName;
      stateChanged = true;
    }
    if (nextReferenceName !== tx.referenceName) {
      tx.referenceName = nextReferenceName;
      stateChanged = true;
    }
  }

  for (const invoice of state.invoices) {
    const nextMemberName = normalize(invoice.memberName);
    const nextNote = normalize(invoice.note);
    if (nextMemberName !== invoice.memberName) {
      invoice.memberName = nextMemberName;
      stateChanged = true;
    }
    if (nextNote !== invoice.note) {
      invoice.note = nextNote;
      stateChanged = true;
    }
  }

  for (const member of state.members) {
    const nextName = normalize(member.name);
    const nextRole = normalize(member.role);
    if (nextName !== member.name) {
      member.name = nextName;
      stateChanged = true;
    }
    if (nextRole !== member.role) {
      member.role = nextRole;
      stateChanged = true;
    }
  }

  for (const type of ["income", "expense"]) {
    for (const account of accountsByType[type] || []) {
      const nextName = normalize(account.name);
      if (nextName !== account.name) {
        account.name = nextName;
        accountsChanged = true;
      }
    }
  }

  if (stateChanged) {
    saveState();
  }
  if (accountsChanged) {
    saveAccounts();
  }
}

function normalizeMojibakeText(value) {
  if (typeof value !== "string" || !value) {
    return value;
  }
  const original = value;
  let fixed = value;

  // Attempt latin1->utf8 repair for classic mojibake (e.g. "GÃ¥vor" -> "Gåvor").
  try {
    const repaired = decodeURIComponent(escape(fixed));
    if (countMojibakeMarkers(repaired) < countMojibakeMarkers(fixed)) {
      fixed = repaired;
    }
  } catch {
    // Keep original if conversion fails.
  }

  fixed = fixed
    // Specific broken patterns seen in stored data/export previews.
    .replaceAll("Int%¤kt", "Intäkt")
    .replaceAll("int%¤kter", "intäkter")
    .replaceAll("Kioskfˆrs%ljning", "Kioskförsäljning")
    .replaceAll("fˆretagsstod", "företagsstöd")
    .replaceAll("företagsstod", "företagsstöd")
    .replaceAll("-÷vriga", "Övriga")
    .replaceAll("Ã…", "Å")
    .replaceAll("Ã„", "Ä")
    .replaceAll("Ã–", "Ö")
    .replaceAll("Ã¥", "å")
    .replaceAll("Ã¤", "ä")
    .replaceAll("Ã¶", "ö")
    .replaceAll("â€“", "–")
    .replaceAll("â€”", "—")
    .replaceAll("â€™", "'")
    .replaceAll("Â", "")
    .replaceAll("%¤", "ä")
    .replaceAll("%l", "äl")
    .replaceAll("‰", "ä")
    .replaceAll("ˆ", "ö")
    .replaceAll("÷", "ö")
    .replaceAll("ƒ", "å")
    .replaceAll("Š", "Ä")
    .replaceAll("†", "Ö");

  return fixed || original;
}

function countMojibakeMarkers(text) {
  if (!text) {
    return 0;
  }
  const matches = text.match(/[ÃÂâ‰ˆ÷¤]/g);
  return matches ? matches.length : 0;
}

function bindEvents() {
  refs.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    login();
  });

  refs.logoutBtn.addEventListener("click", logout);

  refs.txType.addEventListener("change", hydrateCategorySelect);

  refs.transactionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addOrUpdateTransaction();
  });
  refs.transactionForm.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && editingTxId) {
      event.preventDefault();
      resetTxFormState();
      clearTxErrors();
      setStatus(refs.txStatus, "Redigering avbruten.");
    }
  });

  refs.cancelEditTxBtn.addEventListener("click", () => {
    resetTxFormState();
    setStatus(refs.txStatus, "Redigering avbruten.");
  });
  if (refs.toggleReferenceBox) {
    refs.toggleReferenceBox.addEventListener("click", () => {
      const expanded = refs.referenceBox && !refs.referenceBox.classList.contains("hidden");
      setReferenceBoxExpanded(!expanded);
    });
  }
  if (refs.txRefFile) {
    refs.txRefFile.addEventListener("change", () => {
      const file = refs.txRefFile.files && refs.txRefFile.files[0];
      if (file) {
        setReferenceHint(`Vald fil: ${file.name}`);
        updateReferenceMeta(file);
      } else {
        updateReferenceMeta(null);
      }
    });
  }

  refs.memberForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addMember();
  });

  refs.invoiceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createInvoice();
  });
  refs.exportInvoicesCsvBtn.addEventListener("click", exportInvoicesCsv);
  refs.printInvoicesBtn.addEventListener("click", printInvoicesPdf);

  if (refs.activityForm) {
    refs.activityForm.addEventListener("submit", (event) => {
      event.preventDefault();
      addActivity();
    });
  }

  refs.pinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updatePins();
  });

  refs.accountForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addAccount();
  });
  refs.exportAccountsBtn.addEventListener("click", exportAccountsJson);
  refs.importAccountsBtn.addEventListener("click", () => refs.importAccountsFile.click());
  refs.importAccountsFile.addEventListener("change", importAccountsJson);

  refs.monthFilter.addEventListener("change", renderAll);
  refs.txSearch.addEventListener("input", renderTransactions);
  refs.lockMonthBtn.addEventListener("click", lockSelectedMonth);
  refs.unlockMonthBtn.addEventListener("click", unlockSelectedMonth);
  refs.invoiceSearch.addEventListener("input", renderInvoices);
  refs.invoiceFilterStatus.addEventListener("change", renderInvoices);
  if (refs.seedBtn) {
    refs.seedBtn.addEventListener("click", seedDemo);
  }
  if (refs.wipeBtn) {
    refs.wipeBtn.addEventListener("click", wipeAll);
  }
  if (refs.exportExcelBtn) {
    refs.exportExcelBtn.addEventListener("click", exportExcel);
  }
  refs.exportCsvBtn.addEventListener("click", exportCsv);
  refs.exportBackupBtn.addEventListener("click", exportFullBackup);
  refs.importBackupBtn.addEventListener("click", () => refs.importBackupFile.click());
  refs.importBackupFile.addEventListener("change", importFullBackup);
  refs.integrationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveIntegrations();
  });

  if (refs.undoToastBtn) {
    refs.undoToastBtn.addEventListener("click", applyUndoAction);
  }
  if (refs.onboardingCloseBtn) {
    refs.onboardingCloseBtn.addEventListener("click", () => closeOnboarding(true));
  }
  if (refs.onboardingLaterBtn) {
    refs.onboardingLaterBtn.addEventListener("click", () => closeOnboarding(false));
  }
}

function login() {
  const role = refs.authRole.value;
  const pin = refs.authPin.value.trim();

  if (!pins[role] || pin !== pins[role]) {
    setStatus(refs.authStatus, "Fel roll eller PIN.");
    return;
  }

  session = { role, label: authLabels[role] || role };
  saveSession();
  refs.authForm.reset();
  setStatus(refs.authStatus, "");
  applyAuthUi();
  renderAll();
  showOnboardingIfNeeded();
}

function logout() {
  session = null;
  localStorage.removeItem(SESSION_KEY);
  closeOnboarding(false);
  applyAuthUi();
}

function applyAuthUi() {
  const loggedIn = Boolean(session);

  refs.authScreen.classList.toggle("hidden", loggedIn);
  refs.appRoot.classList.toggle("hidden", !loggedIn);

  if (!loggedIn) {
    if (refs.roleHint) {
      refs.roleHint.classList.add("hidden");
    }
    return;
  }

  if (refs.currentUser) {
    refs.currentUser.textContent = `Inloggad: ${session.label}`;
  }

  const admin = isAdmin();
  const invoiceManager = canManageInvoices();
  const readOnly = false;
  refs.memberPanel.classList.toggle("hidden", !admin);
  refs.invoicePanel.classList.toggle("hidden", !invoiceManager);
  if (refs.activityPanel) {
    refs.activityPanel.classList.toggle("hidden", !admin);
  }
  refs.securityPanel.classList.toggle("hidden", !admin);
  refs.accountsPanel.classList.toggle("hidden", !admin);
  refs.backupPanel.classList.toggle("hidden", !admin);
  refs.integrationPanel.classList.toggle("hidden", !admin);
  if (refs.wipeBtn) {
    refs.wipeBtn.classList.toggle("hidden", !admin);
  }
  if (refs.seedBtn) {
    refs.seedBtn.classList.toggle("hidden", !admin);
  }
  refs.lockMonthBtn.disabled = !admin;
  refs.unlockMonthBtn.disabled = !admin;
  refs.transactionForm.querySelectorAll("input, select, button").forEach((node) => {
    node.disabled = readOnly;
  });
  if (refs.exportExcelBtn) {
    refs.exportExcelBtn.disabled = false;
  }
  refs.exportCsvBtn.disabled = false;
  renderRoleHint();
  renderTopStatusBar();
}

function hydrateCategorySelect() {
  const type = refs.txType.value;
  const categories = accountsByType[type] || [];
  refs.txCategory.innerHTML = "";
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = `${category.code}|${category.name}`;
    option.textContent = `${category.code} - ${category.name}`;
    refs.txCategory.append(option);
  }
}

async function addOrUpdateTransaction() {
  if (!canEditFinance()) {
    setStatus(refs.txStatus, "Du har läsbehörighet.");
    return;
  }

  const validation = validateTransactionForm();
  if (!validation.valid) {
    setStatus(refs.txStatus, "Kontrollera markerade fält.");
    return;
  }
  const amount = validation.amount;

  const selectedAccount = parseAccountValue(refs.txCategory.value);
  const newReference = await buildTransactionReference(editingTxId ? state.transactions.find((entry) => entry.id === editingTxId) : null);
  if (newReference === null) {
    return;
  }

  if (isMonthLocked(refs.txDate.value.slice(0, 7))) {
    setStatus(refs.txStatus, "Vald månad är låst.");
    return;
  }

  if (editingTxId) {
    const target = state.transactions.find((entry) => entry.id === editingTxId);
    if (!target) {
      setStatus(refs.txStatus, "Posten kunde inte hittas för uppdatering.");
      resetTxFormState();
      renderAll();
      return;
    }
    const beforeState = { ...target };

    target.date = refs.txDate.value;
    target.type = refs.txType.value;
    target.amount = amount;
    target.category = selectedAccount.name;
    target.accountCode = selectedAccount.code;
    target.accountName = selectedAccount.name;
    target.description = refs.txDesc.value.trim();
    target.referenceType = newReference.referenceType;
    target.referenceName = newReference.referenceName;
    target.referenceDataUrl = newReference.referenceDataUrl;
    target.referenceMimeType = newReference.referenceMimeType;
    addAuditLog(
      "Uppdaterade bokföringspost",
      `${target.date} ${formatAccountLabel(target)} ${formatMoney(target.amount)}`
    );

    saveState();
    rememberLastEntryDefaults(target);
    resetTxFormState();
    clearTxErrors();
    setStatus(refs.txStatus, "Post uppdaterad.");
    queueUndo(
      "Post uppdaterad.",
      () => {
        Object.assign(target, beforeState);
        saveState();
        renderAll();
      }
    );
    renderAll();
    return;
  }

  const tx = {
    id: crypto.randomUUID(),
    voucherNo: buildVoucherNumber(refs.txDate.value),
    date: refs.txDate.value,
    type: refs.txType.value,
    amount,
    category: selectedAccount.name,
    accountCode: selectedAccount.code,
    accountName: selectedAccount.name,
    description: refs.txDesc.value.trim(),
    referenceType: newReference.referenceType,
    referenceName: newReference.referenceName,
    referenceDataUrl: newReference.referenceDataUrl,
    referenceMimeType: newReference.referenceMimeType,
  };
  state.transactions.push(tx);
  addAuditLog(
    "Skapade bokföringspost",
    `${refs.txDate.value} ${selectedAccount.code} - ${selectedAccount.name} ${formatMoney(amount)}`
  );

  saveState();
  rememberLastEntryDefaults(tx);
  resetTxFormState();
  clearTxErrors();
  setStatus(refs.txStatus, "Post sparad.");
  queueUndo("Post sparad.", () => {
    state.transactions = state.transactions.filter((item) => item.id !== tx.id);
    saveState();
    renderAll();
  });
  renderAll();
}

function startEditTransaction(id) {
  if (!canEditFinance()) {
    return;
  }
  const target = state.transactions.find((entry) => entry.id === id);
  if (!target) {
    return;
  }

  editingTxId = id;
  refs.txDate.value = target.date;
  refs.txType.value = target.type;
  hydrateCategorySelect();

  const accountLabel = formatAccountLabel(target);
  const accountValue = accountValueFromEntry(target);
  if (![...refs.txCategory.options].some((option) => option.value === accountValue)) {
    const extra = document.createElement("option");
    extra.value = accountValue;
    extra.textContent = accountLabel;
    refs.txCategory.append(extra);
  }

  refs.txCategory.value = accountValue;
  refs.txAmount.value = String(target.amount).replace(".", ",");
  refs.txDesc.value = target.description;
  refs.txRefType.value = target.referenceType || "none";
  refs.txRefClear.checked = false;
  setReferenceHint(
    target.referenceDataUrl
      ? `Befintlig referens: ${target.referenceName || "Bilaga"}`
      : "Ingen referens bifogad."
  );
  updateReferenceMeta(target.referenceDataUrl ? { name: target.referenceName || "Bilaga", size: 0, type: target.referenceMimeType || "" } : null);
  setReferenceBoxExpanded(true);

  refs.saveTxBtn.textContent = "Uppdatera post";
  refs.cancelEditTxBtn.classList.remove("hidden");
  setStatus(refs.txStatus, "Redigerar vald post.");
  refs.transactionForm.scrollIntoView({ behavior: "smooth", block: "start" });
  refs.txAmount.focus();
}

function resetTxFormState() {
  editingTxId = null;
  refs.transactionForm.reset();
  refs.txDate.value = toDateInput(new Date());
  refs.txType.value = "income";
  hydrateCategorySelect();
  refs.txRefType.value = "none";
  refs.txRefClear.checked = false;
  refs.txRefFile.value = "";
  setReferenceHint("Ingen referens vald.");
  updateReferenceMeta(null);
  setReferenceBoxExpanded(false);
  refs.saveTxBtn.textContent = "Spara post";
  refs.cancelEditTxBtn.classList.add("hidden");
  applyLastEntryDefaults();
}

function addMember() {
  if (!isAdmin()) {
    setStatus(refs.memberStatus, "Endast admin kan ändra medlemsregister.");
    return;
  }

  const name = refs.memberName.value.trim();
  const email = refs.memberEmail.value.trim().toLowerCase();

  if (!name || !email) {
    setStatus(refs.memberStatus, "Fyll i namn och e-post.");
    return;
  }

  if (state.members.some((item) => item.email === email)) {
    setStatus(refs.memberStatus, "E-post finns redan i medlemslistan.");
    return;
  }

  state.members.push({
    id: crypto.randomUUID(),
    name,
    email,
    role: refs.memberRole.value,
  });

  saveState();
  refs.memberForm.reset();
  refs.memberRole.value = "Spelare";
  setStatus(refs.memberStatus, "Medlem tillagd.");
  renderAll();
}

function createInvoice() {
  if (!canManageInvoices()) {
    setStatus(refs.invoiceStatus, "Du saknar behörighet att skapa fakturor.");
    return;
  }

  const memberId = refs.invoiceMemberSelect.value;
  const series = refs.invoiceSeriesSelect.value === "F" ? "F" : "P";
  const amount = parseMoney(refs.invoiceAmountInput.value);
  const dueDate = refs.invoiceDueDateInput.value;
  const note = refs.invoiceNoteInput.value.trim();
  const member = state.members.find((item) => item.id === memberId);

  if (!member || !Number.isFinite(amount) || amount <= 0 || !dueDate) {
    setStatus(refs.invoiceStatus, "Välj medlem, belopp och förfallodatum.");
    return;
  }

  const invoiceNo = buildInvoiceNumber(series, dueDate || toDateInput(new Date()));
  const invoice = {
    id: crypto.randomUUID(),
    invoiceNo,
    invoiceSeries: series,
    memberId: member.id,
    memberName: member.name,
    memberEmail: member.email,
    amount,
    dueDate,
    note,
    status: "unpaid",
    createdAt: new Date().toISOString(),
    paidAt: null,
    rejectedAt: null,
    paymentTxId: null,
  };

  state.invoices.push(invoice);
  saveState();
  refs.invoiceForm.reset();
  refs.invoiceDueDateInput.value = toDateInput(addDays(new Date(), 30));
  setStatus(refs.invoiceStatus, `Faktura skapad: ${invoiceNo}`);
  addAuditLog("Skapade faktura", `${invoiceNo} ${member.name} ${formatMoney(amount)}`);
  saveState();
  renderAll();
}

function markInvoicePaid(id) {
  if (!canManageInvoices()) {
    return;
  }

  const invoice = state.invoices.find((item) => item.id === id);
  if (!invoice || invoice.status !== "unpaid") {
    return;
  }

  const paymentMonth = toDateInput(new Date()).slice(0, 7);
  if (isMonthLocked(paymentMonth)) {
    setStatus(refs.invoiceStatus, `Kan inte bokföra betalning. ${paymentMonth} är låst.`);
    return;
  }

  const incomeAccount = (accountsByType.income || []).find((a) => a.code === "3911") || (accountsByType.income || [])[0];
  const accountLabel = incomeAccount ? `${incomeAccount.code} - ${incomeAccount.name}` : "3911 - Medlemsavgifter";
  const paymentDescriptionPreview = invoice.note
    ? `Betald faktura ${invoice.invoiceNo} - ${invoice.memberName} (${invoice.note})`
    : `Betald faktura ${invoice.invoiceNo} - ${invoice.memberName}`;
  const confirmText = [
    "Bekräfta bokföring av betald faktura:",
    `Faktura: ${invoice.invoiceNo}`,
    `Belopp: ${formatMoney(invoice.amount)}`,
    `Konto: ${accountLabel}`,
    `Beskrivning: ${paymentDescriptionPreview}`,
    "Bilaga: PDF-faktura bifogas som referens",
    "",
    "Fortsätt?",
  ].join("\n");
  if (!window.confirm(confirmText)) {
    return;
  }

  invoice.status = "paid";
  invoice.paidAt = new Date().toISOString();

  const existingPaymentTx = invoice.paymentTxId
    ? state.transactions.find((entry) => entry.id === invoice.paymentTxId)
    : null;
  const invoiceAttachment = buildInvoiceReferenceAttachment(invoice);
  if (!existingPaymentTx) {
    const paymentDate = invoice.paidAt ? invoice.paidAt.slice(0, 10) : toDateInput(new Date());
    const paymentDescription = invoice.note
      ? `Betald faktura ${invoice.invoiceNo} - ${invoice.memberName} (${invoice.note})`
      : `Betald faktura ${invoice.invoiceNo} - ${invoice.memberName}`;
    const tx = {
      id: crypto.randomUUID(),
      voucherNo: buildVoucherNumber(paymentDate),
      date: paymentDate,
      type: "income",
      amount: invoice.amount,
      category: incomeAccount ? incomeAccount.name : "Medlemsavgifter",
      accountCode: incomeAccount ? incomeAccount.code : "3911",
      accountName: incomeAccount ? incomeAccount.name : "Medlemsavgifter",
      description: paymentDescription,
      referenceType: "invoice",
      referenceName: invoiceAttachment.referenceName,
      referenceDataUrl: invoiceAttachment.referenceDataUrl,
      referenceMimeType: invoiceAttachment.referenceMimeType,
    };
    state.transactions.push(tx);
    invoice.paymentTxId = tx.id;
  } else if (!existingPaymentTx.referenceDataUrl) {
    existingPaymentTx.referenceType = "invoice";
    existingPaymentTx.referenceName = invoiceAttachment.referenceName;
    existingPaymentTx.referenceDataUrl = invoiceAttachment.referenceDataUrl;
    existingPaymentTx.referenceMimeType = invoiceAttachment.referenceMimeType;
  }

  addAuditLog("Markerade faktura som betald", `${invoice.invoiceNo} ${invoice.memberName}`);
  setStatus(
    refs.invoiceStatus,
    `Faktura markerad som betald och bokförd på konto ${incomeAccount?.code || "3911"}.`
  );
  saveState();
  renderAll();
}

function buildInvoiceReferenceAttachment(invoice) {
  const pdfDataUrl = buildInvoicePdfDataUrl(invoice);
  return {
    referenceName: `${invoice.invoiceNo}.pdf`,
    referenceDataUrl: pdfDataUrl,
    referenceMimeType: "application/pdf",
  };
}

function rejectInvoice(id) {
  if (!canManageInvoices()) {
    return;
  }

  const invoice = state.invoices.find((item) => item.id === id);
  if (!invoice || invoice.status !== "unpaid") {
    return;
  }

  invoice.status = "rejected";
  invoice.rejectedAt = new Date().toISOString();
  addAuditLog("Avvisade faktura", `${invoice.invoiceNo} ${invoice.memberName}`);
  saveState();
  renderAll();
}

async function copyInvoiceText(id) {
  const invoice = state.invoices.find((item) => item.id === id);
  if (!invoice) {
    return;
  }

  const text = [
    `Faktura: ${invoice.invoiceNo}`,
    `Medlem: ${invoice.memberName}`,
    `E-post: ${invoice.memberEmail}`,
    `Belopp: ${formatMoney(invoice.amount)}`,
    `Förfallodatum: ${formatDate(invoice.dueDate)}`,
    `Status: ${invoice.status === "paid" ? "Betald" : invoice.status === "rejected" ? "Avvisad" : "Obetald"}`,
    state.settings.bankgiro ? `Bankgiro: ${state.settings.bankgiro}` : "",
    state.settings.swishNumber ? `Swish: ${state.settings.swishNumber}` : "",
    `Swish-meddelande: ${getSwishMessage(invoice)}`,
    invoice.note ? `Notering: ${invoice.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await navigator.clipboard.writeText(text);
    setStatus(refs.invoiceStatus, `Fakturatext kopierad: ${invoice.invoiceNo}`);
  } catch {
    setStatus(refs.invoiceStatus, "Kunde inte kopiera fakturatext.");
  }
}

function exportInvoicesCsv() {
  if (!canManageInvoices()) {
    setStatus(refs.invoiceStatus, "Du saknar behörighet att exportera fakturor.");
    return;
  }

  const rows = [...state.invoices].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (!rows.length) {
    setStatus(refs.invoiceStatus, "Inga fakturor att exportera.");
    return;
  }

  const head = [
    "FakturaNr",
    "Medlem",
    "E-post",
    "Belopp",
    "Förfallodatum",
    "Status",
    "Skapad",
    "Betald",
    "Notering",
  ];

  const lines = rows.map((invoice) => [
    invoice.invoiceNo,
    invoice.memberName,
    invoice.memberEmail,
    String(invoice.amount).replace(".", ","),
    invoice.dueDate,
    invoice.status === "paid" ? "Betald" : invoice.status === "rejected" ? "Avvisad" : "Obetald",
    invoice.createdAt,
    invoice.paidAt || "",
    invoice.note || "",
  ]);

  const csv = [head, ...lines]
    .map((cols) => cols.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `essinge-rovers-fakturor-${toDateInput(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus(refs.invoiceStatus, "Fakturor exporterade till CSV.");
}

function printInvoicesPdf() {
  if (!canManageInvoices()) {
    setStatus(refs.invoiceStatus, "Du saknar behörighet att skriva ut fakturor.");
    return;
  }

  const rows = [...state.invoices].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (!rows.length) {
    setStatus(refs.invoiceStatus, "Inga fakturor att skriva ut.");
    return;
  }

  const htmlRows = rows
    .map(
      (invoice) => `
      <tr>
        <td>${escapeHtml(invoice.invoiceNo)}</td>
        <td>${escapeHtml(invoice.memberName)}</td>
        <td>${escapeHtml(invoice.memberEmail)}</td>
        <td>${escapeHtml(formatMoney(invoice.amount))}</td>
        <td>${escapeHtml(formatDate(invoice.dueDate))}</td>
        <td>${invoice.status === "paid" ? "Betald" : invoice.status === "rejected" ? "Avvisad" : "Obetald"}</td>
        <td>${escapeHtml(invoice.note || "")}</td>
      </tr>`
    )
    .join("");

  const popup = window.open("", "_blank");
  if (!popup) {
    setStatus(refs.invoiceStatus, "Kunde inte öppna utskriftsfonster (popup blockerad).");
    return;
  }

  popup.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Fakturor medlemsavgift</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          h1 { margin: 0 0 6px; font-size: 22px; }
          p { margin: 0 0 16px; color: #444; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: left; vertical-align: top; }
          th { background: #f3f3f3; }
        </style>
      </head>
      <body>
        <h1>Essinge Rovers IK - Fakturor medlemsavgift</h1>
        <p>Utskriftsdatum: ${escapeHtml(formatDateTime(new Date().toISOString()))}</p>
        <table>
          <thead>
            <tr>
              <th>FakturaNr</th>
              <th>Medlem</th>
              <th>E-post</th>
              <th>Belopp</th>
              <th>Förfallodatum</th>
              <th>Status</th>
              <th>Notering</th>
            </tr>
          </thead>
          <tbody>${htmlRows}</tbody>
        </table>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
  setStatus(refs.invoiceStatus, "Utskriftsdialog öppnad för fakturalistan. Välj Spara som PDF.");
}

function printSingleInvoicePdf(id) {
  if (!canManageInvoices()) {
    setStatus(refs.invoiceStatus, "Du saknar behörighet att skriva ut fakturor.");
    return;
  }

  const invoice = state.invoices.find((item) => item.id === id);
  if (!invoice) {
    setStatus(refs.invoiceStatus, "Fakturan hittades inte.");
    return;
  }

  const popup = window.open("", "_blank");
  if (!popup) {
    setStatus(refs.invoiceStatus, "Kunde inte öppna utskriftsfonster (popup blockerad).");
    return;
  }

  popup.document.write(buildSingleInvoiceHtml(invoice));

  popup.document.close();
  popup.focus();
  popup.print();
  setStatus(refs.invoiceStatus, `Separat faktura klar för utskrift: ${invoice.invoiceNo}`);
}

function buildSingleInvoiceHtml(invoice) {
  const paymentMessage = getSwishMessage(invoice);
  const clubName = escapeHtml(state.settings.clubName || "Essinge Rovers IK");
  const orgNo = escapeHtml(state.settings.orgNo || "-");
  const bankgiro = escapeHtml(state.settings.bankgiro || "-");
  const plusgiro = escapeHtml(state.settings.plusgiro || "-");
  const bankAccount = escapeHtml(state.settings.bankAccount || "-");
  const swish = escapeHtml(state.settings.swishNumber || "-");
  const swishRecipient = escapeHtml(state.settings.swishRecipient || state.settings.clubName || "Essinge Rovers IK");
  const invoiceDate = invoice.createdAt ? String(invoice.createdAt).slice(0, 10) : toDateInput(new Date());

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Faktura ${escapeHtml(invoice.invoiceNo)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; margin: 0; padding: 26px; }
          .invoice { max-width: 850px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; }
          .top { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 16px; }
          .box h1 { margin: 0 0 8px; font-size: 28px; }
          .box p { margin: 2px 0; font-size: 13px; color: #333; }
          .meta { text-align: right; }
          .meta .fact-no { font-size: 20px; font-weight: 800; color: #0b2f6b; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #d7d7d7; padding: 10px; text-align: left; vertical-align: top; }
          th { background: #f4f6fb; font-size: 12px; color: #334; }
          .sum { margin-top: 14px; display: flex; justify-content: flex-end; }
          .sum-box { min-width: 280px; border: 1px solid #d7d7d7; border-radius: 8px; padding: 12px; }
          .sum-row { display: flex; justify-content: space-between; margin: 6px 0; }
          .sum-row.total { font-weight: 800; font-size: 18px; border-top: 1px solid #ddd; padding-top: 8px; }
          .pay { margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .pay-card { border: 1px solid #d7d7d7; border-radius: 8px; padding: 12px; }
          .pay-card h3 { margin: 0 0 8px; font-size: 15px; }
          .pay-card p { margin: 4px 0; font-size: 13px; }
          .hint { margin-top: 14px; font-size: 12px; color: #555; }
          @media print { body { padding: 0; } .invoice { border: none; } }
        </style>
      </head>
      <body>
        <article class="invoice">
          <section class="top">
            <div class="box">
              <h1>FAKTURA</h1>
              <p><strong>${clubName}</strong></p>
              <p>Org.nr: ${orgNo}</p>
            </div>
            <div class="box meta">
              <div class="fact-no">${escapeHtml(invoice.invoiceNo)}</div>
              <p>Fakturadatum: ${escapeHtml(formatDate(invoiceDate))}</p>
              <p>Förfallodatum: ${escapeHtml(formatDate(invoice.dueDate))}</p>
            </div>
          </section>

          <section>
            <p><strong>Fakturamottagare</strong></p>
            <p>${escapeHtml(invoice.memberName)}</p>
            <p>${escapeHtml(invoice.memberEmail)}</p>
          </section>

          <table>
            <thead>
              <tr>
                <th>Artikel</th>
                <th>Specifikation</th>
                <th>Belopp</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Medlemsavgift</td>
                <td>${escapeHtml(invoice.note || "Medlemsavgift enligt föreningsbeslut")}<br/>Referens: ${escapeHtml(invoice.invoiceNo)}</td>
                <td>${escapeHtml(formatMoney(invoice.amount))}</td>
              </tr>
            </tbody>
          </table>

          <div class="sum">
            <div class="sum-box">
              <div class="sum-row"><span>Att betala</span><span>${escapeHtml(formatMoney(invoice.amount))}</span></div>
              <div class="sum-row total"><span>Totalt</span><span>${escapeHtml(formatMoney(invoice.amount))}</span></div>
            </div>
          </div>

          <section class="pay">
            <div class="pay-card">
              <h3>Betala via bank</h3>
              <p>Bankgiro: <strong>${bankgiro}</strong></p>
              <p>Plusgiro: <strong>${plusgiro}</strong></p>
              <p>Bankkonto: <strong>${bankAccount}</strong></p>
              <p>Ange referens: <strong>${escapeHtml(invoice.invoiceNo)}</strong></p>
            </div>
            <div class="pay-card">
              <h3>Betala via Swish</h3>
              <p>Swishnummer: <strong>${swish}</strong></p>
              <p>Mottagare: <strong>${swishRecipient}</strong></p>
              <p>Meddelande: <strong>${escapeHtml(paymentMessage)}</strong></p>
            </div>
          </section>
          <p class="hint">Ange alltid fakturanummer eller swishmeddelande exakt för att betalningen ska matchas automatiskt.</p>
        </article>
      </body>
    </html>
  `;
}

function buildInvoicePdfDataUrl(invoice) {
  const paymentMessage = getSwishMessage(invoice);
  const invoiceDate = invoice.createdAt ? String(invoice.createdAt).slice(0, 10) : toDateInput(new Date());
  const clubName = normalizeMojibakeText(state.settings.clubName || "Essinge Rovers IK");
  const orgNo = normalizeMojibakeText(state.settings.orgNo || "-");
  const bankgiro = normalizeMojibakeText(state.settings.bankgiro || "-");
  const plusgiro = normalizeMojibakeText(state.settings.plusgiro || "-");
  const bankAccount = normalizeMojibakeText(state.settings.bankAccount || "-");
  const swish = normalizeMojibakeText(state.settings.swishNumber || "-");
  const swishRecipient = normalizeMojibakeText(state.settings.swishRecipient || state.settings.clubName || "Essinge Rovers IK");
  const note = normalizeMojibakeText(invoice.note || "Medlemsavgift enligt föreningsbeslut");

  const W = 595;
  const H = 842;
  const stream = [];
  const add = (line) => stream.push(line);
  const drawRect = (x, y, w, h) => add(`${x} ${y} ${w} ${h} re S`);
  const drawLine = (x1, y1, x2, y2) => add(`${x1} ${y1} m ${x2} ${y2} l S`);
  const text = (x, y, size, value, bold = false) => {
    const font = bold ? "/F2" : "/F1";
    add("BT");
    add(`${font} ${size} Tf`);
    add(`1 0 0 1 ${x} ${y} Tm`);
    add(`<${toWinAnsiHex(normalizeMojibakeText(value))}> Tj`);
    add("ET");
  };
  const wrapText = (value, maxChars = 58) => {
    const words = String(value || "").split(/\s+/).filter(Boolean);
    const rows = [];
    let row = "";
    for (const word of words) {
      const candidate = row ? `${row} ${word}` : word;
      if (candidate.length <= maxChars) {
        row = candidate;
      } else {
        if (row) {
          rows.push(row);
        }
        row = word;
      }
    }
    if (row) {
      rows.push(row);
    }
    return rows.length ? rows : [""];
  };

  add("0.8 w");
  drawRect(26, 26, W - 52, H - 52);
  drawLine(26, H - 120, W - 26, H - 120);

  text(46, H - 78, 28, "FAKTURA", true);
  text(46, H - 96, 12, clubName, true);
  text(46, H - 112, 10, `Org.nr: ${orgNo}`);

  text(370, H - 78, 11, normalizeMojibakeText(invoice.invoiceNo), true);
  text(370, H - 96, 10, `Fakturadatum: ${formatDate(invoiceDate)}`);
  text(370, H - 112, 10, `Forfallodatum: ${formatDate(invoice.dueDate)}`);

  text(46, H - 148, 11, "Fakturamottagare", true);
  text(46, H - 164, 10, normalizeMojibakeText(invoice.memberName));
  text(46, H - 178, 10, normalizeMojibakeText(invoice.memberEmail));

  const tableTop = H - 220;
  drawRect(46, tableTop - 58, W - 92, 58);
  drawLine(46, tableTop - 20, W - 46, tableTop - 20);
  drawLine(146, tableTop, 146, tableTop - 58);
  drawLine(410, tableTop, 410, tableTop - 58);
  text(52, tableTop - 14, 9, "Artikel", true);
  text(152, tableTop - 14, 9, "Specifikation", true);
  text(416, tableTop - 14, 9, "Belopp", true);
  text(52, tableTop - 38, 10, "Medlemsavgift");
  const noteRows = wrapText(`${note} Referens: ${invoice.invoiceNo}`, 40);
  text(152, tableTop - 38, 9, noteRows[0] || "");
  if (noteRows[1]) {
    text(152, tableTop - 49, 9, noteRows[1]);
  }
  text(416, tableTop - 38, 10, normalizeMojibakeText(formatMoney(invoice.amount)), true);

  const sumTop = tableTop - 92;
  drawRect(335, sumTop - 60, 214, 60);
  drawLine(335, sumTop - 30, 549, sumTop - 30);
  text(345, sumTop - 18, 10, "Att betala");
  text(466, sumTop - 18, 10, normalizeMojibakeText(formatMoney(invoice.amount)), true);
  text(345, sumTop - 50, 12, "Totalt", true);
  text(466, sumTop - 50, 12, normalizeMojibakeText(formatMoney(invoice.amount)), true);

  const cardsTop = sumTop - 84;
  drawRect(46, cardsTop - 130, 248, 130);
  drawRect(300, cardsTop - 130, 249, 130);
  text(56, cardsTop - 18, 11, "Betala via bank", true);
  text(56, cardsTop - 38, 10, `Bankgiro: ${bankgiro}`);
  text(56, cardsTop - 54, 10, `Plusgiro: ${plusgiro}`);
  text(56, cardsTop - 70, 10, `Bankkonto: ${bankAccount}`);
  text(56, cardsTop - 86, 10, `Referens: ${invoice.invoiceNo}`);

  text(310, cardsTop - 18, 11, "Betala via Swish", true);
  text(310, cardsTop - 38, 10, `Swishnummer: ${swish}`);
  text(310, cardsTop - 54, 10, `Mottagare: ${swishRecipient}`);
  const swishRows = wrapText(`Meddelande: ${paymentMessage}`, 30);
  text(310, cardsTop - 70, 10, swishRows[0] || "");
  if (swishRows[1]) {
    text(310, cardsTop - 84, 10, swishRows[1]);
  }

  const hintRows = wrapText(
    "Ange alltid fakturanummer eller swishmeddelande exakt for att betalningen ska matchas automatiskt.",
    90
  );
  text(46, 70, 9, hintRows[0]);
  if (hintRows[1]) {
    text(46, 58, 9, hintRows[1]);
  }

  const streamContent = stream.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return `data:application/pdf;base64,${btoa(pdf)}`;
}

function toWinAnsiHex(text) {
  const bytes = [];
  for (const ch of String(text || "")) {
    const code = ch.charCodeAt(0);
    bytes.push(code <= 255 ? code : 63);
  }
  return bytes.map((byte) => byte.toString(16).padStart(2, "0").toUpperCase()).join("");
}

function addActivity() {
  if (!refs.activityForm || !refs.activityDate || !refs.activityType || !refs.activityNote || !refs.activityStatus) {
    return;
  }

  if (!isAdmin()) {
    setStatus(refs.activityStatus, "Endast admin kan ändra aktiviteter.");
    return;
  }

  const note = refs.activityNote.value.trim();
  if (!refs.activityDate.value || !note) {
    setStatus(refs.activityStatus, "Fyll i datum och notering.");
    return;
  }

  state.activities.push({
    id: crypto.randomUUID(),
    date: refs.activityDate.value,
    type: refs.activityType.value,
    note,
  });

  saveState();
  refs.activityForm.reset();
  refs.activityDate.value = toDateInput(new Date());
  refs.activityType.value = "Träning";
  setStatus(refs.activityStatus, "Aktivitet tillagd.");
  renderAll();
}

function updatePins() {
  if (!isAdmin()) {
    setStatus(refs.pinStatus, "Endast admin kan byta PIN.");
    return;
  }

  const adminPin = refs.adminPinInput.value.trim();

  if (!isValidPin(adminPin)) {
    setStatus(refs.pinStatus, "PIN måste vara 4-8 siffror.");
    return;
  }

  pins = {
    admin: adminPin,
  };
  addAuditLog("Bytte PIN-kod", "Admin uppdaterade Admin PIN");

  savePins();
  refs.pinForm.reset();
  setStatus(refs.pinStatus, "Admin PIN uppdaterad.");
  renderAuthPinHint();
}

function addAccount() {
  if (!isAdmin()) {
    setStatus(refs.accountStatus, "Endast admin kan ändra kontoplan.");
    return;
  }

  const type = refs.accountTypeInput.value;
  const code = refs.accountCodeInput.value.trim();
  const name = refs.accountNameInput.value.trim();

  if (!/^\d{3,6}$/.test(code) || !name) {
    setStatus(refs.accountStatus, "Ange giltig kontokod (3-6 siffror) och namn.");
    return;
  }

  const exists = (accountsByType[type] || []).some((item) => item.code === code);
  if (exists) {
    setStatus(refs.accountStatus, "Kontokoden finns redan för vald typ.");
    return;
  }

  accountsByType[type].push({ code, name });
  accountsByType[type].sort((a, b) => a.code.localeCompare(b.code));
  saveAccounts();
  hydrateCategorySelect();
  renderAccounts();
  refs.accountForm.reset();
  refs.accountTypeInput.value = "income";
  setStatus(refs.accountStatus, "Konto tillagt.");
  addAuditLog("Lade till konto", `${type === "income" ? "Intäkt" : "Utgift"} ${code} - ${name}`);
  saveState();
  renderAuditLog();
}

function removeAccount(type, code) {
  if (!isAdmin()) {
    return;
  }

  const list = accountsByType[type] || [];
  const target = list.find((item) => item.code === code);
  if (!target) {
    return;
  }

  accountsByType[type] = list.filter((item) => item.code !== code);
  saveAccounts();
  hydrateCategorySelect();
  renderAccounts();
  addAuditLog("Tog bort konto", `${type === "income" ? "Intäkt" : "Utgift"} ${target.code} - ${target.name}`);
  saveState();
  renderAuditLog();
}

function editAccount(type, code) {
  if (!isAdmin()) {
    return;
  }

  const list = accountsByType[type] || [];
  const target = list.find((item) => item.code === code);
  if (!target) {
    return;
  }

  const nextCodeRaw = window.prompt("Ange ny kontokod (3-6 siffror):", target.code);
  if (nextCodeRaw === null) {
    return;
  }
  const nextCode = nextCodeRaw.trim();

  const nextNameRaw = window.prompt("Ange nytt kontonamn:", target.name);
  if (nextNameRaw === null) {
    return;
  }
  const nextName = nextNameRaw.trim();

  if (!/^\d{3,6}$/.test(nextCode) || !nextName) {
    setStatus(refs.accountStatus, "Ange giltig kontokod (3-6 siffror) och namn.");
    return;
  }

  const duplicate = list.some((item) => item.code === nextCode && item.code !== target.code);
  if (duplicate) {
    setStatus(refs.accountStatus, "Kontokoden finns redan för vald typ.");
    return;
  }

  const oldCode = target.code;
  const oldName = target.name;
  target.code = nextCode;
  target.name = nextName;

  for (const tx of state.transactions) {
    if (tx.type === type && tx.accountCode === oldCode) {
      tx.accountCode = nextCode;
      tx.accountName = nextName;
      tx.category = nextName;
    }
  }

  accountsByType[type].sort((a, b) => a.code.localeCompare(b.code));
  saveAccounts();
  hydrateCategorySelect();
  renderAccounts();
  setStatus(refs.accountStatus, "Konto uppdaterat.");
  addAuditLog(
    "Uppdaterade konto",
    `${type === "income" ? "Intäkt" : "Utgift"} ${oldCode} - ${oldName} -> ${nextCode} - ${nextName}`
  );
  saveState();
  renderAuditLog();
}

function exportAccountsJson() {
  if (!isAdmin()) {
    setStatus(refs.accountStatus, "Endast admin kan exportera kontoplan.");
    return;
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    accountsByType,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "essinge-rovers-kontoplan.json";
  link.click();
  URL.revokeObjectURL(url);
  setStatus(refs.accountStatus, "Kontoplan exporterad.");
}

function importAccountsJson(event) {
  if (!isAdmin()) {
    setStatus(refs.accountStatus, "Endast admin kan importera kontoplan.");
    return;
  }

  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || ""));
      const candidate = parsed && parsed.accountsByType ? parsed.accountsByType : parsed;

      const imported = {
        income: normalizeAccountsList(candidate.income, defaultAccountsByType.income),
        expense: normalizeAccountsList(candidate.expense, defaultAccountsByType.expense),
      };

      if (!imported.income.length || !imported.expense.length) {
        setStatus(refs.accountStatus, "Import misslyckades: filen saknar giltig kontoplan.");
        return;
      }

      const ok = window.confirm("Import ersätter nuvarande kontoplan. Vill du fortsätta?");
      if (!ok) {
        return;
      }

      accountsByType = imported;
      saveAccounts();
      hydrateCategorySelect();
      renderAccounts();
      addAuditLog("Importerade kontoplan", `${file.name} (${imported.income.length + imported.expense.length} konton)`);
      saveState();
      renderAuditLog();
      setStatus(refs.accountStatus, "Kontoplan importerad.");
    } catch {
      setStatus(refs.accountStatus, "Import misslyckades: ogiltig JSON-fil.");
    } finally {
      refs.importAccountsFile.value = "";
    }
  };

  reader.onerror = () => {
    setStatus(refs.accountStatus, "Import misslyckades: kunde inte läsa filen.");
    refs.importAccountsFile.value = "";
  };

  reader.readAsText(file, "utf-8");
}

function removeTransaction(id) {
  if (!canEditFinance()) {
    return;
  }

  if (editingTxId === id) {
    resetTxFormState();
  }

  const removed = state.transactions.find((item) => item.id === id);
  if (removed && isMonthLocked(removed.date.slice(0, 7))) {
    setStatus(refs.txStatus, "Kan inte ta bort post i låst månad.");
    return;
  }
  state.transactions = state.transactions.filter((item) => item.id !== id);
  if (removed) {
    addAuditLog(
      "Tog bort bokföringspost",
      `${removed.date} ${formatAccountLabel(removed)} ${formatMoney(removed.amount)}`
    );
  }
  saveState();
  if (removed) {
    queueUndo("Post borttagen.", () => {
      state.transactions.push(removed);
      saveState();
      renderAll();
    });
  }
  setStatus(refs.txStatus, removed ? "Post borttagen." : "");
  renderAll();
}

function removeMember(id) {
  if (!isAdmin()) {
    return;
  }

  const removed = state.members.find((item) => item.id === id);
  state.members = state.members.filter((item) => item.id !== id);
  if (removed) {
    addAuditLog("Tog bort medlem", `${removed.name} (${removed.email})`);
  }
  saveState();
  renderAll();
}

function removeActivity(id) {
  if (!isAdmin()) {
    return;
  }

  const removed = state.activities.find((item) => item.id === id);
  state.activities = state.activities.filter((item) => item.id !== id);
  if (removed) {
    addAuditLog("Tog bort aktivitet", `${removed.date} ${removed.type}`);
  }
  saveState();
  renderAll();
}

function renderAll() {
  renderTopStatusBar();
  renderTransactions();
  renderMembers();
  renderInvoices();
  if (refs.activityList && refs.activityEmpty) {
    renderActivities();
  }
  renderAccounts();
  renderCards();
  renderKpis();
  renderReport();
  renderAuditLog();
  renderMonthLockStatus();
  updateTxFilterUi();
}

function renderInvoices() {
  const members = [...state.members].sort((a, b) => a.name.localeCompare(b.name, "sv"));
  refs.invoiceMemberSelect.innerHTML = "";
  for (const member of members) {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = `${member.name} (${member.email})`;
    refs.invoiceMemberSelect.append(option);
  }

  const now = new Date();
  const query = (refs.invoiceSearch.value || "").trim().toLowerCase();
  const statusFilter = refs.invoiceFilterStatus.value || "all";
  const sorted = [...state.invoices]
    .filter((invoice) => {
      if (!query) {
        return true;
      }
      return [invoice.invoiceNo, invoice.memberName, invoice.memberEmail].some((v) =>
        String(v || "").toLowerCase().includes(query)
      );
    })
    .filter((invoice) => {
      if (statusFilter === "all") {
        return true;
      }
      if (statusFilter === "overdue") {
        return invoice.status === "unpaid" && new Date(`${invoice.dueDate}T00:00:00`) < now;
      }
      return invoice.status === statusFilter;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  refs.invoiceList.innerHTML = "";
  const canManage = canManageInvoices();

  for (const invoice of sorted) {
    const due = new Date(`${invoice.dueDate}T00:00:00`);
    const isOverdue = invoice.status === "unpaid" && due < now;
    const isDueSoon = invoice.status === "unpaid" && !isOverdue && daysBetween(now, due) <= 7;
    const statusClass = invoice.status === "paid" ? "paid" : invoice.status === "rejected" ? "rejected" : "unpaid";
    const statusLabel = invoice.status === "paid" ? "Betald" : invoice.status === "rejected" ? "Avvisad" : "Obetald";
    const disableAllActions = invoice.status !== "unpaid";
    const item = document.createElement("li");
    item.className = "item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(invoice.invoiceNo)} - ${escapeHtml(invoice.memberName)}</strong>
        <div class="meta">${escapeHtml(invoice.memberEmail)} | ${formatMoney(invoice.amount)} | Förfaller ${formatDate(invoice.dueDate)}</div>
        <div class="meta">Status: <span class="status-chip ${statusClass}">${statusLabel}</span>${invoice.note ? ` | ${escapeHtml(invoice.note)}` : ""}${isOverdue ? ' <span class="badge overdue">Förfallen</span>' : isDueSoon ? ' <span class="badge">Förfaller snart</span>' : ""}</div>
      </div>
      <div class="actions">
        ${canManage ? `<button class="icon-btn" type="button" data-invoice-copy="${invoice.id}" ${disableAllActions ? "disabled" : ""}>Kopiera</button>` : ""}
        <button class="icon-btn" type="button" data-invoice-print="${invoice.id}">Skriv ut faktura</button>
        ${canManage ? `<button class="icon-btn" type="button" data-invoice-remind="${invoice.id}" ${disableAllActions ? "disabled" : ""}>Påminnelse</button>` : ""}
        ${canManage ? `<button class="icon-btn" type="button" data-invoice-paid="${invoice.id}" ${disableAllActions ? "disabled" : ""}>Markera betald</button>` : ""}
        ${canManage ? `<button class="icon-btn" type="button" data-invoice-reject="${invoice.id}" ${disableAllActions ? "disabled" : ""}>Avvisa</button>` : ""}
      </div>
    `;
    refs.invoiceList.append(item);
  }

  refs.invoiceList.querySelectorAll("[data-invoice-copy]").forEach((button) => {
    button.addEventListener("click", () => copyInvoiceText(button.dataset.invoiceCopy));
  });
  refs.invoiceList.querySelectorAll("[data-invoice-paid]").forEach((button) => {
    button.addEventListener("click", () => markInvoicePaid(button.dataset.invoicePaid));
  });
  refs.invoiceList.querySelectorAll("[data-invoice-print]").forEach((button) => {
    button.addEventListener("click", () => printSingleInvoicePdf(button.dataset.invoicePrint));
  });
  refs.invoiceList.querySelectorAll("[data-invoice-remind]").forEach((button) => {
    button.addEventListener("click", () => sendInvoiceReminder(button.dataset.invoiceRemind));
  });
  refs.invoiceList.querySelectorAll("[data-invoice-reject]").forEach((button) => {
    button.addEventListener("click", () => rejectInvoice(button.dataset.invoiceReject));
  });

  refs.invoiceEmpty.hidden = sorted.length > 0;
}

function renderAccounts() {
  const income = [...(accountsByType.income || [])].sort((a, b) => a.code.localeCompare(b.code));
  const expense = [...(accountsByType.expense || [])].sort((a, b) => a.code.localeCompare(b.code));

  refs.incomeAccountsList.innerHTML = "";
  refs.expenseAccountsList.innerHTML = "";

  for (const entry of income) {
    const item = document.createElement("li");
    item.className = "item";
    item.innerHTML = `
      <div><strong>${escapeHtml(entry.code)} - ${escapeHtml(entry.name)}</strong></div>
      <div class="actions">
        <button class="icon-btn edit-btn" type="button" data-account-edit="${escapeHtml(entry.code)}" data-account-type="income">Redigera</button>
        <button class="icon-btn delete-btn" type="button" data-account-remove="${escapeHtml(entry.code)}" data-account-type="income">Ta bort</button>
      </div>
    `;
    refs.incomeAccountsList.append(item);
  }

  for (const entry of expense) {
    const item = document.createElement("li");
    item.className = "item";
    item.innerHTML = `
      <div><strong>${escapeHtml(entry.code)} - ${escapeHtml(entry.name)}</strong></div>
      <div class="actions">
        <button class="icon-btn edit-btn" type="button" data-account-edit="${escapeHtml(entry.code)}" data-account-type="expense">Redigera</button>
        <button class="icon-btn delete-btn" type="button" data-account-remove="${escapeHtml(entry.code)}" data-account-type="expense">Ta bort</button>
      </div>
    `;
    refs.expenseAccountsList.append(item);
  }

  document.querySelectorAll("[data-account-edit]").forEach((button) => {
    button.addEventListener("click", () => editAccount(button.dataset.accountType, button.dataset.accountEdit));
  });

  document.querySelectorAll("[data-account-remove]").forEach((button) => {
    button.addEventListener("click", () => removeAccount(button.dataset.accountType, button.dataset.accountRemove));
  });
}

function renderAuditLog() {
  const rows = [...state.auditLog].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
  refs.auditList.innerHTML = "";

  for (const row of rows) {
    const item = document.createElement("li");
    item.className = "item";
    item.innerHTML = `
      <div>
        <div class="audit-action">${escapeHtml(row.action)}</div>
        <div class="meta">${escapeHtml(row.detail)} - ${escapeHtml(row.by)}</div>
      </div>
      <div class="audit-time">${formatDateTime(row.at)}</div>
    `;
    refs.auditList.append(item);
  }

  refs.auditEmpty.hidden = rows.length > 0;
}

function renderTransactions() {
  const month = refs.monthFilter.value;
  const query = (refs.txSearch.value || "").trim().toLowerCase();
  const filtered = month
    ? state.transactions.filter((entry) => entry.date.slice(0, 7) === month)
    : state.transactions;

  const searched = query
    ? filtered.filter((entry) =>
        [entry.description, entry.accountCode, entry.accountName, entry.voucherNo]
          .map((v) => String(v || "").toLowerCase())
          .some((v) => v.includes(query))
      )
    : filtered;
  const sorted = [...searched].sort((a, b) => b.date.localeCompare(a.date));
  refs.txBody.innerHTML = "";

  for (const entry of sorted) {
    const locked = isMonthLocked(entry.date.slice(0, 7));
    const readOnly = !canEditFinance();
    const hasReference = Boolean(entry.referenceDataUrl);
    const referenceTypeLabel =
      entry.referenceType === "invoice" ? "Faktura" : entry.referenceType === "receipt" ? "Kvitto" : "Referens";
    const referenceName = entry.referenceName || `${referenceTypeLabel.toLowerCase()}.pdf`;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(entry.date)}</td>
      <td>${escapeHtml(entry.voucherNo || "-")}</td>
      <td><span class="type-pill ${entry.type}">${entry.type === "income" ? "Intäkt" : "Utgift"}</span></td>
      <td>${escapeHtml(formatAccountLabel(entry))}</td>
      <td>${escapeHtml(entry.description)}</td>
      <td>${
        hasReference
          ? `<div style="display:flex; flex-direction:column; gap:4px;">
              <button class="icon-btn" type="button" data-tx-ref-open="${entry.id}">📎 ${referenceTypeLabel}</button>
              <span class="meta" title="${escapeHtml(referenceName)}">${escapeHtml(referenceName)}</span>
            </div>`
          : "-"
      }</td>
      <td class="right">${formatMoney(entry.amount)}</td>
      <td>
        <div class="table-actions">
          <button class="icon-btn edit-btn" type="button" data-tx-edit="${entry.id}" ${locked || readOnly ? "disabled" : ""}>Redigera</button>
          <button class="icon-btn delete-btn" type="button" data-tx-remove="${entry.id}" ${locked || readOnly ? "disabled" : ""}>Ta bort</button>
        </div>
      </td>
    `;
    refs.txBody.append(row);
  }

  refs.txBody.querySelectorAll("[data-tx-edit]").forEach((button) => {
    button.addEventListener("click", () => startEditTransaction(button.dataset.txEdit));
  });

  refs.txBody.querySelectorAll("[data-tx-remove]").forEach((button) => {
    button.addEventListener("click", () => removeTransaction(button.dataset.txRemove));
  });
  refs.txBody.querySelectorAll("[data-tx-ref-open]").forEach((button) => {
    button.addEventListener("click", () => openTransactionReference(button.dataset.txRefOpen));
  });

  refs.txEmpty.hidden = sorted.length > 0;
}

function renderMembers() {
  const sorted = [...state.members].sort((a, b) => a.name.localeCompare(b.name, "sv"));
  refs.memberList.innerHTML = "";
  const admin = isAdmin();

  for (const member of sorted) {
    const item = document.createElement("li");
    item.className = "item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(member.name)}</strong>
        <div class="meta">${escapeHtml(member.role)} - ${escapeHtml(member.email)}</div>
      </div>
      ${admin ? `<button class="icon-btn" type="button" data-member-remove="${member.id}">Ta bort</button>` : ""}
    `;
    refs.memberList.append(item);
  }

  refs.memberList.querySelectorAll("[data-member-remove]").forEach((button) => {
    button.addEventListener("click", () => removeMember(button.dataset.memberRemove));
  });

  refs.memberEmpty.hidden = sorted.length > 0;
}

function renderActivities() {
  if (!refs.activityList || !refs.activityEmpty) {
    return;
  }

  const sorted = [...state.activities].sort((a, b) => a.date.localeCompare(b.date));
  refs.activityList.innerHTML = "";

  for (const activity of sorted) {
    const item = document.createElement("li");
    item.className = "item";
    item.innerHTML = `
      <div>
        <strong>${formatDate(activity.date)} - ${escapeHtml(activity.type)}</strong>
        <div class="meta">${escapeHtml(activity.note)}</div>
      </div>
      <button class="icon-btn" type="button" data-activity-remove="${activity.id}">Ta bort</button>
    `;
    refs.activityList.append(item);
  }

  refs.activityList.querySelectorAll("[data-activity-remove]").forEach((button) => {
    button.addEventListener("click", () => removeActivity(button.dataset.activityRemove));
  });

  refs.activityEmpty.hidden = sorted.length > 0;
}

function renderCards() {
  const month = refs.monthFilter.value;
  const transactions = state.transactions;
  const monthly = month ? transactions.filter((entry) => entry.date.slice(0, 7) === month) : transactions;

  const income = monthly.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0);
  const expense = monthly.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  const balance = transactions.reduce((sum, entry) => sum + (entry.type === "income" ? entry.amount : -entry.amount), 0);

  refs.balanceCard.textContent = formatMoney(balance);
  refs.incomeCard.textContent = formatMoney(income);
  refs.expenseCard.textContent = formatMoney(expense);
  refs.memberCard.textContent = String(state.members.length);
}

function renderKpis() {
  const now = new Date();
  const unpaid = state.invoices.filter((invoice) => invoice.status === "unpaid");
  const overdue = unpaid.filter((invoice) => new Date(`${invoice.dueDate}T00:00:00`) < now);
  const overdueAmount = overdue.reduce((sum, item) => sum + item.amount, 0);
  const paid = state.invoices.filter((invoice) => invoice.status === "paid").length;
  const paidRate = state.invoices.length ? `${Math.round((paid / state.invoices.length) * 100)}%` : "0%";
  const currentMonth = refs.monthFilter.value || toDateInput(new Date()).slice(0, 7);
  const monthTx = state.transactions.filter((entry) => entry.date.slice(0, 7) === currentMonth);
  const monthNet = monthTx.reduce((sum, entry) => sum + (entry.type === "income" ? entry.amount : -entry.amount), 0);

  refs.kpiGrid.innerHTML = `
    <article class="kpi-item"><p class="label">Obetalda fakturor</p><p class="value">${unpaid.length}</p></article>
    <article class="kpi-item"><p class="label">Förfallna (belopp)</p><p class="value">${formatMoney(overdueAmount)}</p></article>
    <article class="kpi-item"><p class="label">Betalningsgrad</p><p class="value">${paidRate}</p></article>
    <article class="kpi-item"><p class="label">Netto vald månad</p><p class="value">${formatMoney(monthNet)}</p></article>
  `;
}

function renderReport() {
  const month = refs.monthFilter.value;
  const rows = month
    ? state.transactions.filter((entry) => entry.date.slice(0, 7) === month)
    : state.transactions;

  refs.reportMonth.textContent = month ? `Period: ${month}` : "Period: Alla";

  if (!rows.length) {
    refs.reportBox.innerHTML = '<p class="empty">Ingen data för vald period.</p>';
    return;
  }

  const grouped = {};
  let incomeTotal = 0;
  let expenseTotal = 0;

  for (const row of rows) {
    const code = row.accountCode || "0000";
    const name = row.accountName || row.category || "Okänt konto";
    const key = `${row.type}:${code}:${name}`;
    if (!grouped[key]) {
      grouped[key] = { type: row.type, code, name, amount: 0 };
    }
    grouped[key].amount += row.amount;

    if (row.type === "income") {
      incomeTotal += row.amount;
    } else {
      expenseTotal += row.amount;
    }
  }

  const list = Object.values(grouped).sort((a, b) => {
    if (a.type === b.type) {
      return `${a.code} ${a.name}`.localeCompare(`${b.code} ${b.name}`, "sv");
    }
    return a.type.localeCompare(b.type);
  });

  refs.reportBox.innerHTML = `
    <div class="report-grid">
      ${list
        .map(
          (row) => `
            <div class="report-row">
              <strong>${escapeHtml(`${row.code} - ${row.name}`)}</strong>
              <span>${row.type === "income" ? "Intäkt" : "Utgift"}</span>
              <strong>${formatMoney(row.amount)}</strong>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="report-total">
      <div><strong>Totala intäkter:</strong> ${formatMoney(incomeTotal)}</div>
      <div><strong>Totala utgifter:</strong> ${formatMoney(expenseTotal)}</div>
      <div><strong>Netto:</strong> ${formatMoney(incomeTotal - expenseTotal)}</div>
    </div>
  `;
}

function exportExcel() {
  if (!canUseFinance()) {
    setStatus(refs.txStatus, "Du måste vara inloggad.");
    return;
  }

  const month = refs.monthFilter.value;
  const rows = month
    ? state.transactions.filter((entry) => entry.date.slice(0, 7) === month)
    : [...state.transactions];

  if (!rows.length) {
    setStatus(refs.txStatus, "Inga poster att exportera.");
    return;
  }

  const toExportValue = (value) => normalizeMojibakeText(String(value ?? ""));
  const xmlEscape = (value) =>
    toExportValue(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  const toExcelAmount = (value) => `${Number(value || 0).toFixed(2).replace(".", ",")} kr`;
  const toExportDate = (isoDate) => {
    const date = new Date(`${isoDate}T00:00:00`);
    const parts = new Intl.DateTimeFormat("sv-SE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).formatToParts(date);
    const day = parts.find((part) => part.type === "day")?.value || "";
    const month = (parts.find((part) => part.type === "month")?.value || "").replace(".", "").toLowerCase();
    const year = parts.find((part) => part.type === "year")?.value || "";
    return `${day} ${month} ${year}`.trim();
  };

  const head = ["Datum", "Ver.nr", "Typ", "Konto", "Beskrivning", "Referens", "Belopp"];
  const lines = rows
    .sort((a, b) => (a.date === b.date ? (a.voucherNo || "").localeCompare(b.voucherNo || "") : a.date.localeCompare(b.date)))
    .map((entry) => {
      const referenceLabel =
        entry.referenceType === "invoice" ? "Faktura" : entry.referenceType === "receipt" ? "Kvitto" : "";
      const referenceValue = entry.referenceDataUrl
        ? `${referenceLabel || "Referens"}${entry.referenceName ? `: ${entry.referenceName}` : ""}`
        : "-";
      return [
        toExportDate(entry.date),
        entry.voucherNo || "",
        entry.type === "income" ? "Intäkt" : "Utgift",
        formatAccountLabel(entry),
        entry.description || "",
        referenceValue,
        toExcelAmount(entry.amount),
      ];
    });

  const csvRows = [head, ...lines];
  const xmlRows = csvRows
    .map(
      (cols) =>
        `<Row>${cols
          .map((value) => `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`)
          .join("")}</Row>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Bokföring">
    <Table>${xmlRows}</Table>
    <AutoFilter x:Range="R1C1:R1C7" xmlns="urn:schemas-microsoft-com:office:excel"/>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>1</SplitHorizontal>
      <TopRowBottomPane>1</TopRowBottomPane>
    </WorksheetOptions>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const suffix = month || "alla";
  link.href = url;
  link.download = `essinge-rovers-bokföring-${suffix}.xls`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus(refs.txStatus, "Excel-fil exporterad.");
}

function exportCsv() {
  if (!canUseFinance()) {
    setStatus(refs.txStatus, "Du måste vara inloggad.");
    return;
  }

  const month = refs.monthFilter.value;
  const rows = month
    ? state.transactions.filter((entry) => entry.date.slice(0, 7) === month)
    : [...state.transactions];
  if (!rows.length) {
    setStatus(refs.txStatus, "Inga poster att exportera.");
    return;
  }

  const head = ["Datum", "Ver.nr", "Typ", "Konto", "Beskrivning", "Referens", "Belopp"];
  const lines = rows
    .sort((a, b) => (a.date === b.date ? (a.voucherNo || "").localeCompare(b.voucherNo || "") : a.date.localeCompare(b.date)))
    .map((entry) => {
      const referenceLabel =
        entry.referenceType === "invoice" ? "Faktura" : entry.referenceType === "receipt" ? "Kvitto" : "";
      const referenceValue = entry.referenceDataUrl
        ? `${referenceLabel || "Referens"}${entry.referenceName ? `: ${entry.referenceName}` : ""}`
        : "-";
      return [
        toExportDateText(entry.date),
        entry.voucherNo || "",
        entry.type === "income" ? "Intäkt" : "Utgift",
        formatAccountLabel(entry),
        entry.description || "",
        referenceValue,
        `${Number(entry.amount || 0).toFixed(2).replace(".", ",")} kr`,
      ];
    });

  const csv = [head, ...lines]
    .map((cols) => cols.map((value) => `"${String(value || "").replaceAll('"', '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `essinge-rovers-bokföring-${month || "alla"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus(refs.txStatus, "CSV exporterad (UTF-8).");
}

function lockSelectedMonth() {
  if (!isAdmin()) {
    return;
  }
  const month = refs.monthFilter.value;
  if (!month) {
    setStatus(refs.txStatus, "Välj månad för låsning.");
    return;
  }
  if (isMonthLocked(month)) {
    setStatus(refs.txStatus, `${month} är redan låst.`);
    return;
  }
  state.monthLocks.push(month);
  state.monthLocks = [...new Set(state.monthLocks)].sort();
  addAuditLog("Låste månad", month);
  saveState();
  renderAll();
  setStatus(refs.txStatus, `${month} är nu låst.`);
}

function unlockSelectedMonth() {
  if (!isAdmin()) {
    return;
  }
  const month = refs.monthFilter.value;
  if (!month) {
    return;
  }
  state.monthLocks = state.monthLocks.filter((value) => value !== month);
  addAuditLog("Låste upp månad", month);
  saveState();
  renderAll();
  setStatus(refs.txStatus, `${month} är upplåst.`);
}

function renderMonthLockStatus() {
  const month = refs.monthFilter.value;
  if (!month) {
    refs.monthLockStatus.textContent = "";
    return;
  }
  const locked = isMonthLocked(month);
  refs.monthLockStatus.textContent = locked ? `${month} är låst` : `${month} är öppen`;
  refs.monthLockStatus.className = `status ${locked ? "lock-warn" : "lock-ok"}`;
}

function renderTopStatusBar() {
  if (!refs.topMonthStatus || !session) {
    return;
  }
  const month = refs.monthFilter.value || toDateInput(new Date()).slice(0, 7);
  const locked = isMonthLocked(month);
  const latestTx = [...state.transactions].sort((a, b) => (a.date === b.date ? (a.voucherNo || "").localeCompare(b.voucherNo || "") : a.date.localeCompare(b.date))).pop();
  const unpaid = state.invoices.filter((invoice) => invoice.status === "unpaid").length;

  refs.topMonthStatus.textContent = `${month} • ${locked ? "Låst" : "Öppen"}`;
  refs.topRoleStatus.textContent = session.label || "-";
  refs.topSavedStatus.textContent = latestTx
    ? `${formatDate(latestTx.date)} • ${latestTx.voucherNo || "-"}`
    : "Ingen post ännu";
  refs.topUnpaidStatus.textContent = String(unpaid);
}

function renderRoleHint() {
  if (!refs.roleHint || !session) {
    return;
  }
  const textByRole = {
    admin: "Du är Admin: full behörighet till medlemmar, fakturor, kontoplan, säkerhet och backup.",
  };
  refs.roleHint.textContent = textByRole[session.role] || "";
  refs.roleHint.classList.remove("hidden");
}

function queueUndo(message, handler) {
  if (!refs.undoToast || !refs.undoToastText || typeof handler !== "function") {
    return;
  }
  undoAction = handler;
  refs.undoToastText.textContent = message;
  refs.undoToast.classList.remove("hidden");
  if (undoTimeout) {
    clearTimeout(undoTimeout);
  }
  undoTimeout = setTimeout(() => {
    refs.undoToast.classList.add("hidden");
    undoAction = null;
    undoTimeout = null;
  }, 8000);
}

function applyUndoAction() {
  if (!undoAction) {
    return;
  }
  const action = undoAction;
  undoAction = null;
  refs.undoToast.classList.add("hidden");
  if (undoTimeout) {
    clearTimeout(undoTimeout);
    undoTimeout = null;
  }
  action();
}

function showOnboardingIfNeeded() {
  if (!session || !refs.onboardingModal) {
    return;
  }
  const seen = localStorage.getItem(ONBOARDING_KEY) === "1";
  if (!seen) {
    refs.onboardingModal.classList.remove("hidden");
    refs.onboardingModal.setAttribute("aria-hidden", "false");
  }
}

function closeOnboarding(remember) {
  if (!refs.onboardingModal) {
    return;
  }
  if (remember) {
    localStorage.setItem(ONBOARDING_KEY, "1");
  }
  refs.onboardingModal.classList.add("hidden");
  refs.onboardingModal.setAttribute("aria-hidden", "true");
}

function saveIntegrations() {
  if (!isAdmin()) {
    return;
  }
  state.settings.clubName = (refs.clubNameInput.value || "").trim() || "Essinge Rovers IK";
  state.settings.orgNo = (refs.orgNoInput.value || "").trim();
  state.settings.bankgiro = (refs.bankgiroInput.value || "").trim();
  state.settings.plusgiro = (refs.plusgiroInput.value || "").trim();
  state.settings.bankAccount = (refs.bankAccountInput.value || "").trim();
  state.settings.swishNumber = (refs.swishNumberInput.value || "").trim();
  state.settings.swishRecipient = (refs.swishRecipientInput.value || "").trim() || state.settings.clubName;
  state.settings.emailWebhookUrl = (refs.emailWebhookInput.value || "").trim();
  addAuditLog("Uppdaterade integrationsinställning", "Betaluppgifter och webhook");
  saveState();
  setStatus(refs.integrationStatus, "Integrationsinställning sparad.");
}

async function sendInvoiceReminder(id) {
  if (!canManageInvoices()) {
    setStatus(refs.invoiceStatus, "Du saknar behörighet att skicka påminnelser.");
    return;
  }

  const invoice = state.invoices.find((item) => item.id === id);
  if (!invoice || invoice.status !== "unpaid") {
    return;
  }

  const payload = {
    invoiceNo: invoice.invoiceNo,
    memberName: invoice.memberName,
    memberEmail: invoice.memberEmail,
    amount: invoice.amount,
    dueDate: invoice.dueDate,
    note: invoice.note || "",
  };

  const webhookUrl = String(state.settings.emailWebhookUrl || "").trim();
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("bad status");
      }
      addAuditLog("Skickade fakturapåminnelse", invoice.invoiceNo);
      saveState();
      setStatus(refs.invoiceStatus, `Påminnelse skickad via webhook: ${invoice.invoiceNo}`);
      return;
    } catch {
      // Fallback below
    }
  }

  const subject = encodeURIComponent(`Påminnelse medlemsavgift ${invoice.invoiceNo}`);
  const body = encodeURIComponent(
    `Hej ${invoice.memberName},\n\nDetta är en påminnelse om medlemsavgift ${formatMoney(
      invoice.amount
    )}.\nFörfallodatum: ${formatDate(invoice.dueDate)}.\n\nTack!`
  );
  window.location.href = `mailto:${encodeURIComponent(invoice.memberEmail)}?subject=${subject}&body=${body}`;
  setStatus(refs.invoiceStatus, `Mailutkast öppnat för ${invoice.invoiceNo}.`);
}

function exportFullBackup() {
  if (!isAdmin()) {
    return;
  }
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 2,
    state,
    accountsByType,
    pins,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `essinge-rovers-full-backup-${toDateInput(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus(refs.backupStatus, "Full backup exporterad.");
}

function importFullBackup(event) {
  if (!isAdmin()) {
    return;
  }
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || ""));
      const candidateState = parsed.state || parsed;
      const ok = window.confirm("Import ersätter nuvarande data. Fortsätta?");
      if (!ok) {
        return;
      }

      state.transactions = Array.isArray(candidateState.transactions) ? candidateState.transactions : [];
      state.members = Array.isArray(candidateState.members) ? candidateState.members : [];
      state.invoices = Array.isArray(candidateState.invoices) ? candidateState.invoices : [];
      state.activities = Array.isArray(candidateState.activities) ? candidateState.activities : [];
      state.auditLog = Array.isArray(candidateState.auditLog) ? candidateState.auditLog : [];
      state.monthLocks = Array.isArray(candidateState.monthLocks) ? candidateState.monthLocks : [];
      state.settings = {
        clubName: String(candidateState.settings?.clubName || "Essinge Rovers IK"),
        orgNo: String(candidateState.settings?.orgNo || ""),
        bankgiro: String(candidateState.settings?.bankgiro || ""),
        plusgiro: String(candidateState.settings?.plusgiro || ""),
        bankAccount: String(candidateState.settings?.bankAccount || ""),
        swishNumber: String(candidateState.settings?.swishNumber || ""),
        swishRecipient: String(candidateState.settings?.swishRecipient || candidateState.settings?.clubName || "Essinge Rovers IK"),
        emailWebhookUrl: String(candidateState.settings?.emailWebhookUrl || ""),
      };
      refs.clubNameInput.value = state.settings.clubName;
      refs.orgNoInput.value = state.settings.orgNo;
      refs.bankgiroInput.value = state.settings.bankgiro;
      refs.plusgiroInput.value = state.settings.plusgiro;
      refs.bankAccountInput.value = state.settings.bankAccount;
      refs.swishNumberInput.value = state.settings.swishNumber;
      refs.swishRecipientInput.value = state.settings.swishRecipient;
      refs.emailWebhookInput.value = state.settings.emailWebhookUrl;

      if (parsed.accountsByType) {
        accountsByType = {
          income: normalizeAccountsList(parsed.accountsByType.income, defaultAccountsByType.income),
          expense: normalizeAccountsList(parsed.accountsByType.expense, defaultAccountsByType.expense),
        };
        saveAccounts();
      }

      if (parsed.pins && isValidPin(parsed.pins.admin)) {
        pins = {
          admin: parsed.pins.admin,
        };
        savePins();
      }

      saveState();
      hydrateCategorySelect();
      renderAll();
      setStatus(refs.backupStatus, "Full backup importerad.");
    } catch {
      setStatus(refs.backupStatus, "Import misslyckades: ogiltig backupfil.");
    } finally {
      refs.importBackupFile.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function seedDemo() {
  if (!canEditFinance()) {
    setStatus(refs.txStatus, "Du har läsbehörighet.");
    return;
  }

  if (state.transactions.length || state.members.length || state.invoices.length || state.activities.length) {
    const ok = window.confirm("Exempeldata ersätter inte befintligt innehåll men läggs till. Fortsätt?");
    if (!ok) {
      return;
    }
  }

  state.transactions.push(
    {
      id: crypto.randomUUID(),
      date: "2026-02-02",
      type: "income",
      amount: 8500,
      accountCode: "3911",
      accountName: "Medlemsavgifter",
      category: "Medlemsavgift",
      description: "Vårterminen medlemsavgifter",
    },
    {
      id: crypto.randomUUID(),
      date: "2026-02-08",
      type: "expense",
      amount: 2400,
      accountCode: "5460",
      accountName: "Idrottsmaterial",
      category: "Material",
      description: "Nya koner och bollar",
    },
    {
      id: crypto.randomUUID(),
      date: "2026-02-12",
      type: "income",
      amount: 3000,
      accountCode: "3973",
      accountName: "Sponsring",
      category: "Sponsring",
      description: "Lokalt företagsstöd",
    }
  );

  state.members.push(
    { id: crypto.randomUUID(), name: "Ali Hassan", email: "ali@example.com", role: "Spelare" },
    { id: crypto.randomUUID(), name: "Emma Lind", email: "emma@example.com", role: "Ledare" }
  );

  state.activities.push(
    { id: crypto.randomUUID(), date: "2026-03-03", type: "Träning", note: "Konstgras 19:00" },
    { id: crypto.randomUUID(), date: "2026-03-09", type: "Match", note: "Hemma mot IK City" }
  );
  addAuditLog("Lade till exempeldata", "Systemet fyllde på med demo-innehåll");

  saveState();
  renderAll();
}

function wipeAll() {
  if (!isAdmin()) {
    setStatus(refs.txStatus, "Endast admin kan rensa data.");
    return;
  }

  const ok = window.confirm("Rensa all sparad data för appen?");
  if (!ok) {
    return;
  }

  state.transactions = [];
  state.members = [];
  state.invoices = [];
  state.activities = [];
  state.auditLog = [];
  state.monthLocks = [];
  state.settings = {
    clubName: "Essinge Rovers IK",
    orgNo: "",
    bankgiro: "",
    plusgiro: "",
    bankAccount: "",
    swishNumber: "",
    swishRecipient: "Essinge Rovers IK",
    emailWebhookUrl: "",
  };
  accountsByType = cloneDefaultAccounts();
  saveAccounts();
  saveState();
  resetTxFormState();
  renderAll();

  setStatus(refs.txStatus, "All data rensad.");
  setStatus(refs.memberStatus, "");
  if (refs.activityStatus) {
    setStatus(refs.activityStatus, "");
  }
}

function canUseFinance() {
  return Boolean(session);
}

function canEditFinance() {
  return Boolean(session && session.role === "admin");
}

function canManageInvoices() {
  return Boolean(session && session.role === "admin");
}

function isAdmin() {
  return Boolean(session && session.role === "admin");
}

function isAuditor() {
  return false;
}

function isValidPin(value) {
  return /^\d{4,8}$/.test(value);
}

function addAuditLog(action, detail) {
  const by = session ? session.label : "System";
  state.auditLog.push({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    by,
    action,
    detail,
  });
  if (state.auditLog.length > 500) {
    state.auditLog = state.auditLog.slice(-500);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return {
        transactions: [],
        members: [],
        invoices: [],
        activities: [],
        auditLog: [],
        monthLocks: [],
        settings: {
          clubName: "Essinge Rovers IK",
          orgNo: "",
          bankgiro: "",
          plusgiro: "",
          bankAccount: "",
          swishNumber: "",
          swishRecipient: "Essinge Rovers IK",
          emailWebhookUrl: "",
        },
      };
    }

    const parsed = JSON.parse(raw);
    return {
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      members: Array.isArray(parsed.members) ? parsed.members : [],
      invoices: Array.isArray(parsed.invoices) ? parsed.invoices : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : [],
      monthLocks: Array.isArray(parsed.monthLocks) ? parsed.monthLocks : [],
      settings: {
        clubName: String(parsed.settings?.clubName || "Essinge Rovers IK"),
        orgNo: String(parsed.settings?.orgNo || ""),
        bankgiro: String(parsed.settings?.bankgiro || ""),
        plusgiro: String(parsed.settings?.plusgiro || ""),
        bankAccount: String(parsed.settings?.bankAccount || ""),
        swishNumber: String(parsed.settings?.swishNumber || ""),
        swishRecipient: String(parsed.settings?.swishRecipient || parsed.settings?.clubName || "Essinge Rovers IK"),
        emailWebhookUrl: String(parsed.settings?.emailWebhookUrl || ""),
      },
    };
  } catch {
    return {
      transactions: [],
      members: [],
      invoices: [],
      activities: [],
      auditLog: [],
      monthLocks: [],
      settings: {
        clubName: "Essinge Rovers IK",
        orgNo: "",
        bankgiro: "",
        plusgiro: "",
        bankAccount: "",
        swishNumber: "",
        swishRecipient: "Essinge Rovers IK",
        emailWebhookUrl: "",
      },
    };
  }
}

function saveState() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      return cloneDefaultAccounts();
    }

    const parsed = JSON.parse(raw);
    return {
      income: normalizeAccountsList(parsed.income, defaultAccountsByType.income),
      expense: normalizeAccountsList(parsed.expense, defaultAccountsByType.expense),
    };
  } catch {
    return cloneDefaultAccounts();
  }
}

function saveAccounts() {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accountsByType));
}

function loadPins() {
  try {
    const raw = localStorage.getItem(PINS_KEY);
    if (!raw) {
      return { ...defaultPins };
    }

    const parsed = JSON.parse(raw);
    return {
      admin: isValidPin(parsed.admin) ? parsed.admin : defaultPins.admin,
    };
  } catch {
    return { ...defaultPins };
  }
}

function savePins() {
  localStorage.setItem(PINS_KEY, JSON.stringify(pins));
}

function renderAuthPinHint() {
  if (!refs.authPinHint) {
    return;
  }
  const showDefaultPinHint = pins.admin === defaultPins.admin;
  refs.authPinHint.textContent = showDefaultPinHint
    ? "Första inloggning: Admin 1122. Admin kan sedan byta PIN."
    : "";
  refs.authPinHint.classList.toggle("hidden", !showDefaultPinHint);
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.role !== "string") {
      return null;
    }
    if (!authLabels[parsed.role]) {
      return null;
    }
    return { role: parsed.role, label: authLabels[parsed.role] };
  } catch {
    return null;
  }
}

function saveSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function setReferenceHint(text) {
  if (refs.txRefHint) {
    refs.txRefHint.textContent = text;
  }
}

function setReferenceBoxExpanded(expanded) {
  if (!refs.referenceBox || !refs.toggleReferenceBox) {
    return;
  }
  refs.referenceBox.classList.toggle("hidden", !expanded);
  refs.toggleReferenceBox.textContent = expanded
    ? "Dölj bilagor (kvitto/faktura)"
    : "Visa bilagor (kvitto/faktura)";
  refs.toggleReferenceBox.setAttribute("aria-expanded", expanded ? "true" : "false");
}

async function buildTransactionReference(existingEntry) {
  if (!refs.txRefType || !refs.txRefClear || !refs.txRefFile) {
    return {
      referenceType: existingEntry?.referenceType || "none",
      referenceName: existingEntry?.referenceName || "",
      referenceDataUrl: existingEntry?.referenceDataUrl || "",
      referenceMimeType: existingEntry?.referenceMimeType || "",
    };
  }

  const referenceType = refs.txRefType.value || "none";
  const shouldClear = refs.txRefClear.checked;
  const file = refs.txRefFile.files && refs.txRefFile.files[0];

  if (shouldClear) {
    return {
      referenceType: "none",
      referenceName: "",
      referenceDataUrl: "",
      referenceMimeType: "",
    };
  }

  if (file) {
    if (file.size > MAX_REFERENCE_FILE_BYTES) {
      setStatus(refs.txStatus, "Referensfilen är för stor (max 2 MB).");
      return null;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      return {
        referenceType: referenceType === "none" ? "receipt" : referenceType,
        referenceName: file.name,
        referenceDataUrl: dataUrl,
        referenceMimeType: file.type || "",
      };
    } catch {
      setStatus(refs.txStatus, "Kunde inte läsa referensfilen.");
      return null;
    }
  }

  if (existingEntry && existingEntry.referenceDataUrl) {
    return {
      referenceType: referenceType === "none" ? existingEntry.referenceType || "receipt" : referenceType,
      referenceName: existingEntry.referenceName || "",
      referenceDataUrl: existingEntry.referenceDataUrl || "",
      referenceMimeType: existingEntry.referenceMimeType || "",
    };
  }

  return {
    referenceType,
    referenceName: "",
    referenceDataUrl: "",
    referenceMimeType: "",
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("file read failed"));
    reader.readAsDataURL(file);
  });
}

async function openTransactionReference(id) {
  const entry = state.transactions.find((item) => item.id === id);
  if (!entry || !entry.referenceDataUrl) {
    return;
  }
  const popup = window.open("", "_blank", "noopener");
  let resolvedUrl = entry.referenceDataUrl;
  let revokeUrl = "";

  try {
    if (String(entry.referenceDataUrl).startsWith("data:")) {
      const response = await fetch(entry.referenceDataUrl);
      const blob = await response.blob();
      resolvedUrl = URL.createObjectURL(blob);
      revokeUrl = resolvedUrl;
    }
  } catch {
    resolvedUrl = entry.referenceDataUrl;
  }

  if (popup) {
    popup.location.href = resolvedUrl;
    if (revokeUrl) {
      setTimeout(() => URL.revokeObjectURL(revokeUrl), 60000);
    }
    return;
  }

  const link = document.createElement("a");
  link.href = resolvedUrl;
  link.target = "_blank";
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();

  if (revokeUrl) {
    setTimeout(() => URL.revokeObjectURL(revokeUrl), 60000);
  }
  setStatus(refs.txStatus, "Referens öppnad i ny flik. Om inget händer: tillåt popup för sidan.");
}

function downloadTransactionReference(id) {
  const entry = state.transactions.find((item) => item.id === id);
  if (!entry || !entry.referenceDataUrl) {
    return;
  }
  const link = document.createElement("a");
  link.href = entry.referenceDataUrl;
  link.download = entry.referenceName || "referens";
  link.click();
}

function replaceTransactionReference(id) {
  const entry = state.transactions.find((item) => item.id === id);
  if (!entry || !canEditFinance()) {
    return;
  }
  startEditTransaction(id);
  setReferenceBoxExpanded(true);
  refs.txRefType.value = entry.referenceType || "receipt";
  refs.txRefClear.checked = false;
  refs.txRefFile.click();
}

function validateTransactionForm() {
  clearTxErrors();
  const amount = parseMoney(refs.txAmount.value);
  let valid = true;

  if (!refs.txDate.value) {
    setTxFieldError(refs.txDateError, "Datum måste fyllas i.");
    valid = false;
  } else if (refs.txDate.value < "2024-01-01") {
    setTxFieldError(refs.txDateError, "Datum före 2024 stöds inte i denna app.");
    valid = false;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    setTxFieldError(refs.txAmountError, "Belopp måste vara större än 0.");
    valid = false;
  }
  if (!refs.txCategory.value) {
    setTxFieldError(refs.txCategoryError, "Välj konto.");
    valid = false;
  }

  return { valid, amount };
}

function setTxFieldError(node, text) {
  if (node) {
    node.textContent = text;
  }
}

function clearTxErrors() {
  setTxFieldError(refs.txDateError, "");
  setTxFieldError(refs.txAmountError, "");
  setTxFieldError(refs.txCategoryError, "");
}

function setTxFilter(value) {
  currentTxFilter = value || "all";
  renderTransactions();
  updateTxFilterUi();
}

function updateTxFilterUi() {
  if (!refs.txQuickFilters) {
    return;
  }
  refs.txQuickFilters.querySelectorAll("[data-tx-filter]").forEach((button) => {
    button.classList.toggle("active", (button.dataset.txFilter || "all") === currentTxFilter);
  });
}

function updateReferenceMeta(file) {
  if (!refs.txRefMeta) {
    return;
  }
  if (!file) {
    refs.txRefMeta.textContent = "";
    refs.txRefMeta.classList.add("hidden");
    return;
  }
  const sizeKb = file.size ? `${Math.max(1, Math.round(file.size / 1024))} KB` : "okänd storlek";
  const type = file.type || "okänd filtyp";
  const modified = file.lastModified ? formatDate(toDateInput(new Date(file.lastModified))) : "";
  refs.txRefMeta.textContent = `Filinfo: ${type}, ${sizeKb}${modified ? `, uppdaterad ${modified}` : ""}`;
  refs.txRefMeta.classList.remove("hidden");
}

function rememberLastEntryDefaults(entry) {
  if (!entry || typeof localStorage === "undefined") {
    return;
  }
  const payload = {
    type: entry.type || "income",
    accountCode: entry.accountCode || "",
    accountName: entry.accountName || entry.category || "",
  };
  localStorage.setItem("essinge_rovers_last_tx_defaults_v1", JSON.stringify(payload));
}

function applyLastEntryDefaults() {
  try {
    const raw = localStorage.getItem("essinge_rovers_last_tx_defaults_v1");
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.type) {
      return;
    }
    refs.txType.value = parsed.type === "expense" ? "expense" : "income";
    hydrateCategorySelect();
    const value = `${parsed.accountCode || ""}|${parsed.accountName || ""}`;
    if ([...refs.txCategory.options].some((option) => option.value === value)) {
      refs.txCategory.value = value;
    }
  } catch {
    // no-op
  }
}

function toExportDateText(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  const parts = new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value || "";
  const month = (parts.find((part) => part.type === "month")?.value || "").replace(".", "").toLowerCase();
  const year = parts.find((part) => part.type === "year")?.value || "";
  return `${day} ${month} ${year}`.trim();
}

function parseMoney(value) {
  const normalized = String(value).trim().replaceAll(" ", "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : NaN;
}

function parseAccountValue(value) {
  const [code = "", name = ""] = String(value).split("|");
  return {
    code: code.trim(),
    name: name.trim() || "Okänt konto",
  };
}

function buildInvoiceNumber(series = "P", dateIso = "") {
  const safeSeries = series === "F" ? "F" : "P";
  const year = String(dateIso || toDateInput(new Date())).slice(2, 4);
  const prefix = `${safeSeries}${year}`;

  const used = state.invoices
    .map((item) => {
      const match = String(item.invoiceNo || "").match(/^([PF])(\d{2})(\d{3,6})$/);
      if (!match) {
        return NaN;
      }
      const [, matchSeries, matchYear, matchNum] = match;
      if (matchSeries !== safeSeries || matchYear !== year) {
        return NaN;
      }
      return Number(matchNum);
    })
    .filter((value) => Number.isFinite(value));

  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

function getSwishMessage(invoice) {
  return String(invoice.invoiceNo || "").trim();
}

function buildVoucherNumber(dateIso) {
  const month = String(dateIso || "").slice(0, 7).replace("-", "");
  const prefix = `VER-${month}`;
  const count = state.transactions.filter((item) => String(item.voucherNo || "").startsWith(prefix)).length + 1;
  return `${prefix}-${String(count).padStart(3, "0")}`;
}

function isMonthLocked(month) {
  return Array.isArray(state.monthLocks) && state.monthLocks.includes(month);
}

function daysBetween(a, b) {
  const left = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const right = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((right.getTime() - left.getTime()) / 86400000);
}

function addDays(date, days) {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
}

function accountValueFromEntry(entry) {
  const code = entry.accountCode || "";
  const name = entry.accountName || entry.category || "Okänt konto";
  return `${code}|${name}`;
}

function formatAccountLabel(entry) {
  const code = entry.accountCode || "";
  const name = entry.accountName || entry.category || "Okänt konto";
  return code ? `${code} - ${name}` : name;
}

function cloneDefaultAccounts() {
  return {
    income: defaultAccountsByType.income.map((entry) => ({ ...entry })),
    expense: defaultAccountsByType.expense.map((entry) => ({ ...entry })),
  };
}

function normalizeAccountsList(list, fallback) {
  if (!Array.isArray(list)) {
    return fallback.map((entry) => ({ ...entry }));
  }

  const cleaned = list
    .map((entry) => ({
      code: String(entry.code || "").trim(),
      name: String(entry.name || "").trim(),
    }))
    .filter((entry) => /^\d{3,6}$/.test(entry.code) && entry.name);

  if (!cleaned.length) {
    return fallback.map((entry) => ({ ...entry }));
  }

  const dedup = [];
  const seen = new Set();
  for (const entry of cleaned) {
    if (seen.has(entry.code)) {
      continue;
    }
    seen.add(entry.code);
    dedup.push(entry);
  }
  return dedup.sort((a, b) => a.code.localeCompare(b.code));
}

function formatMoney(value) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 2 }).format(value);
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTime(isoDateTime) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(isoDateTime));
}

function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setStatus(node, text) {
  node.textContent = text;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
