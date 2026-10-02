import { wordHelpEndpoint } from "./word-help-config.js";
import { lookupGlossary } from "./word-glossary.js";
import { createVocabulary } from "./vocabulary.js";

// Only authored reading material is eligible. Notebook responses, forms, links,
// navigation and map controls never become lookup targets or API context.
const reading = ".ry-context, .ry-source, .ry-task-prompt, .ry-instructions, .ry-stage-header, .ry-intro-guidance, .ry-lede, .tp-section, .tp-heading, #historical-context, .intro-copy";
const excluded = "a, button, input, textarea, select, label, summary, nav, [contenteditable], [aria-hidden=true], .ry-preserve, .ry-writing, .ry-notebook, .ry-review, .word-help-dialog, .vocabulary-dialog";
const blocks = "p, h1, h2, h3, h4, li, blockquote, figcaption";
const letters = /[\p{L}\p{M}]/u;
const words = /[\p{L}\p{M}]+(?:[’'\-][\p{L}\p{M}]+)*/gu;
const esc = (value) => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function eligible(node) {
  const element = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  if (!element?.closest || element.closest(excluded) || !element.closest(reading)) return null;
  const block = element.closest(blocks);
  return block && block.checkVisibility?.({ visibilityProperty: true }) !== false && !block.closest("[hidden], [inert]") ? block : null;
}
function textNodes(block) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const result = [];
  while (walker.nextNode()) result.push(walker.currentNode);
  return result;
}
function textRange(block, start, end) {
  const range = document.createRange();
  let offset = 0, started = false;
  for (const node of textNodes(block)) {
    if (!started && start < offset + node.length) {
      range.setStart(node, Math.max(0, start - offset)); started = true;
    }
    if (started && end <= offset + node.length) {
      range.setEnd(node, Math.max(0, end - offset)); return range;
    }
    offset += node.length;
  }
  return null;
}
function lookupContext(block, start, end) {
  const text = block.textContent;
  let left = 0, right = text.length;
  if (globalThis.Intl?.Segmenter) {
    for (const item of new Intl.Segmenter("en", { granularity: "sentence" }).segment(text)) {
      if (item.index <= start && item.index + item.segment.length >= end) {
        left = item.index; right = item.index + item.segment.length; break;
      }
    }
  }
  if (right - left > 800) {
    left = Math.max(left, start - 350);
    right = Math.min(right, left + 800);
  }
  while (/\s/.test(text[left] || "") && left < start) left++;
  while (/\s/.test(text[right - 1] || "") && right > end) right--;
  return { word: text.slice(start, end), context: text.slice(left, right), start: start - left, end: end - left, block, base: left, range: textRange(block, start, end) };
}
function lookupAtPoint(x, y) {
  const hit = document.elementFromPoint(x, y);
  const block = eligible(hit);
  if (!block) return null;
  const caret = document.caretPositionFromPoint?.(x, y);
  const fallback = !caret && document.caretRangeFromPoint?.(x, y);
  const node = caret?.offsetNode || fallback?.startContainer;
  const offset = caret?.offset ?? fallback?.startOffset;
  if (node?.nodeType !== Node.TEXT_NODE || !block.contains(node) || !eligible(node)) return null;
  let base = 0;
  for (const part of textNodes(block)) { if (part === node) break; base += part.length; }
  const match = [...node.textContent.matchAll(words)].find(m => m.index <= offset && m.index + m[0].length >= offset);
  if (!match || match[0].length > 60) return null;
  const result = lookupContext(block, base + match.index, base + match.index + match[0].length);
  // Caret APIs choose the nearest text even when pressing blank margins.
  if (![...result.range.getClientRects()].some(r => x >= r.left - 2 && x <= r.right + 2 && y >= r.top - 2 && y <= r.bottom + 2)) return null;
  return result;
}
function selectedLookup() {
  const selection = getSelection();
  if (!selection?.rangeCount || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0), block = eligible(range.startContainer);
  if (!block || !block.contains(range.endContainer)) return null;
  const value = selection.toString();
  if (!/^[\p{L}\p{M}]+(?:[’'\-][\p{L}\p{M}]+)*$/u.test(value) || value.length > 60) return null;
  const prefix = range.cloneRange(); prefix.selectNodeContents(block); prefix.setEnd(range.startContainer, range.startOffset);
  return lookupContext(block, prefix.toString().length, prefix.toString().length + value.length);
}
function termStart(term, lookup) {
  const lower = lookup.context.toLocaleLowerCase("en"), needle = term.toLocaleLowerCase("en");
  let i = lower.indexOf(needle);
  while (i !== -1) {
    if (i <= lookup.start && i + term.length >= lookup.end && !letters.test(lower[i - 1] || "") && !letters.test(lower[i + term.length] || "")) return i;
    i = lower.indexOf(needle, i + 1);
  }
  return -1;
}
function validExplanation(data, lookup) {
  return data && typeof data.term === "string" && data.term.length <= 120 && termStart(data.term, lookup) >= 0 &&
    ["meaning", "inContext"].every(k => typeof data[k] === "string" && data[k].trim().length > 0 && data[k].length <= 700) &&
    Array.isArray(data.examples) && data.examples.length === 2 && data.examples.every(s => typeof s === "string" && s.trim() && s.length <= 300 &&
      new RegExp(`(^|[^\\p{L}\\p{M}'’\\-])${escapeRegex(data.term)}(?=$|[^\\p{L}\\p{M}'’\\-])`, "iu").test(s));
}

export function createWordHelp({ mount }) {
  const vocabulary = createVocabulary({ mount });
  const button = document.createElement("button");
  button.type = "button"; button.className = "word-help-toggle";
  button.setAttribute("aria-pressed", "false"); button.setAttribute("aria-haspopup", "dialog");
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C8 2 4 3 2 4v15c3-2 6-2 10 0m0-14c4-3 8-2 10-1v15c-3-2-6-2-10 0V5Z"/></svg><span>Word help</span>';
  mount.prepend(button);
  const instruction = document.createElement("p"); instruction.className = "word-help-instruction"; instruction.setAttribute("role", "status"); mount.prepend(instruction);
  const dialog = document.createElement("dialog"); dialog.className = "word-help-dialog"; dialog.setAttribute("aria-labelledby", "word-help-title"); document.body.append(dialog);
  let pending, sequence = 0, current, picking = false, timer, press, returnFocus, savedSelection, anchor;
  const cache = new Map();
  function setPicking(value) {
    picking = value; button.setAttribute("aria-pressed", String(value)); document.body.classList.toggle("word-help-picking", value);
    instruction.textContent = value ? "Tap a word in the reading or task text. Press Word help again to finish." : "";
  }
  function highlight(lookup, term = lookup.word) {
    if (!globalThis.CSS?.highlights || !globalThis.Highlight) return;
    const start = termStart(term, lookup);
    const range = start >= 0 ? textRange(lookup.block, lookup.base + start, lookup.base + start + term.length) : lookup.range;
    if (range) CSS.highlights.set("word-help", new Highlight(range));
  }
  function stopRequest() { pending?.abort(); pending = null; sequence++; }
  function position() {
    if (!dialog.open) return;
    const viewport = window.visualViewport;
    const width = viewport?.width || innerWidth, height = viewport?.height || innerHeight;
    const left = viewport?.offsetLeft || 0, top = viewport?.offsetTop || 0;
    const box = dialog.getBoundingClientRect();
    dialog.style.maxHeight = `${Math.max(150, height - 28)}px`;
    const x = width <= 600 ? left + (width - box.width) / 2 : Math.max(left + 12, Math.min((anchor?.left || width / 2) - 24, left + width - box.width - 12));
    const y = width <= 600 ? top + height - Math.min(box.height, height - 28) - 12 : Math.max(top + 14, Math.min((anchor?.bottom || top + 80) + 10, top + height - box.height - 14));
    dialog.style.left = `${x}px`; dialog.style.top = `${y}px`;
  }
  function shell(title) {
    if (!dialog.open) returnFocus = document.activeElement;
    dialog.innerHTML = `<div class="word-help-head"><h2 id="word-help-title">${esc(title)}</h2><button type="button" class="word-help-close" aria-label="Close word help">×</button></div><div data-word-body></div><p class="word-help-status" role="status" aria-live="polite" data-word-status></p>`;
    dialog.querySelector(".word-help-close").onclick = () => dialog.close();
    if (!dialog.open) dialog.showModal();
    dialog.querySelector(".word-help-close").focus({ preventScroll: true }); position();
  }
  const body = () => dialog.querySelector("[data-word-body]");
  const status = (text) => { dialog.querySelector("[data-word-status]").textContent = text; position(); };
  function showExplanation(data, lookup, fallback = false) {
    current = { ...data, context: lookup.context };
    dialog.querySelector("#word-help-title").textContent = data.term;
    highlight(lookup, data.term);
    body().innerHTML = `<p class="word-help-meaning">${esc(data.meaning)}</p><h3>In this passage</h3><p>${esc(data.inContext)}</p><details><summary>Original sentence</summary><blockquote class="word-help-context">${esc(lookup.context)}</blockquote></details><h3>Easy examples</h3><ul class="word-help-examples">${data.examples.map(e => `<li>${esc(e)}</li>`).join("")}</ul><p class="word-help-footnote">${data.source === "ai" ? "AI language help · Check the meaning against the passage." : "Reading glossary · Prepared language help."}${fallback ? " Live word help is temporarily unavailable." : ""}</p><div class="word-help-actions"><button type="button" class="word-help-primary" data-word-save>${vocabulary.has(current) ? "Saved to my vocabulary" : "Save to my vocabulary"}</button><button type="button" class="word-help-secondary" data-word-list>My vocabulary</button></div>`;
    const save = body().querySelector("[data-word-save]"); save.disabled = vocabulary.has(current);
    save.onclick = () => {
      const result = vocabulary.add(current);
      if (result.ok) { save.textContent = "Saved to my vocabulary"; save.disabled = true; }
      status(result.ok ? (result.saved ? "Saved on this device." : result.message || "Kept for this visit. Download your list before leaving.") : result.message || "This entry could not be saved.");
    };
    body().querySelector("[data-word-list]").onclick = () => { dialog.close(); vocabulary.open(); };
    status(`Meaning and examples for ${data.term}.`); position();
  }
  function unavailable(lookup, message) {
    body().innerHTML = `<p>${esc(message)}</p><p>You can check <strong>${esc(lookup.word)}</strong> in a learner’s dictionary.</p><div class="word-help-actions"><a href="https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(lookup.word.toLowerCase())}" target="_blank" rel="noopener noreferrer">Open Cambridge Dictionary ↗</a>${wordHelpEndpoint ? '<button type="button" class="word-help-secondary" data-word-retry>Try again</button>' : ""}</div>`;
    body().querySelector("[data-word-retry]")?.addEventListener("click", () => explain(lookup));
    status("No explanation loaded.");
  }
  async function explain(lookup) {
    if (!lookup) return;
    setPicking(false); stopRequest(); current = null;
    anchor = lookup.range?.getBoundingClientRect(); shell(lookup.word); highlight(lookup);
    const requestId = sequence, key = JSON.stringify([lookup.context, lookup.start, lookup.end]);
    const prepared = lookupGlossary(lookup);
    if (cache.has(key)) { showExplanation(cache.get(key), lookup); return; }
    if (!wordHelpEndpoint) {
      if (prepared) showExplanation(prepared, lookup);
      else unavailable(lookup, "This expression is not in the reading glossary yet.");
      return;
    }
    body().innerHTML = '<p>Finding the meaning in this passage…</p><p class="word-help-footnote">Expressions and phrasal verbs are explained together.</p>';
    status("Loading word help…");
    const controller = new AbortController(); pending = controller;
    const timeout = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch(wordHelpEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "omit", referrerPolicy: "no-referrer", body: JSON.stringify({ word: lookup.word, context: lookup.context, start: lookup.start, end: lookup.end }), signal: controller.signal });
      if (!response.ok) { const error = new Error("unavailable"); error.status = response.status; throw error; }
      const data = await response.json();
      if (!validExplanation(data, lookup)) throw new Error("Invalid explanation");
      const entry = { term: data.term, meaning: data.meaning, inContext: data.inContext, examples: data.examples, source: "ai" };
      if (sequence !== requestId || !dialog.open) return;
      cache.set(key, entry); if (cache.size > 200) cache.delete(cache.keys().next().value);
      showExplanation(entry, lookup);
    } catch (error) {
      if (sequence !== requestId || !dialog.open) return;
      if (prepared) showExplanation(prepared, lookup, true);
      else unavailable(lookup, error.status === 429 ? "Word help is busy. Please try again later." : "Word help could not connect. You can try again or use the dictionary.");
    } finally { clearTimeout(timeout); if (pending === controller) pending = null; }
  }
  function help() {
    anchor = button.getBoundingClientRect(); shell("A little language help");
    body().innerHTML = '<p>Press and hold a word on your iPad, or right-click it with a mouse. We explain the whole expression when words belong together.</p><button type="button" class="word-help-primary" data-word-pick>Tap to choose a word</button><form class="word-help-find"><label for="word-help-search">Or find a word on this page</label><div class="word-help-find-row"><input id="word-help-search" maxlength="60" autocomplete="off" autocapitalize="none" placeholder="e.g. gain"><button class="word-help-secondary" type="submit">Find</button></div><div class="word-help-matches" data-word-matches></div></form><p class="word-help-footnote" style="margin-top:16px">Only the selected word and its reading passage are used for word help. Your answers and notes stay on your device.</p>';
    body().querySelector("[data-word-pick]").onclick = () => { dialog.close(); setPicking(true); };
    body().querySelector("form").onsubmit = event => {
      event.preventDefault(); const query = body().querySelector("input").value.trim();
      const matches = body().querySelector("[data-word-matches]"); matches.replaceChildren();
      if (!/^[\p{L}\p{M}]+(?:[’'\-][\p{L}\p{M}]+)*$/u.test(query)) { status("Enter one word from the visible reading text. We will find its expression."); return; }
      const seen = new Set(), found = [];
      for (const block of document.querySelectorAll("[data-word-reading]")) {
        if (!eligible(block)) continue;
        for (const match of block.textContent.matchAll(new RegExp(escapeRegex(query), "giu"))) {
          const at = match.index;
          if (letters.test(block.textContent[at - 1] || "") || letters.test(block.textContent[at + query.length] || "")) continue;
          const result = lookupContext(block, at, at + query.length), key = JSON.stringify([result.context, result.start]);
          if (!seen.has(key)) { found.push(result); seen.add(key); }
          if (found.length >= 8) break;
        }
        if (found.length >= 8) break;
      }
      for (const result of found) {
        const item = document.createElement("button"); item.type = "button"; item.className = "word-help-match";
        item.innerHTML = `${esc(result.context.slice(0, result.start))}<mark>${esc(result.word)}</mark>${esc(result.context.slice(result.end))}`;
        item.onclick = () => explain(result); matches.append(item);
      }
      status(found.length ? "Choose the passage you are reading." : "That word was not found in the visible reading. Open the relevant source or stop, then try again.");
    };
    position();
  }
  button.addEventListener("pointerdown", () => { savedSelection = selectedLookup(); });
  button.onclick = () => {
    if (picking) { setPicking(false); return; }
    const selected = savedSelection || selectedLookup(); savedSelection = null;
    if (selected) explain(selected); else help();
  };
  dialog.addEventListener("close", () => {
    stopRequest(); globalThis.CSS?.highlights?.delete("word-help");
    if (!document.querySelector("dialog[open]")) (returnFocus?.isConnected ? returnFocus : button).focus?.({ preventScroll: true });
  });
  dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  let suppressClickUntil = 0;
  const cancelPress = () => { clearTimeout(timer); timer = null; press = null; };
  document.addEventListener("pointerdown", event => {
    if (event.pointerType === "mouse" || event.button !== 0 || !event.isPrimary || dialog.open) return;
    cancelPress(); const lookup = lookupAtPoint(event.clientX, event.clientY); if (!lookup) return;
    press = { x: event.clientX, y: event.clientY, id: event.pointerId };
    timer = setTimeout(() => { cancelPress(); suppressClickUntil = performance.now() + 800; explain(lookup); }, 460);
  }, { passive: true });
  document.addEventListener("pointermove", event => { if (press && (event.pointerId !== press.id || Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10)) cancelPress(); }, { passive: true });
  document.addEventListener("pointerup", cancelPress, { passive: true });
  document.addEventListener("pointercancel", cancelPress, { passive: true });
  document.addEventListener("contextmenu", event => {
    if (dialog.open) return;
    const lookup = lookupAtPoint(event.clientX, event.clientY);
    if (!lookup) return;
    event.preventDefault(); cancelPress(); explain(lookup);
  });
  document.addEventListener("click", event => {
    if (dialog.contains(event.target) || mount.contains(event.target)) return;
    if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); return; }
    if (!picking) return;
    const lookup = lookupAtPoint(event.clientX, event.clientY);
    if (lookup) { event.preventDefault(); event.stopPropagation(); explain(lookup); }
  }, true);
  document.addEventListener("keydown", event => { if (event.key === "Escape") setPicking(false); });
  const closeForNavigation = () => { cancelPress(); setPicking(false); if (dialog.open) dialog.close(); };
  window.addEventListener("hashchange", closeForNavigation);
  document.addEventListener("atlas:fullscreenchange", closeForNavigation);
  window.addEventListener("scroll", cancelPress, { passive: true, capture: true });
  window.addEventListener("resize", position);
  window.visualViewport?.addEventListener("resize", position);
  window.visualViewport?.addEventListener("scroll", position);
  const decorate = () => {
    document.querySelectorAll(reading).forEach(root => {
      if (root.matches(blocks) && eligible(root)) root.setAttribute("data-word-reading", "");
      root.querySelectorAll(blocks).forEach(block => { if (eligible(block)) block.setAttribute("data-word-reading", ""); });
    });
  };
  let scheduled = false;
  new MutationObserver(() => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(() => { scheduled = false; decorate(); }); }
  }).observe(document.querySelector("main"), { childList: true, subtree: true });
  // Sources in <details> already exist in the DOM when first opened.
  document.addEventListener("toggle", event => {
    if (event.target.tagName === "DETAILS" && document.querySelector("main").contains(event.target)) decorate();
  }, true);
  decorate();
  return { vocabulary };
}
