import { wordHelpEndpoint } from "../journey/js/word-help-config.js";

const $ = (selector) => document.querySelector(selector);
const words = /[\p{L}\p{M}\p{N}'’\-]+/gu;
const wordCharacter = /[\p{L}\p{M}\p{N}'’\-]/u;
const STORAGE_KEY = "classroom-reader-vocabulary-v1";
const cache = new Map();
const wordButtons = [];
let selectedButton, currentLookup, currentEntry, pending, sequence = 0;
let saved = [];

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function validEntry(value) {
  return value && typeof value.term === "string" && value.term.trim().length > 0 && value.term.length <= 120 &&
    ["meaning", "inContext"].every(key => typeof value[key] === "string" && value[key].trim() && value[key].length <= 700) &&
    Array.isArray(value.examples) && value.examples.length === 2 && value.examples.every(text => typeof text === "string" && text.trim() && text.length <= 300);
}
function termCoversWord(term, lookup) {
  const context = lookup.context;
  let index = context.indexOf(term);
  while (index !== -1) {
    const before = Array.from(context.slice(0, index)).at(-1) || "";
    const after = Array.from(context.slice(index + term.length))[0] || "";
    if (index <= lookup.start && index + term.length >= lookup.end &&
      !wordCharacter.test(before) && !wordCharacter.test(after)) return true;
    index = context.indexOf(term, index + 1);
  }
  return false;
}
function lookupFor(button) {
  const text = button.parentElement.textContent;
  const start = Number(button.dataset.start), end = Number(button.dataset.end);
  let left = 0, right = text.length;
  if (globalThis.Intl?.Segmenter) {
    for (const sentence of new Intl.Segmenter("en", { granularity: "sentence" }).segment(text)) {
      if (sentence.index <= start && sentence.index + sentence.segment.length >= end) {
        left = sentence.index; right = left + sentence.segment.length; break;
      }
    }
  }
  if (right - left > 800) { left = Math.max(left, start - 350); right = Math.min(right, left + 800); }
  while (left < start && /\s/u.test(text[left])) left++;
  while (right > end && /\s/u.test(text[right - 1])) right--;
  return { word: text.slice(start, end), context: text.slice(left, right), start: start - left, end: end - left };
}
function setRoving(button) {
  const previous = $(".reading-word[tabindex='0']");
  if (previous) previous.tabIndex = -1;
  button.tabIndex = 0;
}
function cancelRequest() { pending?.abort(); pending = null; sequence++; }
function revealSelectedWord() {
  if (!selectedButton || !matchMedia("(max-width: 950px)").matches) return;
  requestAnimationFrame(() => {
    if (!$("#word-panel").classList.contains("is-active")) return;
    const word = selectedButton.getBoundingClientRect();
    const visibleBottom = $("#word-panel").getBoundingClientRect().top - 18;
    const offset = word.bottom > visibleBottom ? word.bottom - visibleBottom : word.top < 12 ? word.top - 12 : 0;
    if (offset) window.scrollBy({ top: offset, behavior: "instant" });
  });
}
function closeWord() {
  cancelRequest();
  $("#word-panel").classList.remove("is-active");
  document.body.classList.remove("has-word-help");
  $("#word-title").textContent = "A word at a time";
  $("#word-body").replaceChildren(element("p", "Choose a word in the reading to see its meaning here.", "panel-introduction"));
  $("#close-word").hidden = true;
  $("#save-word").hidden = true;
  $("#save-word").disabled = true;
  $("#word-status").textContent = "";
  if (selectedButton) {
    selectedButton.setAttribute("aria-pressed", "false");
    selectedButton.focus({ preventScroll: true });
  }
  currentEntry = null;
}
function openWord(button) {
  selectedButton?.setAttribute("aria-pressed", "false");
  selectedButton = button;
  setRoving(button);
  button.setAttribute("aria-pressed", "true");
  $("#word-panel").classList.add("is-active");
  document.body.classList.add("has-word-help");
  $("#close-word").hidden = false;
  $("#word-panel").focus({ preventScroll: true });
  explain(lookupFor(button));
}
function showEntry(data, lookup) {
  currentEntry = { term: data.term, meaning: data.meaning, inContext: data.inContext, examples: [...data.examples], context: lookup.context };
  $("#word-title").textContent = data.term;
  const list = element("ol");
  data.examples.forEach(text => list.append(element("li", text)));
  const original = element("details");
  original.append(element("summary", "Read the original sentence"), element("blockquote", lookup.context));
  $("#word-body").replaceChildren(element("p", data.meaning), element("h3", "In this passage"), element("p", data.inContext), element("h3", "Two examples"), list, original);
  $("#save-word").hidden = false;
  updateSaveButton();
  $("#word-status").textContent = `Meaning and examples ready for ${data.term}.`;
  revealSelectedWord();
}
function showError(message, retry = true) {
  const body = $("#word-body");
  body.replaceChildren(element("p", message));
  if (retry) {
    const button = element("button", "Try again", "reader-button reader-button-secondary");
    button.type = "button"; button.dataset.retry = "";
    button.addEventListener("click", () => explain(currentLookup));
    const row = element("p"); row.append(button); body.append(row);
  }
  $("#word-status").textContent = "No explanation loaded.";
  revealSelectedWord();
}
async function explain(lookup) {
  cancelRequest();
  currentLookup = lookup; currentEntry = null;
  const requestId = sequence;
  $("#word-title").textContent = lookup.word;
  $("#save-word").hidden = true;
  $("#save-word").disabled = true;
  const key = JSON.stringify(lookup);
  if (cache.has(key)) { showEntry(cache.get(key), lookup); return; }
  if (!wordHelpEndpoint) { showError("Word help has not been connected yet. You can keep reading.", false); return; }
  $("#word-body").replaceChildren(element("p", "Finding the meaning in this passage…"));
  $("#word-status").textContent = "Loading word help…";
  revealSelectedWord();
  const controller = new AbortController(); pending = controller;
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(wordHelpEndpoint, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "omit", referrerPolicy: "no-referrer",
      body: JSON.stringify(lookup), signal: controller.signal,
    });
    const data = await response.json();
    if (sequence !== requestId) return;
    if (!response.ok) {
      const code = data?.error?.code || data?.code || data?.error;
      if (code === "daily_limit") {
        showError("Today's word-help limit has been reached. You can keep reading and use your saved vocabulary. New explanations will be available at midnight UTC.", false);
        $("#word-status").textContent = "Daily limit reached. Resets at midnight UTC.";
      } else if (code === "rate_limit" || response.status === 429) showError("Word help is busy. Please wait a minute, then try again.");
      else showError("Word help could not load this explanation. Please try again.");
      return;
    }
    if (!validEntry(data) || !termCoversWord(data.term, lookup)) throw new Error("Invalid explanation");
    cache.set(key, data);
    if (cache.size > 200) cache.delete(cache.keys().next().value);
    showEntry(data, lookup);
  } catch (error) {
    if (sequence !== requestId) return;
    showError(error.name === "AbortError" ? "Word help took too long to respond. Please try again." : "Word help could not connect. Check your connection and try again.");
  } finally {
    clearTimeout(timeout);
    if (pending === controller) pending = null;
  }
}
function entryKey(entry) { return JSON.stringify([entry.term.toLocaleLowerCase("en"), entry.context]); }
function updateSaveButton() {
  const exists = currentEntry && saved.some(entry => entryKey(entry) === entryKey(currentEntry));
  $("#save-word").disabled = !currentEntry || Boolean(exists);
  $("#save-word").textContent = exists ? "Saved to my vocabulary" : "Save to my vocabulary";
}
function persistVocabulary() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); return true; }
  catch { return false; }
}
function renderVocabulary() {
  $("#saved-count").textContent = String(saved.length);
  $("#vocabulary-empty").hidden = saved.length > 0;
  $("#download-vocabulary").disabled = saved.length === 0;
  $("#saved-words").replaceChildren(...saved.map(entry => {
    const item = element("li");
    const remove = element("button", "Remove", "remove-word");
    remove.type = "button"; remove.setAttribute("aria-label", `Remove ${entry.term} from vocabulary`);
    remove.addEventListener("click", () => {
      saved = saved.filter(value => entryKey(value) !== entryKey(entry));
      const persisted = persistVocabulary(); renderVocabulary(); updateSaveButton();
      $("#vocabulary > summary").focus();
      $("#vocabulary-status").textContent = persisted ? `${entry.term} removed.` : "Removed for this visit. Device storage is unavailable.";
    });
    item.append(element("h3", entry.term), element("p", entry.meaning), remove);
    return item;
  }));
}
$("#save-word").addEventListener("click", () => {
  if (!currentEntry || saved.some(entry => entryKey(entry) === entryKey(currentEntry))) return;
  if (saved.length >= 200) { $("#word-status").textContent = "Your list holds 200 words. Download it, then remove some words to make space."; return; }
  saved.push(currentEntry);
  const persisted = persistVocabulary(); renderVocabulary(); updateSaveButton();
  $("#word-status").textContent = persisted ? "Saved on this device." : "Saved for this visit. Download your list before leaving; device storage is unavailable.";
});
$("#download-vocabulary").addEventListener("click", () => {
  const text = ["My vocabulary", "", ...saved.flatMap(entry => [entry.term, entry.meaning, `In this passage: ${entry.inContext}`, ...entry.examples.map(value => `• ${value}`), `Original passage: ${entry.context}`, ""])].join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = element("a"); link.href = url; link.download = "reading-vocabulary.txt";
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$("#close-word").addEventListener("click", closeWord);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && $("#word-panel").classList.contains("is-active")) { event.preventDefault(); closeWord(); }
});
$(".reader-saved-link").addEventListener("click", event => {
  event.preventDefault();
  if ($("#word-panel").classList.contains("is-active")) closeWord();
  $("#vocabulary").open = true;
  $("#vocabulary > summary").focus();
  $("#vocabulary").scrollIntoView({ block: "nearest" });
});
$("#reading-text").addEventListener("keydown", event => {
  const button = event.target.closest(".reading-word");
  if (!button || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const index = wordButtons.indexOf(button);
  const target = event.key === "Home" ? 0 : event.key === "End" ? wordButtons.length - 1 : Math.max(0, Math.min(wordButtons.length - 1, index + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1)));
  setRoving(wordButtons[target]); wordButtons[target].focus();
});
try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (Array.isArray(stored)) saved = stored.filter(entry => validEntry(entry) && typeof entry.context === "string" && entry.context.length <= 800).slice(0, 200);
} catch { /* Reading and saving for this visit remain available without device storage. */ }
renderVocabulary();

async function loadReading() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch("./content.json", { signal: controller.signal });
    if (!response.ok) throw new Error("Reading unavailable");
    const data = await response.json();
    if (!data || typeof data.title !== "string" || !Array.isArray(data.paragraphs) || !data.paragraphs.every(text => typeof text === "string")) throw new Error("Invalid reading");
    const title = data.title.trim() || "Classroom reading";
    $("#reading-title").textContent = title;
    document.title = `${title} · Reading room`;
    if (typeof data.source === "string" && data.source.trim()) {
      const credit = $("#reading-source");
      credit.textContent = data.source;
      if (typeof data.sourceUrl === "string" && /^https?:\/\//.test(data.sourceUrl)) {
        const sourceLink = element("a", "Original article");
        sourceLink.href = data.sourceUrl;
        sourceLink.target = "_blank"; sourceLink.rel = "noopener noreferrer";
        credit.append(document.createTextNode(" · "), sourceLink);
      }
      credit.hidden = false;
    }
    const paragraphs = data.paragraphs.filter(text => text.trim());
    if (!paragraphs.length) {
      $("#reading-text").replaceChildren(element("p", "The reading text has not been added yet.", "reading-empty"));
      $(".reading-guidance").hidden = true; $(".keyboard-help").hidden = true;
      return;
    }
    const sections = new Map((Array.isArray(data.sectionStarts) ? data.sectionStarts : [])
      .filter(section => Number.isInteger(section.index) && section.index >= 0 && section.index < paragraphs.length && typeof section.label === "string")
      .map(section => [section.index, section.label]));
    const navigation = $("#reading-parts");
    navigation.replaceChildren();
    for (const [index, label] of sections) {
      const link = element("a", label);
      link.href = `#reading-part-${index}`;
      navigation.append(link);
    }
    navigation.hidden = sections.size < 2;
    $("#reading-text").replaceChildren(...paragraphs.flatMap((text, index) => {
      const paragraph = element("p"); let offset = 0;
      for (const match of text.matchAll(words)) {
        paragraph.append(document.createTextNode(text.slice(offset, match.index)));
        if (match[0].length <= 60 && /[\p{L}\p{M}\p{N}]/u.test(match[0])) {
          const button = element("button", match[0], "reading-word");
          button.type = "button"; button.tabIndex = wordButtons.length ? -1 : 0;
          button.dataset.start = String(match.index); button.dataset.end = String(match.index + match[0].length);
          button.setAttribute("aria-pressed", "false"); button.setAttribute("aria-controls", "word-panel");
          button.addEventListener("click", () => openWord(button));
          paragraph.append(button); wordButtons.push(button);
        } else paragraph.append(document.createTextNode(match[0]));
        offset = match.index + match[0].length;
      }
      paragraph.append(document.createTextNode(text.slice(offset)));
      if (!sections.has(index)) return [paragraph];
      const heading = element("h2", sections.get(index), "reading-part-title");
      heading.id = `reading-part-${index}`;
      return [heading, paragraph];
    }));
  } catch {
    const message = element("p", "The reading could not load. Check your connection and reload this page.", "reading-empty");
    const retry = element("button", "Reload reading", "reader-button"); retry.type = "button";
    retry.addEventListener("click", () => location.reload());
    $("#reading-text").replaceChildren(message, retry);
  } finally { clearTimeout(timeout); $("#reading-text").setAttribute("aria-busy", "false"); }
}
loadReading();
