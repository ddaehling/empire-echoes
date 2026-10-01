import { rallye } from "./rallye-content.js";
import { RALLYE_RESOURCES } from "./rallye-resources.js";
import {
  RALLYE_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  RALLYE_CONTENT_REVISION,
  emptyState,
  recoverSavedState,
  preserveEarlierAttempt,
  recoveredAttemptText,
  progressFor,
  markStageDone,
} from "./rallye-state.js";

export {
  RALLYE_STORAGE_KEY,
  RALLYE_CONTENT_REVISION,
  normaliseSaved,
  preserveEarlierAttempt,
  recoveredAttemptText,
  validCitations,
  validateStage,
  validateRallye,
} from "./rallye-state.js";

const stages = [...rallye.stations, rallye.finalAssessment];
const array = (value) => (Array.isArray(value) ? value : value ? [value] : []);
const question = (stage) => stage.investigation || stage.question || stage;
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
const arrow =
  '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg>';
const tick =
  '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>';
const safeURL = (value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};
const paragraphs = (values) =>
  array(values)
    .map((text) => `<p>${esc(text)}</p>`)
    .join("");
const excerptParagraphs = (text) =>
  String(text || "")
    .split(/\r?\n\s*\r?\n/)
    .filter((part) => part.trim())
    .map((part) => `<p>${part.split(/\r?\n/).map(esc).join("<br>")}</p>`)
    .join("");
const longExcerpt = (text) =>
  /\r?\n\s*\r?\n/.test(text || "") || String(text || "").trim().split(/\s+/).length > 60;
const originalLinkLabel = (source) =>
  source.urlLabel || (/\.pdf(?:[?#]|$)/i.test(source.url || "")
    ? "View original scan (PDF)"
    : "Read original source (HTML)");
const provenanceLinkLabel = (source) =>
  source.provenanceLabel || (/\.pdf(?:[?#]|$)/i.test(source.provenanceUrl || "")
    ? "View supporting scan (PDF)"
    : "Read supporting source (HTML)");
const contextFor = (stage) => array(stage.contextParagraphs || stage.context);
const sourceList = (stage) => {
  const records = RALLYE_RESOURCES[stage.id] || [];
  return stage.sourceIds?.length
    ? records.filter((source) => stage.sourceIds.includes(source.id))
    : records;
};
const essentialSources = (stage) =>
  sourceList(stage).filter((source) =>
    Array.isArray(stage.essentialSourceIds)
      ? stage.essentialSourceIds.includes(source.id)
      : !source.optional,
  );
const sourceRecord = (source) => ({
  id: source.id,
  title: source.title,
  organisation: source.organisation || "",
  date: source.date || "",
  kind: source.kind || "",
  url: safeURL(source.url),
  urlLabel: originalLinkLabel(source),
  provenanceUrl: safeURL(source.provenanceUrl),
  provenanceLabel: provenanceLinkLabel(source),
  excerpt: source.excerpt || "",
  excerptLabel: source.excerptLabel || "Original wording · short extract",
  excerptNote: source.excerptNote || "",
  summary: source.summary || "",
  summaryLabel: source.summaryLabel || "Prepared summary · paraphrase",
  context: source.context || "",
  scope: source.scope || "",
  locator: source.locator || "",
});

/** A current portfolio contains only current work. Earlier attempts have their own recovery download. */
export function buildReport(state) {
  return {
    enquiry: {
      id: rallye.id,
      title: rallye.title,
      contentRevision: RALLYE_CONTENT_REVISION,
    },
    student: { name: state.student.name, className: state.student.className },
    startedAt: state.startedAt,
    updatedAt: state.updatedAt,
    reviewSavedAt: state.finishedAt,
    note: "Learning work. Responses remain editable. Provided materials are included automatically for attribution; this list does not claim that the learner used every source. Nothing is sent automatically.",
    stages: stages.map((stage) => ({
      id: stage.id,
      title: stage.title,
      period: stage.period || "",
      context: contextFor(stage),
      prompt: question(stage).prompt,
      instructions: array(question(stage).instructions),
      response: state.answers[stage.id] || "",
      markedDoneByLearner: !!state.completedStages?.[stage.id],
      notes: state.notebooks[stage.id]?.note || "",
      providedSources: sourceList(stage).map(sourceRecord),
    })),
  };
}

export function reportText(report) {
  return `${report.enquiry.title}\nLEARNING NOTEBOOK\nContent revision: ${report.enquiry.contentRevision}\n\nName: ${report.student.name || "Not supplied"}\nClass: ${report.student.className || "Not supplied"}\n\n${report.note}\n\n${report.stages.map((stage, index) => `${index + 1}. ${stage.title}\n${stage.period}\n\n${stage.context.join("\n\n")}\n\nTask: ${stage.prompt}\n${stage.instructions.map((text) => `- ${text}`).join("\n")}\n\nYour response:\n${stage.response || "No response saved yet"}\n${stage.notes ? `\nOptional notes:\n${stage.notes}\n` : ""}\nProvided material — automatic attribution:\n${stage.providedSources.map((source) => `${source.title} — ${source.organisation}\n${source.date}\n${source.url ? `${originalLinkLabel(source)}: ${source.url}` : ""}${source.provenanceUrl ? `\n${provenanceLinkLabel(source)}: ${source.provenanceUrl}` : ""}\n${source.excerpt ? `${source.excerptLabel}:\n${source.excerpt}\n${source.excerptNote ? `\n${source.excerptNote}\n` : ""}` : ""}${source.summaryLabel}:\n${source.summary}\n${source.scope}\n${source.context}\n${source.locator}`).join("\n\n") || "Use the provided material from the earlier stops."}`).join("\n\n————————————————————————————\n\n")}`;
}

export function reportHTML(report) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(report.student.name || "Learning notebook")} — Empire / Echoes</title><style>body{max-width:800px;margin:40px auto;padding:0 24px;color:#20242b;font:16px/1.6 system-ui,sans-serif}h1,h2,h3{line-height:1.25}h1{font-size:32px}h2{font-size:24px;margin-top:36px}h3{font-size:17px;margin:22px 0 6px}a{color:#163fa2;overflow-wrap:anywhere}.meta{padding:16px 0;border-block:1px solid #cdd2dc}.answer{white-space:pre-wrap;overflow-wrap:anywhere}.note{font-size:14px;color:#454d59}section{border-bottom:1px solid #cdd2dc;padding-bottom:22px}button{font:inherit;padding:10px 16px;cursor:pointer}.sources article{margin:20px 0}blockquote{margin-inline:0;padding:16px;background:#f0f3f7;font-family:Georgia,serif}blockquote p:first-child{margin-top:0}blockquote p:last-child{margin-bottom:0}blockquote p+p{margin-top:1em}.long-excerpt{max-width:68ch;font-size:1.0625rem;line-height:1.65}@media print{@page{margin:15mm}body{margin:0;padding:0;font-size:10.5pt}button{display:none}h1{font-size:24pt}h2{font-size:17pt;break-after:avoid}h3{break-after:avoid}p,li{orphans:3;widows:3}.note{font-size:10pt}a{color:inherit}article{break-inside:avoid}}</style></head><body><header><button onclick="window.print()">Print / save as PDF</button><h1>${esc(report.enquiry.title)}</h1><p>Learning notebook</p><div class="meta"><strong>${esc(report.student.name || "Name not supplied")}</strong>${report.student.className ? ` · ${esc(report.student.className)}` : ""}<p class="note">Content revision: ${esc(report.enquiry.contentRevision)}</p></div><p class="note">${esc(report.note)}</p></header>${report.stages.map((stage, index) => `<section><h2>${index + 1}. ${esc(stage.title)}</h2>${stage.period ? `<p class="note">${esc(stage.period)}</p>` : ""}${paragraphs(stage.context)}<h3>Your task</h3><p>${esc(stage.prompt)}</p>${paragraphs(stage.instructions)}<h3>Your response</h3><p class="answer">${esc(stage.response || "No response saved yet")}</p>${stage.notes ? `<h3>Optional notes</h3><p class="answer">${esc(stage.notes)}</p>` : ""}<div class="sources"><h3>Provided material · automatic attribution</h3>${stage.providedSources.map((source) => `<article><h3>${esc(source.title)}</h3><p class="note">${esc([source.organisation, source.date].filter(Boolean).join(" · "))}</p>${source.url ? `<p><a href="${esc(source.url)}">${esc(originalLinkLabel(source))}</a></p>` : ""}${source.provenanceUrl ? `<p><a href="${esc(source.provenanceUrl)}">${esc(provenanceLinkLabel(source))}</a></p>` : ""}${source.excerpt ? `<p class="note">${esc(source.excerptLabel)}</p><blockquote${longExcerpt(source.excerpt) ? ' class="long-excerpt"' : ""}>${excerptParagraphs(source.excerpt)}</blockquote>${source.excerptNote ? `<p class="note">${esc(source.excerptNote)}</p>` : ""}` : ""}<p class="note">${esc(source.summaryLabel)}</p><p>${esc(source.summary)}</p>${source.scope ? `<p>${esc(source.scope)}</p>` : ""}${source.context ? `<p>${esc(source.context)}</p>` : ""}${source.locator ? `<p class="note">${esc(source.locator)}</p>` : ""}</article>`).join("") || "<p>Use the provided material from the earlier stops.</p>"}</div></section>`).join("")}</body></html>`;
}

export function createRallye(
  host,
  {
    data,
    onProgress = () => {},
    onExplore = () => {},
    onTerritory = () => {},
  } = {},
) {
  let state = emptyState();
  let canSave = true;
  let storageNotice = "";
  let destroyed = false;
  let viewedOnce = false;
  let returnFocus = null;
  let returnScroll = null;
  let resetOpener = null;
  const frames = new Set();
  const timers = new Set();
  try {
    const current = localStorage.getItem(RALLYE_STORAGE_KEY);
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    let currentRaw = null;
    let legacyRaw = null;
    try {
      currentRaw = current ? JSON.parse(current) : null;
    } catch {
      storageNotice =
        "This browser’s current notebook could not be read. Its stored copy has been left in place. Download any work you enter before leaving.";
      canSave = false;
    }
    try {
      legacyRaw = legacy ? JSON.parse(legacy) : null;
    } catch {
      storageNotice ||=
        "An earlier notebook could not be read. Its stored copy has been left in place.";
    }
    state = recoverSavedState(currentRaw, legacyRaw);
    if (
      state.previousAttempts.length &&
      (!current || (currentRaw && currentRaw.contentRevision !== RALLYE_CONTENT_REVISION))
    ) {
      storageNotice =
        "Your earlier work is preserved with its original questions. This enquiry has a separate notebook. Open Earlier saved work below to recover it.";
    }
  } catch {
    canSave = false;
    storageNotice =
      "Autosave is unavailable. Keep this page open and download your work before leaving.";
  }
  const unreadableCurrent = !canSave && !!storageNotice.includes("stored copy");
  let screen = state.startedAt ? "stage" : "intro";
  host.classList.add("rallye");

  function progress() {
    return { ...progressFor(state), canSave };
  }
  function statusText() {
    return !canSave
      ? "Autosave unavailable · download your work"
      : state.updatedAt
        ? "Saved on this device"
        : "Your work saves on this device";
  }
  function announce(message) {
    const live = host.querySelector("[data-ry-live]");
    if (live) live.textContent = message;
  }
  function notebook(stage) {
    return (
      state.notebooks[stage.id] || (state.notebooks[stage.id] = { note: "" })
    );
  }
  function updateProgress() {
    const p = progress();
    host.querySelectorAll("[data-ry-save]").forEach((node) => {
      node.textContent = statusText();
      node.classList.toggle("is-unavailable", !canSave);
    });
    host.querySelectorAll("[data-ry-backup]").forEach((node) => {
      node.hidden = canSave;
    });
    host.querySelectorAll("[data-ry-completed]").forEach((node) => {
      node.textContent = `${p.completed} of ${p.total} marked done`;
    });
    host.querySelectorAll("[data-ry-progress]").forEach((node) => {
      node.value = p.completed;
    });
    for (const stage of stages) {
      const done = !!state.completedStages[stage.id];
      const button = host.querySelector(`[data-ry-stage="${stage.id}"]`);
      if (!button) continue;
      button.dataset.complete = String(done);
      button.classList.toggle("is-done", done);
      const status = button.querySelector(".ry-nav-status");
      if (status)
        status.innerHTML = done
          ? `${tick}<span class="ry-sr">Marked done</span>`
          : "";
    }
  }
  function save() {
    state.updatedAt = new Date().toISOString();
    if (!unreadableCurrent) {
      try {
        localStorage.setItem(RALLYE_STORAGE_KEY, JSON.stringify(state));
        canSave = true;
      } catch {
        canSave = false;
      }
    }
    updateProgress();
    onProgress(progress());
  }
  function saveLine() {
    return `<p class="ry-save-status${canSave ? "" : " is-unavailable"}" data-ry-save>${esc(statusText())}</p><button type="button" class="ry-text-link" data-ry-backup data-ry-download="txt" ${canSave ? "hidden" : ""}>Download a backup</button>`;
  }
  function studentFields() {
    return `<div class="ry-student-fields"><div class="ry-field"><label for="ry-name">Your name <span>optional</span></label><input id="ry-name" name="name" autocomplete="name" value="${esc(state.student.name)}" data-ry-student="name"></div><div class="ry-field"><label for="ry-class">Class <span>optional</span></label><input id="ry-class" name="className" autocomplete="off" value="${esc(state.student.className)}" data-ry-student="className"></div></div>`;
  }
  function introduction() {
    return `<div class="ry-intro"><div class="ry-hero"><p class="ry-label">${esc(rallye.activityLabel || "An English enquiry")}</p><h1 tabindex="-1" data-ry-heading>${esc(rallye.title)}</h1><p class="ry-lede">${esc(rallye.subtitle)}</p><div class="ry-intro-guidance">${paragraphs(rallye.introduction)}<details class="ry-disclosure ry-intro-help"><summary>How the enquiry works</summary><div class="ry-disclosure-body">${paragraphs(rallye.instructions)}${paragraphs(rallye.framing)}${paragraphs(rallye.mapReminder)}</div></details></div></div><section class="ry-start" aria-labelledby="ry-start-title"><h2 id="ry-start-title">Your learning notebook</h2><p>Read a situation, explore the evidence, then respond in your own words. Move between stops whenever you need.</p><form data-ry-start>${studentFields()}<button class="ry-primary" type="submit">Begin the enquiry ${arrow}</button></form><div class="ry-privacy-note">${saveLine()}<p>Your work stays in this browser. You can revise, download or print it at any time. Nothing is sent automatically.</p></div></section><ol class="ry-route-preview">${stages.map((stage, index) => `<li><span class="ry-route-number">${index + 1}</span><span><strong>${esc(stage.title)}</strong><small>${esc(stage.period || "Final comment")}</small></span></li>`).join("")}</ol></div>`;
  }
  function sidebar() {
    const p = progress();
    return `<aside class="ry-sidebar" aria-label="Enquiry route"><div class="ry-sidebar-heading"><h2>Your route</h2><span data-ry-completed>${p.completed} of ${p.total} marked done</span><progress data-ry-progress max="${p.total}" value="${p.completed}" aria-label="Stops you have marked done"></progress></div><nav aria-label="Enquiry stops"><ol class="ry-route">${stages
      .map((stage, index) => {
        const done = !!state.completedStages[stage.id];
        const current = index === state.currentIndex && screen === "stage";
        return `<li class="ry-route-item"><button type="button" data-ry-stage="${esc(stage.id)}" data-complete="${done}" class="${current ? "is-current" : ""} ${done ? "is-done" : ""}" ${current ? 'aria-current="step"' : ""}><span class="ry-route-number">${index + 1}</span><span class="ry-route-label"><strong>${esc(stage.title)}</strong><small>${esc(stage.period || "Final comment")}</small></span><span class="ry-nav-status">${done ? `${tick}<span class="ry-sr">Marked done</span>` : ""}</span></button></li>`;
      })
      .join(
        "",
      )}</ol><button type="button" class="ry-review-link${screen === "review" ? " is-current" : ""}" data-ry-action="review" ${screen === "review" ? 'aria-current="page"' : ""}>Review & download ${arrow}</button></nav></aside>`;
  }
  function sourceCard(source) {
    const url = safeURL(source.url);
    const provenance = safeURL(source.provenanceUrl);
    const isLong = longExcerpt(source.excerpt);
    const summary = source.summary
      ? `<p class="ry-summary-label">${esc(source.summaryLabel || "Prepared summary · paraphrase")}</p><p class="ry-source-summary">${esc(source.summary)}</p>`
      : "";
    return `<article class="ry-source"><div class="ry-source-heading"><h3>${esc(source.title)}</h3><p class="ry-source-meta">${esc([source.organisation, source.date].filter(Boolean).join(" · "))}</p></div>${source.excerpt ? `<p class="ry-excerpt-label">${esc(source.excerptLabel || "Original wording · short extract")}</p><blockquote${isLong ? ' class="ry-long-excerpt"' : ""}>${excerptParagraphs(source.excerpt)}</blockquote>${source.excerptNote ? `<p class="ry-source-note">${esc(source.excerptNote)}</p>` : ""}` : ""}${isLong && summary ? `<details class="ry-source-context ry-source-paraphrase"><summary>In our words</summary><div class="ry-disclosure-body">${summary}</div></details>` : summary}${source.scope ? `<p class="ry-source-scope">${esc(source.scope)}</p>` : ""}<details class="ry-source-context"><summary>Source details and original</summary><div class="ry-disclosure-body">${source.kind ? `<p>${esc(source.kind)}</p>` : ""}${paragraphs(source.context)}${source.locator ? `<p><strong>Find it:</strong> ${esc(source.locator)}</p>` : ""}${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(originalLinkLabel(source))} ↗<span class="ry-sr"> (opens in a new tab)</span></a>` : ""}${provenance ? `<p><a href="${esc(provenance)}" target="_blank" rel="noopener noreferrer">${esc(provenanceLinkLabel(source))} ↗<span class="ry-sr"> (opens in a new tab)</span></a></p>` : ""}</div></details></article>`;
  }
  function evidence(stage) {
    const sources = essentialSources(stage);
    if (!sources.length) return "";
    return `<section class="ry-evidence ry-sources" aria-labelledby="ry-sources-title"><h2 id="ry-sources-title">Evidence to use</h2><p>Read the evidence here. Opening the full sources is optional.</p><div class="ry-source-list">${sources.map(sourceCard).join("")}</div></section>`;
  }
  function research(stage) {
    const core = essentialSources(stage);
    const optional = sourceList(stage).filter(
      (source) => !core.includes(source),
    );
    const focus = stage.mapFocus;
    return `<details class="ry-disclosure ry-research"><summary>Explore sources${focus ? " and the atlas" : " further"} (optional)</summary><div class="ry-disclosure-body"><p>The prepared material is available here without opening other websites. Its source details are included automatically in your download.</p>${focus ? `<div class="ry-map-actions"><p>${esc(data?.get?.(focus.territoryId)?.name || stage.location || focus.territoryId)} · ${esc(focus.year)}</p><button type="button" class="ry-secondary" data-ry-action="explore">Open on the atlas ↗</button><button type="button" class="ry-text-link" data-ry-action="territory">Read the territory story ↗</button></div><p class="ry-input-help">Use the return link to come back to this response. A map colour shows a political relationship; it cannot describe everyone’s experience.</p>` : ""}${paragraphs(stage.researchInstructions)}${optional.length ? `<div class="ry-source-list">${optional.map(sourceCard).join("")}</div>` : ""}</div></details>`;
  }
  function languageSupport(task) {
    const support = task.support;
    if (
      !support ||
      (!array(support.stems).length && !array(support.vocabulary).length)
    )
      return "";
    return `<details class="ry-disclosure ry-language-support"><summary>Help with language</summary><div class="ry-disclosure-body"><p>Use a phrase if it helps, then add your own evidence and reasoning.</p>${
      array(support.vocabulary).length
        ? `<h3>Useful vocabulary</h3><ul>${array(support.vocabulary)
            .map(
              (item) =>
                `<li>${typeof item === "object" ? `<strong>${esc(item.term)}</strong> — ${esc(item.meaning)}` : esc(item)}</li>`,
            )
            .join("")}</ul>`
        : ""
    }${
      array(support.stems).length
        ? `<h3>Sentence starters</h3><ul>${array(support.stems)
            .map((text) => `<li>${esc(text)}</li>`)
            .join("")}</ul>`
        : ""
    }</div></details>`;
  }
  function privateNotes(stage) {
    return `<details class="ry-disclosure ry-notebook"><summary>Notes and chosen evidence</summary><div class="ry-disclosure-body"><p>Optional: keep a useful detail, name the source you chose, or paste a link from your own research. These notes stay with your download.</p><div class="ry-field"><label for="ry-notes">Your notes</label><textarea id="ry-notes" rows="4" data-ry-notes placeholder="A detail, a source, a connection or a question…">${esc(notebook(stage).note)}</textarea></div></div></details>`;
  }
  function earlierResponses() {
    return `<details class="ry-disclosure ry-earlier-responses"><summary>Your earlier responses and evidence</summary><div class="ry-disclosure-body"><p>Return to an earlier response to develop it, or use its evidence in your comment.</p>${rallye.stations.map((stage) => `<section><h3>${esc(stage.title)}</h3><p class="ry-preserve">${esc(state.answers[stage.id] || "You have not written a response here yet.")}</p><button type="button" class="ry-text-link" data-ry-stage="${esc(stage.id)}">Revisit this stop ${arrow}</button>${essentialSources(stage).map(sourceCard).join("")}</section>`).join("")}</div></details>`;
  }
  function currentStage() {
    const stage = stages[state.currentIndex];
    const task = question(stage);
    const final = state.currentIndex === stages.length - 1;
    return `<article class="ry-panel ry-stage" data-ry-current="${esc(stage.id)}"><header class="ry-stage-head ry-stage-header"><div class="ry-meta"><span>${final ? "Final comment" : `Stop ${state.currentIndex + 1} of ${rallye.stations.length}`}</span>${stage.period ? `<span>${esc(stage.period)}</span>` : ""}${stage.location ? `<span>${esc(stage.location)}</span>` : ""}</div><h1 tabindex="-1" data-ry-heading>${esc(stage.title)}</h1>${stage.subtitle ? `<p class="ry-lede">${esc(stage.subtitle)}</p>` : ""}</header><div class="ry-stage-body ry-workspace"><section class="ry-context" aria-labelledby="ry-context-title"><h2 id="ry-context-title">${final ? "Bring the journey together" : "The situation"}</h2>${paragraphs(contextFor(stage))}</section>${evidence(stage)}${final ? earlierResponses() : ""}<section class="ry-task ry-investigation" aria-labelledby="ry-prompt-title"><h2 id="ry-prompt-title">Your task</h2><p class="ry-task-prompt">${esc(task.prompt)}</p>${array(task.instructions).length ? `<div class="ry-instructions">${paragraphs(task.instructions)}</div>` : ""}<div class="ry-writing"><label for="ry-answer">${esc(task.responsePurpose || (final ? "Your comment" : "Your response"))}</label><textarea id="ry-answer" rows="${final ? 13 : 8}" data-ry-written="${esc(stage.id)}" placeholder="Write your response here…">${esc(state.answers[stage.id] || "")}</textarea><div class="ry-response-footer">${saveLine()}<label class="ry-done-toggle"><input type="checkbox" data-ry-done="${esc(stage.id)}" ${state.completedStages[stage.id] ? "checked" : ""}> Mark this stop as done</label></div></div></section><div class="ry-optional-tools">${languageSupport(task)}${research(stage)}${privateNotes(stage)}</div></div><footer class="ry-actions ry-stage-footer"><button type="button" class="ry-secondary" data-ry-action="previous" ${state.currentIndex === 0 ? "disabled" : ""}>Previous stop</button><button type="button" class="ry-primary" data-ry-action="next">${final ? "Review my work" : "Next stop"} ${arrow}</button></footer></article>`;
  }
  function downloadButtons() {
    return `<button type="button" data-ry-download="txt">Text document (.txt)</button><button type="button" data-ry-download="html">Printable notebook (.html)</button><button type="button" data-ry-download="json">Notebook data (.json)</button>`;
  }
  function recoveredWork() {
    if (!state.previousAttempts.length) return "";
    return `<details class="ry-disclosure ry-recovered-work"><summary>Earlier saved work</summary><div class="ry-disclosure-body"><p>These answers are kept with their original questions in separate recovery files. They have not been attached to the new questions. Recover a readable copy or the original saved data here.</p>${state.previousAttempts.map((entry, index) => `<section><h3>Saved attempt ${index + 1}</h3><p>${esc(entry.attempt?.student?.name || "Name not supplied")} · ${esc(entry.contentRevision)}</p><div class="ry-archive-actions"><button type="button" class="ry-text-link" data-ry-download-archive="${index}" data-ry-archive-format="txt">Download earlier work (.txt)</button><button type="button" class="ry-text-link" data-ry-download-archive="${index}" data-ry-archive-format="json">Download original data (.json)</button></div></section>`).join("")}</div></details>`;
  }
  function workspaceTools() {
    return `<div class="ry-workspace-tools"><details class="ry-disclosure ry-downloads"><summary>Save a copy of your work</summary><div class="ry-disclosure-body"><p>Download or print whenever you want. Nothing is sent automatically.</p><div class="ry-download-actions">${downloadButtons()}<button type="button" data-ry-action="print">Print / save as PDF</button></div></div></details>${recoveredWork()}<details class="ry-disclosure ry-new-notebook"><summary>Start a fresh notebook</summary><div class="ry-disclosure-body"><p>Your current notebook will be kept in Earlier saved work.</p><button type="button" class="ry-text-link" data-ry-action="reset-dialog">Start a fresh notebook</button></div></details></div>`;
  }
  function review() {
    return `<article class="ry-panel ry-review"><header class="ry-stage-head ry-stage-header"><h1 tabindex="-1" data-ry-heading>Your learning notebook</h1><p class="ry-lede">Read your responses together. You can return to any stop and keep revising.</p></header><div class="ry-stage-body ry-workspace">${studentFields()}${state.finishedAt ? '<p class="ry-notice" role="status">Your review is saved. Every response is still open for editing.</p>' : ""}<ol class="ry-review-list">${stages.map((stage, index) => `<li class="ry-review-card"><div class="ry-review-item-heading"><h2><span class="ry-route-number">${index + 1}</span> ${esc(stage.title)}</h2><button type="button" class="ry-text-link" data-ry-stage="${esc(stage.id)}">Edit response ${arrow}</button></div><p class="ry-review-preview ry-preserve">${esc(state.answers[stage.id] || "No response saved here yet. You can return whenever you are ready.")}</p>${state.notebooks[stage.id]?.note ? `<details><summary>Your notes</summary><p class="ry-preserve">${esc(state.notebooks[stage.id].note)}</p></details>` : ""}</li>`).join("")}</ol><div class="ry-handin-note"><h2>Keep or share your work</h2><p>Provided source details are included automatically. Download or print your notebook, then use your class’s usual way of sharing it.</p><div class="ry-download-actions">${downloadButtons()}<button type="button" data-ry-action="print">Print / save as PDF</button></div></div><button type="button" class="ry-primary" data-ry-action="complete">Save this review ${tick}</button>${saveLine()}</div></article>`;
  }
  function render(focus = false) {
    if (destroyed) return;
    host.innerHTML = `${storageNotice ? `<p class="ry-notice" role="status">${esc(storageNotice)}</p>` : ""}<div class="ry-sr" role="status" aria-live="polite" data-ry-live></div>${screen === "intro" ? introduction() : `<div class="ry-layout">${sidebar()}${screen === "review" ? review() : currentStage()}</div>`}${workspaceTools()}<dialog class="ry-dialog" aria-labelledby="ry-reset-title" aria-describedby="ry-reset-description"><h2 id="ry-reset-title">Start a fresh notebook?</h2><p id="ry-reset-description">Your current responses will stay available with their questions in Earlier saved work. The new notebook starts empty.</p><div class="ry-dialog-actions"><button type="button" class="ry-secondary" data-ry-action="cancel-reset" autofocus>Keep writing here</button><button type="button" class="ry-primary" data-ry-action="confirm-reset">Start fresh</button></div></dialog>`;
    if (focus) {
      host.querySelector("[data-ry-heading]")?.focus({ preventScroll: true });
      host.scrollIntoView?.({ block: "start", behavior: "instant" });
    }
    onProgress(progress());
  }
  function navigate(index) {
    if (index < 0) return;
    state.currentIndex = Math.max(0, Math.min(stages.length - 1, index));
    state.startedAt ||= new Date().toISOString();
    screen = "stage";
    save();
    render(true);
  }
  function input(event) {
    const target = event.target;
    if (target.matches("[data-ry-student]"))
      state.student[target.dataset.ryStudent] = target.value;
    else if (target.matches("[data-ry-written]"))
      state.answers[target.dataset.ryWritten] = target.value;
    else if (target.matches("[data-ry-notes]"))
      notebook(stages[state.currentIndex]).note = target.value;
    else return;
    save();
  }
  function change(event) {
    const target = event.target;
    if (!target.matches("[data-ry-done]")) return;
    state = markStageDone(state, target.dataset.ryDone, target.checked);
    save();
    announce(
      target.checked
        ? "You marked this stop as done. You can still edit it."
        : "This stop is open to revisit.",
    );
  }
  function start(event) {
    if (!event.target.matches("[data-ry-start]")) return;
    event.preventDefault();
    state.startedAt ||= new Date().toISOString();
    screen = "stage";
    save();
    render(true);
  }
  function click(event) {
    const target = event.target.closest("button,[data-ry-action]");
    if (!target || !host.contains(target)) return;
    if (target.dataset.ryDownloadArchive !== undefined) {
      downloadArchive(
        Number(target.dataset.ryDownloadArchive),
        target.dataset.ryArchiveFormat,
      );
      return;
    }
    if (target.dataset.ryDownload) {
      download(target.dataset.ryDownload);
      return;
    }
    if (target.dataset.ryStage) {
      navigate(
        stages.findIndex((stage) => stage.id === target.dataset.ryStage),
      );
      return;
    }
    const action = target.dataset.ryAction;
    const stage = stages[state.currentIndex];
    switch (action) {
      case "previous":
        navigate(state.currentIndex - 1);
        break;
      case "next":
        if (state.currentIndex < stages.length - 1)
          navigate(state.currentIndex + 1);
        else {
          screen = "review";
          save();
          render(true);
        }
        break;
      case "review":
        screen = "review";
        save();
        render(true);
        break;
      case "complete":
        state.finishedAt = new Date().toISOString();
        save();
        render(true);
        announce(
          "Your review is saved. You can continue editing every response.",
        );
        break;
      case "explore":
      case "territory":
        save();
        returnFocus = `[data-ry-action="${action}"]`;
        returnScroll = { x: window.scrollX, y: window.scrollY };
        if (action === "territory" && stage.mapFocus)
          onTerritory(stage.mapFocus.territoryId, stage.mapFocus.year);
        else onExplore({ ...stage.mapFocus, returnTo: "rallye" });
        break;
      case "print":
        printReport();
        break;
      case "reset-dialog":
        resetOpener = target;
        host.querySelector("dialog").showModal();
        break;
      case "cancel-reset":
        host.querySelector("dialog").close();
        resetOpener?.focus();
        break;
      case "confirm-reset": {
        const previous = [...state.previousAttempts];
        if (
          state.startedAt ||
          Object.values(state.answers).some(Boolean) ||
          Object.values(state.notebooks).some((book) => book.note)
        )
          previous.push(preserveEarlierAttempt(state));
        const student = { ...state.student };
        state = emptyState();
        state.previousAttempts = previous;
        state.student = student;
        screen = "intro";
        storageNotice = "";
        save();
        render(true);
        break;
      }
    }
  }
  function later(callback, delay) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!destroyed) callback();
    }, delay);
    timers.add(timer);
  }
  function saveFile(content, type, filename) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    later(() => URL.revokeObjectURL(url), 1000);
  }
  function downloadArchive(index, format) {
    const entry = state.previousAttempts[index];
    if (!entry || !["txt", "json"].includes(format)) return;
    saveFile(
      format === "json"
        ? JSON.stringify(entry, null, 2)
        : recoveredAttemptText(entry),
      format === "json" ? "application/json" : "text/plain;charset=utf-8",
      `empire-echoes-earlier-work-${index + 1}.${format}`,
    );
    announce(
      "Your earlier work has been downloaded with its original questions.",
    );
  }
  function download(format) {
    if (!["txt", "html", "json"].includes(format)) return;
    const report = buildReport(state);
    const content =
      format === "json"
        ? JSON.stringify(report, null, 2)
        : format === "html"
          ? reportHTML(report)
          : reportText(report);
    const name =
      state.student.name
        .trim()
        .replace(/[^\p{L}\p{N}_-]+/gu, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || "student";
    saveFile(
      content,
      format === "json"
        ? "application/json"
        : format === "html"
          ? "text/html;charset=utf-8"
          : "text/plain;charset=utf-8",
      `empire-echoes-${name}-notebook.${format}`,
    );
    announce("Your notebook has been downloaded. You can keep writing here.");
  }
  function printReport() {
    const frame = document.createElement("iframe");
    frame.title = "Printable learning notebook";
    frame.style.cssText =
      "position:fixed;left:-10000px;top:0;width:800px;height:600px;border:0";
    frame.setAttribute("aria-hidden", "true");
    frame.onload = () => {
      if (destroyed) return;
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch {
        download("html");
        announce("Open the downloaded notebook to print your work.");
      }
    };
    frame.srcdoc = reportHTML(buildReport(state));
    document.body.append(frame);
    frames.add(frame);
    later(() => {
      frame.remove();
      frames.delete(frame);
    }, 60000);
  }
  host.addEventListener("input", input);
  host.addEventListener("change", change);
  host.addEventListener("click", click);
  host.addEventListener("submit", start);
  render();
  return {
    show() {
      if (destroyed) return;
      if (returnFocus) {
        host.querySelector(returnFocus)?.focus({ preventScroll: true });
        if (returnScroll)
          window.scrollTo({
            left: returnScroll.x,
            top: returnScroll.y,
            behavior: "instant",
          });
        returnFocus = null;
        returnScroll = null;
      } else if (!viewedOnce) {
        viewedOnce = true;
        host.querySelector("[data-ry-heading]")?.focus({ preventScroll: true });
      }
    },
    hide() {
      host.querySelector("dialog[open]")?.close();
    },
    getProgress: progress,
    destroy() {
      destroyed = true;
      frames.forEach((frame) => frame.remove());
      timers.forEach((timer) => clearTimeout(timer));
      host.removeEventListener("input", input);
      host.removeEventListener("change", change);
      host.removeEventListener("click", click);
      host.removeEventListener("submit", start);
      host.innerHTML = "";
    },
  };
}
