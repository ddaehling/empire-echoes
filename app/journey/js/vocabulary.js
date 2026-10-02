const STORAGE_KEY = "empire-echoes-vocabulary-v1";
const RECORD_PREFIX = `${STORAGE_KEY}:entry:`;
const MAX_ENTRIES = 200;
let exportRuntime;
let instanceNumber = 0;

function clean(value, limit) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, limit)
    : "";
}

function normalize(entry) {
  if (!entry || typeof entry !== "object") return null;
  const term = clean(entry.term, 140);
  const meaning = clean(entry.meaning, 1400);
  if (!term || !meaning) return null;
  return {
    term,
    meaning,
    inContext: clean(entry.inContext, 1800),
    examples: Array.isArray(entry.examples)
      ? entry.examples.slice(0, 3).map((value) => clean(value, 900)).filter(Boolean)
      : [],
    context: clean(entry.context, 2200),
    source: entry.source === "ai" ? "ai" : "glossary",
  };
}

function key(entry) {
  return JSON.stringify([entry.term.toLocaleLowerCase("en"), entry.context.toLocaleLowerCase("en")]);
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function preparePDF() {
  if (!exportRuntime) {
    exportRuntime = Promise.all([
      import("../vendor/jspdf.umd.min.js"),
      import("../vendor/source-sans-pdf.js"),
    ]).then(([, fonts]) => ({ jsPDF: globalThis.jspdf.jsPDF, fonts }))
      .catch((error) => { exportRuntime = null; throw error; });
  }
  return exportRuntime;
}

// All content stays as plain PDF text: no HTML parsing, external assets or links.
export function vocabularyPDF(entries, { jsPDF, fonts }) {
  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true, putOnlyUsedFonts: true });
  pdf.addFileToVFS("SourceSans-Regular.ttf", fonts.regular);
  pdf.addFont("SourceSans-Regular.ttf", "SourceSans", "normal");
  pdf.addFileToVFS("SourceSans-Semibold.ttf", fonts.semibold);
  pdf.addFont("SourceSans-Semibold.ttf", "SourceSans", "bold");
  pdf.setProperties({ title: "My vocabulary | Empire Echoes", subject: "Words and phrases from my journey", creator: "Empire Echoes" });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 48;
  const bottom = height - 51;
  const textWidth = width - margin * 2;
  let y = 0;
  let currentTerm = "";
  function pageHeader(first = false) {
    pdf.setTextColor(40, 75, 154);
    pdf.setFont("SourceSans", "bold");
    pdf.setFontSize(10);
    pdf.text("EMPIRE ECHOES / MY VOCABULARY", margin, 35);
    pdf.setDrawColor(210, 217, 226);
    pdf.line(margin, 45, width - margin, 45);
    y = 69;
    if (first) {
      pdf.setTextColor(24, 35, 59);
      pdf.setFontSize(27);
      pdf.text("Words to take with you", margin, y + 10);
      y += 35;
      pdf.setFont("SourceSans", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(92, 102, 118);
      const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      pdf.text(`${entries.length} saved ${entries.length === 1 ? "word or phrase" : "words and phrases"}  /  ${date}`, margin, y);
      y += 27;
    }
  }
  function nextPage(continuation = false) {
    pdf.addPage();
    pageHeader();
    if (continuation && currentTerm) {
      pdf.setFont("SourceSans", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(92, 102, 118);
      const lines = pdf.splitTextToSize(`${currentTerm} (continued)`, textWidth);
      for (const line of lines) { pdf.text(line, margin, y); y += 15; }
      y += 7;
    }
  }
  function write(text, { size = 11.5, weight = "normal", color = [57, 70, 90], gap = 8, indent = 0 } = {}) {
    pdf.setFont("SourceSans", weight);
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text, textWidth - indent);
    const lineHeight = size * 1.42;
    for (const line of lines) {
      if (y + lineHeight > bottom) nextPage(true);
      pdf.setFont("SourceSans", weight);
      pdf.setFontSize(size);
      pdf.setTextColor(...color);
      pdf.text(line, margin + indent, y);
      y += lineHeight;
    }
    y += gap;
  }
  function section(label, value) {
    if (!value) return;
    // Keep the small section label with at least its first two text lines.
    if (y + 57 > bottom) nextPage(true);
    write(label, { size: 9, weight: "bold", color: [92, 102, 118], gap: 3 });
    write(value);
  }
  pageHeader(true);
  entries.forEach((entry, index) => {
    currentTerm = entry.term;
    const titleLines = Math.ceil(entry.term.length / 48);
    if (y + Math.max(110, titleLines * 22 + 70) > bottom) nextPage();
    write(`${String(index + 1).padStart(2, "0")}  ${entry.term}`, { size: 17, weight: "bold", color: [24, 35, 59], gap: 7 });
    section("MEANING", entry.meaning);
    section("IN THIS CONTEXT", entry.inContext);
    if (entry.examples.length) section("EASY EXAMPLES", entry.examples.map((example, i) => `${i + 1}. ${example}`).join("\n"));
    section("FROM THE JOURNEY", entry.context);
    write(entry.source === "ai" ? "Explanation: AI language help" : "Explanation: classroom glossary", { size: 9, color: [92, 102, 118], gap: 7 });
    if (index < entries.length - 1 && y + 17 < bottom) {
      pdf.setDrawColor(210, 217, 226);
      pdf.line(margin, y, width - margin, y);
      y += 23;
    }
  });
  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFont("SourceSans", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(92, 102, 118);
    pdf.text("Empire Echoes / Personal vocabulary", margin, height - 27);
    pdf.text(`${i} / ${pages}`, width - margin, height - 27, { align: "right" });
  }
  return pdf.output("blob");
}

export function createVocabulary({ mount } = {}) {
  const id = `vocabulary-${++instanceNumber}`;
  let entries = [];
  let storageWarning = "";
  let preserveUnreadable = false;
  let persistent = true;
  // Independent records make a change to one phrase atomic across tabs. A
  // removal stays as a tombstone so an old v1 list can never resurrect it.
  // The original v1 list is read-only; there is no destructive migration.
  const pending = new Map();
  function refresh() {
    const current = new Map();
    let unreadable = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          if (saved.version !== 1 || !Array.isArray(saved.entries)) throw new Error("Unrecognised saved vocabulary");
          for (const candidate of saved.entries) {
            const entry = normalize(candidate);
            if (entry) current.set(key(entry), entry);
            else unreadable = true;
          }
        } catch { unreadable = true; }
      }
      const records = [];
      for (let index = 0; index < localStorage.length; index++) {
        const name = localStorage.key(index);
        if (name?.startsWith(RECORD_PREFIX)) records.push(name);
      }
      for (const name of records.sort()) {
        try {
          const rawRecord = localStorage.getItem(name);
          if (rawRecord === null) continue;
          const record = JSON.parse(rawRecord);
          const identity = name.slice(RECORD_PREFIX.length);
          if (record.version !== 1 || typeof record.removed !== "boolean") throw new Error("Unrecognised vocabulary record");
          if (record.removed) current.delete(identity);
          else {
            const entry = normalize(record.entry);
            if (!entry || key(entry) !== identity) throw new Error("Invalid vocabulary record");
            current.set(identity, entry);
          }
        } catch { unreadable = true; }
      }
      preserveUnreadable = unreadable;
      // A failed write belongs to this visit. Receiving another tab's changes
      // must not erase those unsaved words or undo an unsaved removal.
      for (const [identity, entry] of pending) {
        if (entry) current.set(identity, entry);
        else current.delete(identity);
      }
      entries = [...current.values()];
    } catch {
      preserveUnreadable = true;
    }
    persistent = !preserveUnreadable && pending.size === 0;
    storageWarning = preserveUnreadable
      ? "Your saved vocabulary could not be fully read. Its original data has been kept. New words stay here for this visit; download your PDF before leaving."
      : pending.size
        ? "This browser could not save your latest changes. Your words are still here for this visit. Download your PDF before leaving."
        : "";
  }
  refresh();

  const trigger = element("button", "vocabulary-open");
  trigger.type = "button";
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-controls", id);
  const dialog = element("dialog", "vocabulary-dialog");
  dialog.id = id;
  dialog.setAttribute("aria-labelledby", `${id}-title`);
  const header = element("div", "vocabulary-header");
  const heading = element("div");
  const title = element("h2", "", "My vocabulary");
  title.id = `${id}-title`;
  heading.append(title);
  const close = element("button", "vocabulary-close", "Close");
  close.type = "button";
  close.setAttribute("aria-label", "Close vocabulary");
  header.append(heading, close);
  const introduction = element("p", "vocabulary-introduction", "Keep useful words with their meaning, examples and the sentence where you found them.");
  const actions = element("div", "vocabulary-actions");
  const download = element("button", "vocabulary-download", "Download PDF");
  download.type = "button";
  const downloadHint = element("p", "vocabulary-device-note", "Saved on this browser. Download a copy to keep it.");
  actions.append(download, downloadHint);
  const status = element("p", "vocabulary-status");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  const list = element("ol", "vocabulary-list");
  const empty = element("p", "vocabulary-empty", "Your list is ready. Look up a word or phrase, then choose “Add to vocabulary”.");
  dialog.append(header, introduction, actions, status, empty, list);
  (mount || document.body).append(trigger);
  document.body.append(dialog);
  let returnFocus;
  let runtime;
  let preparing = false;
  let exportError = false;

  function notify(message = "") {
    status.textContent = [message, storageWarning].filter(Boolean).join(" ");
    status.hidden = !status.textContent;
    status.classList.toggle("is-warning", Boolean(storageWarning || exportError));
  }
  function persist(entry, removed = false) {
    const identity = key(entry);
    pending.set(identity, removed ? null : entry);
    const current = new Map(entries.map((value) => [key(value), value]));
    if (removed) current.delete(identity);
    else current.set(identity, entry);
    entries = [...current.values()];
    if (preserveUnreadable) { persistent = false; return false; }
    try {
      localStorage.setItem(RECORD_PREFIX + identity, JSON.stringify({ version: 1, removed, ...(removed ? {} : { entry }) }));
      pending.delete(identity);
      refresh();
      return true;
    } catch {
      persistent = false;
      storageWarning = "This browser could not save your latest changes. Your words are still here for this visit. Download your PDF before leaving.";
      return false;
    }
  }
  function updateDownload() {
    download.disabled = !entries.length || preparing;
    download.textContent = preparing ? "Preparing PDF…" : exportError ? "Retry PDF preparation" : "Download PDF";
  }
  function render() {
    trigger.textContent = `My vocabulary (${entries.length})`;
    list.replaceChildren();
    entries.forEach((entry, index) => {
      const item = element("li", "vocabulary-entry");
      const row = element("div", "vocabulary-entry-heading");
      row.append(element("h3", "", entry.term));
      const remove = element("button", "vocabulary-remove", "Remove");
      remove.type = "button";
      remove.dataset.entryKey = key(entry);
      remove.setAttribute("aria-label", `Remove ${entry.term} from vocabulary`);
      remove.addEventListener("click", () => {
        refresh();
        persist(entry, true);
        render();
        notify(`Removed “${entry.term}”.`);
        const buttons = list.querySelectorAll(".vocabulary-remove");
        (buttons[Math.min(index, buttons.length - 1)] || close).focus();
      });
      row.append(remove);
      item.append(row, element("p", "vocabulary-meaning", entry.meaning));
      if (entry.inContext) {
        item.append(element("p", "vocabulary-label", "In this context"));
        item.append(element("p", "", entry.inContext));
      }
      if (entry.examples.length) {
        item.append(element("p", "vocabulary-label", "Easy examples"));
        const examples = element("ul", "vocabulary-examples");
        entry.examples.forEach((example) => examples.append(element("li", "", example)));
        item.append(examples);
      }
      if (entry.context) {
        item.append(element("p", "vocabulary-label", "From the journey"));
        item.append(element("blockquote", "vocabulary-context", entry.context));
      }
      item.append(element("p", "vocabulary-source", entry.source === "ai" ? "AI language help" : "Classroom glossary"));
      list.append(item);
    });
    empty.hidden = Boolean(entries.length);
    list.hidden = !entries.length;
    updateDownload();
  }
  async function prepare() {
    if (runtime || preparing || !entries.length) return;
    preparing = true;
    exportError = false;
    updateDownload();
    try {
      runtime = await preparePDF();
      notify();
    } catch {
      exportError = true;
      notify("The PDF tools could not load. Check your connection, then retry. Your list is still here.");
    } finally {
      preparing = false;
      updateDownload();
    }
  }
  function open(opener) {
    if (dialog.open) return;
    returnFocus = opener instanceof HTMLElement ? opener
      : document.activeElement !== document.body ? document.activeElement : trigger;
    refresh();
    render();
    notify();
    dialog.showModal();
    close.focus();
    prepare();
  }
  function closeDialog() { dialog.close(); }
  close.addEventListener("click", closeDialog);
  dialog.addEventListener("close", () => {
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
  });
  trigger.addEventListener("click", () => open(trigger));
  window.addEventListener("storage", (event) => {
    if (event.key !== null && event.key !== STORAGE_KEY && !event.key.startsWith(RECORD_PREFIX)) return;
    const before = JSON.stringify(entries);
    const focusedKey = document.activeElement?.dataset?.entryKey;
    refresh();
    if (JSON.stringify(entries) === before) { notify(); return; }
    render();
    if (focusedKey) {
      const replacement = [...list.querySelectorAll(".vocabulary-remove")].find((button) => button.dataset.entryKey === focusedKey);
      (replacement || close).focus({ preventScroll: true });
    }
    notify("Vocabulary updated in another tab.");
    if (dialog.open) prepare();
  });
  download.addEventListener("click", () => {
    refresh();
    if (!entries.length) return;
    if (!runtime) { prepare(); return; }
    try {
      const blob = vocabularyPDF(entries, runtime);
      const url = URL.createObjectURL(blob);
      const anchor = element("a");
      anchor.href = url;
      anchor.download = `empire-echoes-vocabulary-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      // Safari may still be opening its PDF preview after the click completes.
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      exportError = false;
      notify("Your PDF is ready. On iPad, use the download or Share menu to save it to Files.");
    } catch {
      exportError = true;
      notify("Your PDF could not be created. Your vocabulary is still here; please try again.");
    }
  });
  render();
  notify();
  return {
    add(candidate) {
      const entry = normalize(candidate);
      if (!entry) return { ok: false, saved: false, message: "This explanation is incomplete. Please look up the word again." };
      refresh();
      if (entries.some((saved) => key(saved) === key(entry))) return { ok: true, saved: persistent, exists: true, message: "Already in your vocabulary." };
      if (entries.length >= MAX_ENTRIES) return { ok: false, saved: false, message: "Your list has 200 entries. Download it, then remove an entry to make room." };
      const saved = persist(entry);
      render();
      const message = saved ? `Added “${entry.term}” to your vocabulary.` : `Added “${entry.term}” for this visit. Open My vocabulary and download your PDF before leaving.`;
      notify(message);
      if (dialog.open) prepare();
      return { ok: true, saved, exists: false, message };
    },
    has(candidate) {
      const entry = normalize(candidate);
      return Boolean(entry && entries.some((saved) => key(saved) === key(entry)));
    },
    open,
    count: () => entries.length,
  };
}

export { STORAGE_KEY as VOCABULARY_STORAGE_KEY };
