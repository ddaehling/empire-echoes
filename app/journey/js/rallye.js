import { rallye } from "./rallye-content.js";
import { RALLYE_RESOURCES } from "./rallye-resources.js";
import {
  LEGACY_CONTENT_REVISION,
  LEGACY_PROMPT_SNAPSHOT,
} from "./rallye-legacy-prompts.js";

export const RALLYE_STORAGE_KEY = "empire-echoes-rallye-v3";
const VERSION = 3;
export const RALLYE_CONTENT_REVISION =
  rallye.contentRevision || LEGACY_CONTENT_REVISION;
const stages = [...rallye.stations, rallye.finalAssessment];
const hasCheckpoints = stages.some((stage) => stage.checkpoint);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
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
const sourceList = (stage) => {
  const records = RALLYE_RESOURCES[stage.id] || [];
  return stage.sourceIds?.length
    ? records.filter((source) => stage.sourceIds.includes(source.id))
    : records;
};
const array = (value) => (Array.isArray(value) ? value : value ? [value] : []);
const question = (stage) => stage.investigation || stage.question || stage;
const minSources = (stage) =>
  Number(question(stage).minSources || stage.minSources || 0);
const optionLabel = (options, id) =>
  options?.find((item) => item.id === id)?.label || String(id || "No answer");
const sameSet = (a, b) =>
  a.length === b.length &&
  new Set(a).size === a.length &&
  a.every((id) => b.includes(id));
export const wordCount = (text) =>
  String(text || "")
    .trim()
    .match(/\S+/gu)?.length || 0;

export function validCitations(notebook) {
  const seen = new Set();
  return array(notebook?.citations).filter((source) => {
    const url = safeURL(source?.url);
    if (!url || !String(source?.title || "").trim() || seen.has(url))
      return false;
    seen.add(url);
    return true;
  });
}

/** Checks completion, not historical quality. Written arguments need human review. */
export function validateStage(stage, response, notebook) {
  const task = question(stage);
  const errors = [];
  const count = wordCount(response);
  if (count < task.minWords)
    errors.push(`Write at least ${task.minWords} words. You have ${count}.`);
  else if (task.maxWords && count > task.maxWords)
    errors.push(
      `Keep your response to ${task.maxWords} words or fewer. You have ${count}.`,
    );
  const sources = validCitations(notebook).length;
  if (sources < minSources(stage))
    errors.push(
      `Cite at least ${minSources(stage)} ${minSources(stage) === 1 ? "source" : "sources"} in your evidence notebook. You have ${sources}.`,
    );
  return errors.join(" ");
}

export function validateRallye(state) {
  const errors = [];
  if (!String(state.student?.name || "").trim())
    errors.push({
      id: "student",
      message: "Add your name to identify your work.",
    });
  for (const stage of stages) {
    const message = validateStage(
      stage,
      state.answers?.[stage.id],
      state.notebooks?.[stage.id],
    );
    if (message) errors.push({ id: stage.id, message });
  }
  return errors;
}

export function validateCheckpoint(task, response) {
  if (!task) return "";
  switch (task.type) {
    case "single-choice":
      return task.options.some((option) => option.id === response)
        ? ""
        : "Choose one answer.";
    case "multi-select":
      return Array.isArray(response) &&
        response.length === task.requiredSelections &&
        new Set(response).size === response.length &&
        response.every((id) => task.options.some((option) => option.id === id))
        ? ""
        : `Choose exactly ${task.requiredSelections} answers.`;
    case "order":
      return isObject(response) &&
        Array.isArray(response.order) &&
        sameSet(
          response.order,
          task.items.map((item) => item.id),
        ) &&
        response.confirmed === true
        ? ""
        : "Arrange the events, then confirm your order.";
    case "matching":
      return isObject(response) &&
        task.items.every((item) =>
          task.options.some((option) => option.id === response[item.id]),
        ) &&
        (!task.uniqueMatches ||
          new Set(task.items.map((item) => response[item.id])).size ===
            task.items.length)
        ? ""
        : "Choose a different match for every item.";
    case "map-location":
      return typeof response === "string" && !!response
        ? ""
        : "Choose a territory.";
    default:
      return "This checkpoint is unavailable.";
  }
}

/** Practice is reported separately and never contributes to the written mark. */
export function gradeRallye(state) {
  const written = stages.map((stage) => ({
    id: stage.id,
    earned: null,
    possible: Number(question(stage).points || 0),
    review: "human",
  }));
  const practice = stages
    .filter((stage) => stage.checkpoint)
    .map((stage) => {
      const task = stage.checkpoint,
        response = state.checkpoints?.[stage.id];
      const attempted = response !== undefined;
      const complete = attempted && !validateCheckpoint(task, response);
      const possible = Number(task.points || 1);
      let earned = 0;
      if (complete) {
        if (task.type === "single-choice" || task.type === "map-location")
          earned = response === task.answer ? possible : 0;
        if (task.type === "multi-select")
          earned = sameSet(response, task.answer) ? possible : 0;
        if (task.type === "order")
          earned =
            (possible *
              response.order.filter((id, index) => id === task.answer[index])
                .length) /
            task.answer.length;
        if (task.type === "matching")
          earned =
            (possible *
              task.items.filter(
                (item) => response[item.id] === task.answer[item.id],
              ).length) /
            task.items.length;
      }
      return {
        id: stage.id,
        attempted,
        complete,
        earned: Math.round(earned * 100) / 100,
        possible,
        review: "automatic-practice",
      };
    });
  return {
    written: {
      earned: null,
      pending: written.reduce((sum, item) => sum + item.possible, 0),
      items: written,
    },
    practice: {
      earned: practice.reduce((sum, item) => sum + item.earned, 0),
      possible: practice
        .filter((item) => item.attempted)
        .reduce((sum, item) => sum + item.possible, 0),
      available: practice.reduce((sum, item) => sum + item.possible, 0),
      items: practice,
    },
  };
}

function promptSnapshot() {
  return stages.map((stage) => {
    const task = question(stage);
    return {
      id: stage.id,
      title: stage.title,
      prompt: task.prompt,
      operator: task.operator || "",
      responsePurpose: task.responsePurpose || "",
      expectedWords: task.expectedWords || "",
      instructions: array(task.instructions),
      minWords: task.minWords,
      maxWords: task.maxWords,
      minSources: minSources(stage),
      points: task.points,
      rubric: array(task.rubric),
    };
  });
}

function earlierAttempts(raw) {
  return array(raw?.previousAttempts).filter(
    (entry) => isObject(entry) && isObject(entry.attempt),
  );
}

/** Keep old responses with the questions they answered, never with new prompts. */
export function preserveEarlierAttempt(raw) {
  const contentRevision = raw.contentRevision || LEGACY_CONTENT_REVISION;
  const { previousAttempts, ...attempt } = raw;
  return {
    contentRevision,
    archivedAt: new Date().toISOString(),
    promptSnapshot: Array.isArray(raw.promptSnapshot)
      ? raw.promptSnapshot
      : contentRevision === LEGACY_CONTENT_REVISION
        ? LEGACY_PROMPT_SNAPSHOT
        : [],
    attempt,
  };
}

function recoveredStages(entry) {
  const attempt = entry.attempt;
  const prompts = array(entry.promptSnapshot).filter(isObject);
  const ids = new Set([
    ...prompts.map((item) => item.id),
    ...Object.keys(attempt.answers || {}),
    ...Object.keys(attempt.notebooks || {}),
    ...Object.keys(attempt.checkpoints || {}),
  ]);
  return [...ids].map((id) => ({
    id,
    original: prompts.find((item) => item.id === id),
    response: String(attempt.answers?.[id] || ""),
    notebook: attempt.notebooks?.[id],
    checkpoint: attempt.checkpoints?.[id],
  }));
}

export function recoveredAttemptText(entry) {
  const attempt = entry.attempt;
  return `EARLIER SAVED WORK — PRESERVED ORIGINAL ATTEMPT\nContent revision: ${entry.contentRevision}\nName: ${attempt.student?.name || "Not supplied"}\nClass: ${attempt.student?.className || "Not supplied"}\nStatus: ${attempt.submittedAt ? `Completed ${attempt.submittedAt}` : "Draft"}\nThis work belongs to earlier questions. It has not been assessed against the current version.\n\n${recoveredStages(
    entry,
  )
    .map(
      ({ id, original, response, notebook, checkpoint }) =>
        `${original?.title || id}\nOriginal question: ${original?.prompt || "Unavailable in this saved attempt — consult the original assignment."}\n${array(original?.instructions).join("\n")}\n${original ? `Original guidance: ${original.expectedWords ? `target ${original.expectedWords}; ` : ""}${original.minWords}–${original.maxWords} words for completion; ${original.minSources || 0} required sources; ${original.points} written marks.\n` : ""}\nSaved response:\n${response || "No response saved"}\n\nSaved notes:\n${notebook?.note || "No notes saved"}\n\nCited sources:\n${
          validCitations(notebook)
            .map((source) => `${source.title}: ${source.url}`)
            .join("\n") || "None saved"
        }${checkpoint !== undefined ? `\n\nSaved optional checkpoint (ungraded):\n${JSON.stringify(checkpoint, null, 2)}` : ""}\n`,
    )
    .join("\n————————————————————————————\n\n")}`;
}

function recoveredAttemptHTML(entry, expanded = false) {
  return `<p><strong>Original student: ${esc(entry.attempt.student?.name || "Not supplied")}</strong>${entry.attempt.student?.className ? ` · ${esc(entry.attempt.student.className)}` : ""}</p><p><strong>Content revision: ${esc(entry.contentRevision)}</strong> · ${entry.attempt.submittedAt ? `Completed ${esc(entry.attempt.submittedAt)}` : "Draft"}</p><p>This work belongs to earlier questions. It has not been assessed against the current version.</p>${recoveredStages(
    entry,
  )
    .map(
      ({ id, original, response, notebook, checkpoint }) =>
        `<details class="ry-recovered-stage"${expanded ? " open" : ""}><summary>${esc(original?.title || id)}</summary><div>${expanded ? `<h3>${esc(original?.title || id)}</h3>` : ""}<h3>Original question</h3><p>${esc(original?.prompt || "Unavailable in this saved attempt — consult the original assignment.")}</p>${
          array(original?.instructions).length
            ? `<ul>${array(original.instructions)
                .map((text) => `<li>${esc(text)}</li>`)
                .join("")}</ul>`
            : ""
        }<h3>Saved response</h3><p class="ry-preserve answer">${esc(response || "No response saved")}</p>${notebook?.note ? `<h3>Saved notes</h3><p class="ry-preserve answer">${esc(notebook.note)}</p>` : ""}${
          validCitations(notebook).length
            ? `<h3>Cited sources</h3><ul>${validCitations(notebook)
                .map(
                  (source) =>
                    `<li><a href="${esc(safeURL(source.url))}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a><br><span class="note">${esc(safeURL(source.url))}</span></li>`,
                )
                .join("")}</ul>`
            : ""
        }${checkpoint !== undefined ? `<h3>Saved optional checkpoint · ungraded</h3><pre>${esc(JSON.stringify(checkpoint, null, 2))}</pre>` : ""}</div></details>`,
    )
    .join("")}`;
}

function emptyState() {
  return {
    version: VERSION,
    rallyeId: rallye.id,
    contentRevision: RALLYE_CONTENT_REVISION,
    promptSnapshot: promptSnapshot(),
    previousAttempts: [],
    student: { name: "", className: "" },
    answers: {},
    notebooks: {},
    checkpoints: {},
    startedAt: null,
    submittedAt: null,
    updatedAt: null,
    currentIndex: 0,
  };
}
export function normaliseSaved(raw) {
  const state = emptyState();
  if (!isObject(raw) || raw.version !== VERSION || raw.rallyeId !== rallye.id)
    return state;
  if (isObject(raw.student)) {
    state.student.name = String(raw.student.name || "").slice(0, 120);
    state.student.className = String(raw.student.className || "").slice(0, 80);
  }
  state.previousAttempts = earlierAttempts(raw);
  if (
    (raw.contentRevision || LEGACY_CONTENT_REVISION) !== RALLYE_CONTENT_REVISION
  ) {
    state.previousAttempts = [
      ...state.previousAttempts,
      preserveEarlierAttempt(raw),
    ];
    return state;
  }
  for (const stage of stages) {
    if (typeof raw.answers?.[stage.id] === "string")
      state.answers[stage.id] = raw.answers[stage.id].slice(0, 15000);
    const notebook = raw.notebooks?.[stage.id];
    if (isObject(notebook))
      state.notebooks[stage.id] = {
        note: String(notebook.note || "").slice(0, 10000),
        citations: validCitations(notebook)
          .slice(0, 30)
          .map((source) => ({
            title: String(source.title).trim().slice(0, 240),
            url: safeURL(source.url),
            ...(source.id ? { id: String(source.id).slice(0, 120) } : {}),
          })),
      };
    const task = stage.checkpoint,
      response = raw.checkpoints?.[stage.id];
    if (!task || response === undefined) continue;
    if (
      task.type === "single-choice" &&
      task.options.some((option) => option.id === response)
    )
      state.checkpoints[stage.id] = response;
    if (task.type === "map-location" && typeof response === "string")
      state.checkpoints[stage.id] = response.slice(0, 120);
    if (task.type === "multi-select" && Array.isArray(response))
      state.checkpoints[stage.id] = [
        ...new Set(
          response.filter((id) =>
            task.options.some((option) => option.id === id),
          ),
        ),
      ];
    if (
      task.type === "order" &&
      isObject(response) &&
      Array.isArray(response.order) &&
      sameSet(
        response.order,
        task.items.map((item) => item.id),
      )
    )
      state.checkpoints[stage.id] = {
        order: response.order,
        confirmed: response.confirmed === true,
      };
    if (task.type === "matching" && isObject(response))
      state.checkpoints[stage.id] = Object.fromEntries(
        task.items.map((item) => [
          item.id,
          task.options.some((option) => option.id === response[item.id])
            ? response[item.id]
            : "",
        ]),
      );
  }
  for (const key of ["startedAt", "submittedAt", "updatedAt"])
    if (typeof raw[key] === "string" && Number.isFinite(Date.parse(raw[key])))
      state[key] = raw[key];
  state.currentIndex = Number.isInteger(raw.currentIndex)
    ? Math.max(0, Math.min(stages.length - 1, raw.currentIndex))
    : 0;
  if (state.submittedAt && validateRallye(state).length)
    state.submittedAt = null;
  return state;
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
  let state = emptyState(),
    canSave = true,
    storageNotice = "",
    destroyed = false,
    validationVisible = false,
    viewedOnce = false;
  const frames = new Set(),
    timers = new Set(),
    printOpened = new Set();
  try {
    const saved = localStorage.getItem(RALLYE_STORAGE_KEY);
    if (saved) {
      const raw = JSON.parse(saved);
      state = normaliseSaved(raw);
      if (
        !isObject(raw) ||
        raw.version !== VERSION ||
        raw.rallyeId !== rallye.id
      )
        storageNotice =
          "The saved rallye uses a different format. A fresh notebook is ready.";
      else if (
        (raw.contentRevision || LEGACY_CONTENT_REVISION) !==
        RALLYE_CONTENT_REVISION
      ) {
        storageNotice =
          "The questions have changed. Your earlier work is preserved below with its original questions. A new notebook is ready for this version.";
        // One atomic write stores the archive and fresh draft together. If it fails,
        // the original stored attempt remains intact and recovery stays in memory.
        try {
          localStorage.setItem(RALLYE_STORAGE_KEY, JSON.stringify(state));
        } catch {
          canSave = false;
          storageNotice +=
            " Autosave is unavailable. Download your earlier work before leaving.";
        }
      } else if (raw.submittedAt && !state.submittedAt)
        storageNotice =
          "Some saved work was incomplete. Your attempt has reopened as a draft so you can finish it.";
    }
  } catch (error) {
    if (error instanceof SyntaxError)
      storageNotice =
        "The saved notebook could not be read. A fresh draft is ready.";
    else {
      canSave = false;
      storageNotice =
        "Autosave is unavailable. Keep this page open and download your work before leaving.";
    }
  }
  let screen = state.submittedAt
    ? "results"
    : state.startedAt
      ? "stage"
      : "intro";
  host.classList.add("rallye");
  function progress() {
    const completed = stages.filter(
      (stage) =>
        !validateStage(
          stage,
          state.answers[stage.id],
          state.notebooks[stage.id],
        ),
    ).length;
    const grades = gradeRallye(state);
    return {
      started: !!state.startedAt,
      completed,
      total: stages.length,
      submitted: !!state.submittedAt,
      currentIndex: state.currentIndex,
      minutes: rallye.minutes,
      canSave,
      pendingMarks: grades.written.pending,
      score: state.submittedAt ? grades.practice.earned : null,
      maxObjective: grades.practice.available,
    };
  }
  function statusText() {
    return canSave
      ? state.submittedAt
        ? "Completed work saved on this device"
        : state.updatedAt
          ? "Notebook saved on this device"
          : "Autosave ready on this device"
      : "Autosave unavailable · download your work";
  }
  function announce(message) {
    const live = host.querySelector("[data-ry-live]");
    if (live) live.textContent = message;
  }
  function notebook(stage) {
    return (
      state.notebooks[stage.id] ||
      (state.notebooks[stage.id] = { note: "", citations: [] })
    );
  }
  function save() {
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(RALLYE_STORAGE_KEY, JSON.stringify(state));
      canSave = true;
    } catch {
      canSave = false;
    }
    updateProgress();
    onProgress(progress());
  }
  function updateProgress() {
    const p = progress();
    host.querySelectorAll("[data-ry-save]").forEach((node) => {
      node.textContent = statusText();
      node.classList.toggle("is-unavailable", !canSave);
    });
    host
      .querySelectorAll("[data-ry-backup]")
      .forEach((node) => (node.hidden = canSave));
    host
      .querySelectorAll("[data-ry-completed]")
      .forEach(
        (node) => (node.textContent = `${p.completed} of ${p.total} ready`),
      );
    host
      .querySelectorAll("[data-ry-progress]")
      .forEach((node) => (node.value = p.completed));
    for (const stage of stages) {
      const done = !validateStage(
        stage,
        state.answers[stage.id],
        state.notebooks[stage.id],
      );
      const button = host.querySelector(`[data-ry-stage="${stage.id}"]`);
      if (!button) continue;
      button.dataset.complete = String(done);
      button.classList.toggle("is-done", done);
      const status = button.querySelector(".ry-nav-status");
      if (status)
        status.innerHTML = done
          ? `${tick}<span class="ry-sr">Ready</span>`
          : '<span class="ry-sr">Not yet complete</span>';
    }
  }
  function saveLine() {
    return `<p class="ry-save-status${canSave ? "" : " is-unavailable"}" data-ry-save>${esc(statusText())}</p><button type="button" class="ry-text-link" data-ry-backup data-ry-download="txt" ${canSave ? "hidden" : ""}>Download a backup</button>`;
  }
  function studentFields() {
    return `<div class="ry-student-fields"><div class="ry-field"><label for="ry-name">Your name <span>required</span></label><input id="ry-name" name="name" autocomplete="name" required maxlength="120" value="${esc(state.student.name)}" data-ry-student="name" ${validationVisible && !state.student.name.trim() ? 'aria-invalid="true" aria-describedby="ry-name-error"' : ""}>${validationVisible && !state.student.name.trim() ? '<p class="ry-error" id="ry-name-error">Add your name to identify your work.</p>' : ""}</div><div class="ry-field"><label for="ry-class">Class <span>optional</span></label><input id="ry-class" name="className" autocomplete="off" maxlength="80" value="${esc(state.student.className)}" data-ry-student="className"></div></div>`;
  }
  function introduction() {
    return `<div class="ry-intro"><div class="ry-hero"><span class="ry-label">${esc(rallye.activityLabel || "A 45-minute English investigation")}</span><h1 tabindex="-1" data-ry-heading>${esc(rallye.title)}</h1><p class="ry-lede">${esc(rallye.subtitle || "Follow the empire’s changing borders. Examine its legacies. Build an argument about Britain today.")}</p><dl class="ry-facts"><div><dt>Journey</dt><dd>${rallye.stations.length} stops</dd></div><div><dt>Finish</dt><dd>A written argument</dd></div><div><dt>Time</dt><dd>${rallye.minutes} minutes</dd></div></dl><div class="ry-intro-guidance"><h2>Follow the evidence</h2><p>${esc(rallye.introduction || "")}</p><details class="ry-intro-help"><summary>How the investigation works</summary>${
      array(rallye.instructions).length
        ? array(rallye.instructions)
            .map((text) => `<p>${esc(text)}</p>`)
            .join("")
        : "<p>Use the atlas and the source cards to investigate each stop. Keep an evidence notebook, then connect what you discover to the different ways people understand Britain today.</p><p>Write in your own words. You can move between stops, revisit the map and return to this device later. Your teacher will assess the strength of your evidence and reasoning.</p>"
    }<p>${esc(rallye.framing || "")}</p><p>${esc(rallye.mapReminder || "")}</p></details></div><ol class="ry-route-preview">${stages.map((stage, index) => `<li><span class="ry-route-number">${index < rallye.stations.length ? String(index + 1).padStart(2, "0") : "↗"}</span><span><strong>${esc(stage.title)}</strong><small>${esc(stage.period || (index === stages.length - 1 ? "Final argument" : ""))}</small></span><span>${stage.minutes} min</span></li>`).join("")}</ol></div><section class="ry-start" aria-labelledby="ry-start-title"><span class="ry-label">Your field notebook</span><h2 id="ry-start-title">Make this journey yours.</h2><p>Add your name to the work you will hand in.</p><form data-ry-start novalidate>${studentFields()}<button class="ry-primary" type="submit">Begin the rallye ${arrow}</button></form><p class="ry-start-note">All ${stages.length} written responses are required. ${hasCheckpoints ? "Optional checkpoints help you test your understanding." : "Your final answer draws together evidence from the journey."}</p><div class="ry-privacy-note">${saveLine()}<p>Your work stays in this browser. Download or print it to hand it in; nothing is sent automatically.</p></div></section></div>`;
  }
  function sidebar() {
    const p = progress();
    return `<aside class="ry-sidebar" aria-label="Rallye progress"><div class="ry-sidebar-heading"><span class="ry-label">Your route</span><h2>Empire to identity</h2><span data-ry-completed>${p.completed} of ${p.total} ready</span><progress data-ry-progress max="${p.total}" value="${p.completed}" aria-label="Written responses ready to complete"></progress></div><nav aria-label="Rallye stops"><ol class="ry-route">${stages
      .map((stage, index) => {
        const done = !validateStage(
          stage,
          state.answers[stage.id],
          state.notebooks[stage.id],
        );
        return `<li class="ry-route-item"><button type="button" data-ry-stage="${esc(stage.id)}" data-complete="${done}" class="${index === state.currentIndex && screen === "stage" ? "is-current" : ""} ${done ? "is-done" : ""}" ${index === state.currentIndex && screen === "stage" ? 'aria-current="step"' : ""}><span class="ry-route-number">${index < rallye.stations.length ? String(index + 1).padStart(2, "0") : "↗"}</span><span class="ry-route-label"><strong>${esc(stage.title)}</strong><small>${stage.minutes} min${stage.period ? ` · ${esc(stage.period)}` : ""}</small></span><span class="ry-nav-status">${done ? `${tick}<span class="ry-sr">Ready</span>` : '<span class="ry-sr">Not yet complete</span>'}</span></button></li>`;
      })
      .join(
        "",
      )}</ol><button type="button" class="ry-review-link${screen === "review" ? " is-current" : ""}" data-ry-action="review" ${screen === "review" ? 'aria-current="page"' : ""}>Review & hand in ${arrow}</button></nav><div class="ry-sidebar-footer"><button class="ry-text-link" type="button" data-ry-action="explore">Open the atlas ↗</button>${saveLine()}${downloads()}<button class="ry-text-link ry-reset-link" type="button" data-ry-action="reset-dialog">Start again</button></div></aside>`;
  }
  function sourceCards(stage) {
    const sources = sourceList(stage);
    if (!sources.length) return "";
    function card(source, index) {
      const url = safeURL(source.url),
        cited = validCitations(state.notebooks[stage.id]).some(
          (item) => safeURL(item.url) === url,
        );
      return `<article class="ry-source"><div class="ry-source-heading"><span class="ry-source-number">${String(index + 1).padStart(2, "0")}</span><div><span class="ry-label">${esc(source.kind || "Evidence")}</span><h3>${esc(source.title)}</h3><p class="ry-source-meta">${[source.organisation, source.date].filter(Boolean).map(esc).join(" · ")}</p></div></div>${source.excerpt ? `<p class="ry-excerpt-label">${esc(source.excerptLabel || "Original wording · short extract")}</p><blockquote>${esc(source.excerpt)}</blockquote>` : ""}<p class="ry-summary-label">${esc(source.summaryLabel || "Offline summary · paraphrase")}</p><p class="ry-source-summary">${esc(source.summary || "")}</p>${source.questionCue ? `<p class="ry-source-cue"><strong>Look for</strong> ${esc(source.questionCue)}</p>` : ""}${source.locator ? `<p class="ry-source-locator"><strong>Where to look</strong> ${esc(source.locator)}</p>` : ""}${source.context ? `<details class="ry-source-context"><summary>Who made this, and why?</summary><p>${esc(source.context)}</p></details>` : ""}<div class="ry-source-actions">${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open source ↗<span class="ry-sr"> (opens in a new tab)</span></a><button type="button" data-ry-cite-source="${index}" ${cited ? "disabled" : ""}>${cited ? "Added to notebook" : "Cite this source +"}</button>` : ""}</div></article>`;
    }
    const core = sources
      .map((source, index) => ({ source, index }))
      .filter(({ source }) => !source.optional);
    const optional = sources
      .map((source, index) => ({ source, index }))
      .filter(({ source }) => source.optional);
    return `<section class="ry-sources" aria-labelledby="ry-sources-title"><div class="ry-section-heading"><h2 id="ry-sources-title" tabindex="-1">Investigate the sources</h2><span>${core.length} core ${core.length === 1 ? "source" : "sources"}</span></div>${array(
      stage.researchInstructions,
    )
      .map((text) => `<p>${esc(text)}</p>`)
      .join(
        "",
      )}<div class="ry-source-list">${core.map(({ source, index }) => card(source, index)).join("")}</div>${optional.length ? `<details class="ry-additional-sources"><summary>Additional context · optional reading (${optional.length})</summary><div class="ry-source-list">${optional.map(({ source, index }) => card(source, index)).join("")}</div></details>` : ""}<p class="ry-source-note">The prepared cards provide the evidence for this enquiry. Open originals for optional research; distinguish the source’s words from our summaries.</p></section>`;
  }
  function rubricHTML(stage, detailed = screen === "results") {
    const rubric = array(question(stage).rubric);
    return rubric.length
      ? `<div class="ry-rubric"><h3>What your teacher will assess</h3><ul>${rubric.map((item) => `<li><span><strong>${esc(item.criterion || item.title || item)}</strong>${detailed && item.description ? `<span>${esc(item.description)}</span>` : ""}</span>${item.points !== undefined ? `<strong>${item.points} ${item.points === 1 ? "mark" : "marks"}</strong>` : ""}</li>`).join("")}</ul></div>`
      : "";
  }
  function notebookHTML(stage) {
    const book = notebook(stage),
      cited = validCitations(book),
      required = minSources(stage);
    const collected = stages
      .flatMap((other) => validCitations(state.notebooks[other.id]))
      .filter(
        (source, index, list) =>
          list.findIndex(
            (item) => safeURL(item.url) === safeURL(source.url),
          ) === index &&
          !cited.some((item) => safeURL(item.url) === safeURL(source.url)),
      );
    return `<details class="ry-notebook" ${required || cited.length || book.note ? "open" : ""}><summary><span>Evidence notebook</span><span data-ry-citation-count>${cited.length} ${cited.length === 1 ? "source" : "sources"}${required ? ` · ${required} required` : ""}</span></summary><div class="ry-notebook-body"><p class="ry-input-help">Use evidence from the sources you save in your response. A saved link alone does not show what the evidence establishes.</p><div class="ry-field"><label for="ry-notes">Notes <span>optional · not graded</span></label><textarea id="ry-notes" rows="3" maxlength="10000" data-ry-notes placeholder="A useful detail, a question, or a connection to another stop…">${esc(book.note)}</textarea></div><ul class="ry-citations" data-ry-citations>${citationsHTML(cited)}</ul>${collected.length ? `<div class="ry-reuse-sources"><label for="ry-reuse-source">Use a source from an earlier stop</label><div class="ry-inline-field"><select id="ry-reuse-source"><option value="">Choose a collected source</option>${collected.map((source, index) => `<option value="${index}">${esc(source.title)}</option>`).join("")}</select><button type="button" class="ry-secondary" data-ry-action="reuse-source">Add source</button></div></div>` : ""}<details class="ry-add-source"><summary>Add your own research source</summary><div class="ry-field"><label for="ry-source-title">Source title</label><input id="ry-source-title" maxlength="240" placeholder="For example: a museum article or historical document"></div><div class="ry-field"><label for="ry-source-url">Web address</label><input id="ry-source-url" type="url" maxlength="2000" placeholder="https://…" aria-describedby="ry-source-error"></div><p class="ry-error" id="ry-source-error" hidden></p><button type="button" class="ry-secondary" data-ry-action="add-source">Add to notebook ${arrow}</button></details></div></details>`;
  }
  function citationsHTML(citations) {
    return citations.length
      ? citations
          .map(
            (source, index) =>
              `<li><span><a href="${esc(safeURL(source.url))}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a><small>${esc(new URL(source.url).hostname)}</small></span><button type="button" data-ry-remove-citation="${index}" aria-label="Remove ${esc(source.title)} from this stop’s notebook">Remove</button></li>`,
          )
          .join("")
      : '<li class="ry-no-citations">No sources cited yet. Add a source card above or your own research.</li>';
  }
  function checkpointHTML(stage) {
    const task = stage.checkpoint;
    if (!task) return "";
    const response = state.checkpoints[stage.id];
    let inputs = "";
    if (["single-choice", "multi-select"].includes(task.type)) {
      const multiple = task.type === "multi-select";
      inputs = `<fieldset class="ry-choices"><legend>${multiple ? `Choose ${task.requiredSelections} answers` : "Choose one answer"}</legend>${task.options.map((option) => `<label class="ry-choice"><input type="${multiple ? "checkbox" : "radio"}" name="ry-check-${stage.id}" value="${esc(option.id)}" data-ry-check-response ${(multiple ? array(response).includes(option.id) : response === option.id) ? "checked" : ""}><span>${esc(option.label)}</span></label>`).join("")}</fieldset>`;
    } else if (task.type === "order") {
      const order = response?.order || task.items.map((item) => item.id);
      inputs = `<ol class="ry-order">${order.map((id, index) => `<li><span>${esc(optionLabel(task.items, id))}</span><div><button type="button" data-ry-move="${esc(id)}" data-ry-direction="-1" aria-label="Move ${esc(optionLabel(task.items, id))} earlier" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" data-ry-move="${esc(id)}" data-ry-direction="1" aria-label="Move ${esc(optionLabel(task.items, id))} later" ${index === order.length - 1 ? "disabled" : ""}>↓</button></div></li>`).join("")}</ol><label class="ry-confirm"><input type="checkbox" data-ry-confirm-order ${response?.confirmed ? "checked" : ""}> I have checked this order.</label>`;
    } else if (task.type === "matching") {
      inputs = `<div class="ry-matching">${task.items.map((item) => `<div class="ry-field"><label for="ry-match-${esc(item.id)}">${esc(item.label)}</label><select id="ry-match-${esc(item.id)}" data-ry-match="${esc(item.id)}"><option value="">Choose a match</option>${task.options.map((option) => `<option value="${esc(option.id)}" ${response?.[item.id] === option.id ? "selected" : ""}>${esc(option.label)}</option>`).join("")}</select></div>`).join("")}</div>`;
    } else if (task.type === "map-location") {
      const options =
        task.options ||
        data?.territories?.map((item) => ({ id: item.id, label: item.name })) ||
        [];
      inputs = `<div class="ry-field"><label for="ry-check-territory">Select the territory</label><select id="ry-check-territory" data-ry-check-map><option value="">Choose a territory</option>${options.map((option) => `<option value="${esc(option.id)}" ${response === option.id ? "selected" : ""}>${esc(option.label)}</option>`).join("")}</select></div>`;
    }
    return `<details class="ry-checkpoint"><summary><span>Optional checkpoint</span><span>Check your understanding</span></summary><div class="ry-checkpoint-body"><h3>${esc(task.title || "Pause and check")}</h3><p>${esc(task.prompt)}</p>${inputs}<p class="ry-input-help">Optional practice. Feedback appears when you complete the rallye. Your written work is assessed separately.</p></div></details>`;
  }
  function taskFocus(task) {
    return `<div class="ry-task-focus">${task.operator ? `<strong>${esc(task.operator)}</strong>` : ""}${task.responsePurpose ? `<p>${esc(task.responsePurpose)}</p>` : ""}<p class="ry-task-preview">${esc(task.prompt)}</p></div>`;
  }
  function languageSupport(task) {
    const support = task.support;
    if (
      !support ||
      (!array(support.stems).length && !array(support.vocabulary).length)
    )
      return "";
    return `<details class="ry-language-support"><summary>Language support · optional</summary><div><p>Use a phrase if it helps. Complete it with your own evidence and reasoning.</p>${
      array(support.vocabulary).length
        ? `<section class="ry-language-terms"><h3>Useful vocabulary</h3><ul>${array(
            support.vocabulary,
          )
            .map(
              (item) =>
                `<li>${isObject(item) ? `<strong>${esc(item.term)}</strong>${item.meaning ? ` — ${esc(item.meaning)}` : ""}` : esc(item)}</li>`,
            )
            .join("")}</ul></section>`
        : ""
    }${
      array(support.stems).length
        ? `<section class="ry-language-stems"><h3>Sentence starters</h3><ul>${array(
            support.stems,
          )
            .map((text) => `<li>${esc(text)}</li>`)
            .join("")}</ul></section>`
        : ""
    }</div></details>`;
  }
  function recoveredWork() {
    if (!state.previousAttempts.length) return "";
    return `<details class="ry-recovered-work"><summary>Earlier saved work · preserved (${state.previousAttempts.length})</summary><div><p>Your earlier answers remain with their original questions. Read or download them here; the current notebook is a separate attempt.</p>${state.previousAttempts.map((entry, index) => `<section><h2>Earlier attempt ${index + 1}</h2><button type="button" class="ry-text-link" data-ry-download-archive="${index}" data-ry-archive-format="txt">Download earlier work (.txt)</button> <button type="button" class="ry-text-link" data-ry-download-archive="${index}" data-ry-archive-format="json">Download original answer data (.json)</button>${recoveredAttemptHTML(entry)}</section>`).join("")}</div></details>`;
  }
  function currentStage() {
    const stage = stages[state.currentIndex],
      task = question(stage),
      final = state.currentIndex === stages.length - 1,
      error = validationVisible
        ? validateStage(
            stage,
            state.answers[stage.id],
            state.notebooks[stage.id],
          )
        : "";
    const focus = stage.mapFocus;
    return `<article class="ry-panel ry-stage" data-ry-current="${esc(stage.id)}"><header class="ry-stage-head"><div class="ry-meta"><span>${final ? "Final argument" : `Stop ${state.currentIndex + 1} of ${rallye.stations.length}`}</span><span>${stage.minutes} minutes</span>${stage.period ? `<span>${esc(stage.period)}</span>` : ""}</div><h1 tabindex="-1" data-ry-heading>${esc(stage.title)}</h1>${stage.subtitle ? `<p class="ry-lede">${esc(stage.subtitle)}</p>` : ""}${taskFocus(task)}<nav class="ry-stage-jumps" aria-label="Within this stop"><button type="button" class="ry-text-link" data-ry-action="jump-evidence">Read & research ↓</button><button type="button" class="ry-text-link" data-ry-action="jump-writing">Write your response ↓</button></nav></header><div class="ry-stage-body">${
      stage.context
        ? `<div class="ry-context">${array(stage.context)
            .map((text) => `<p>${esc(text)}</p>`)
            .join("")}</div>`
        : ""
    }${focus ? `<div class="ry-map-actions"><div><span class="ry-label">Locate the story</span><strong>${esc(data?.get?.(focus.territoryId)?.name || stage.location || focus.territoryId)} · ${focus.year}</strong></div><button type="button" class="ry-secondary" data-ry-action="explore">Open on the atlas ↗</button><button type="button" class="ry-text-link" data-ry-action="territory">Read the territory story ↗</button></div>` : ""}${sourceCards(stage)}<section class="ry-investigation" aria-labelledby="ry-prompt-title"><div class="ry-prompt-meta"><span class="ry-label">${final ? "Make your case" : "Your investigation"}</span><span>Required · ${task.points} marks · teacher review</span></div><h2 class="ry-prompt" id="ry-prompt-title" tabindex="-1">${esc(task.prompt)}</h2>${
      array(task.instructions).length
        ? `<ul class="ry-instructions">${array(task.instructions)
            .map((text) => `<li>${esc(text)}</li>`)
            .join("")}</ul>`
        : ""
    }${languageSupport(task)}<div class="ry-writing"><label for="ry-answer">${final ? "Your final argument" : "Your response"}</label><textarea id="ry-answer" rows="${final ? 12 : 7}" maxlength="15000" required aria-required="true" aria-describedby="ry-word-guidance ry-task-error" ${error ? 'aria-invalid="true"' : ""} data-ry-written="${esc(stage.id)}" placeholder="Write in your own words. Refer to a specific detail from the map or a source.">${esc(state.answers[stage.id] || "")}</textarea><div class="ry-word-count" id="ry-word-guidance"><span>${esc(task.expectedWords || `${task.minWords}–${task.maxWords} words`)}${task.expectedWords ? ` · maximum ${task.maxWords}` : ""}</span><output data-ry-word-count for="ry-answer">${wordCount(state.answers[stage.id])} words</output></div><p class="ry-input-help">The word count checks completeness. Your teacher will assess evidence, reasoning and nuance.</p><p class="ry-error" id="ry-task-error" ${error ? "" : "hidden"}>${esc(error)}</p></div>${notebookHTML(stage)}<details class="ry-assessment-criteria"><summary>What makes a strong response?</summary>${rubricHTML(stage)}</details><button type="button" class="ry-text-link ry-back-evidence" data-ry-action="jump-evidence">Back to the evidence ↑</button></section>${checkpointHTML(stage)}</div><footer class="ry-actions"><button type="button" class="ry-secondary" data-ry-action="previous" ${state.currentIndex === 0 ? "disabled" : ""}>Previous stop</button><span>All writing is saved as you work.</span><button type="button" class="ry-primary" data-ry-action="next">${final ? "Review my work" : "Next stop"} ${arrow}</button></footer></article>`;
  }
  function downloads() {
    return `<details class="ry-downloads"><summary>Download your work</summary><div><button type="button" data-ry-download="txt">Text document (.txt)</button><button type="button" data-ry-download="html">Printable portfolio (.html)</button><button type="button" data-ry-download="json">Answer data (.json)</button></div></details>`;
  }
  function review() {
    const errors = validateRallye(state);
    return `<article class="ry-panel ry-review"><header class="ry-stage-head"><span class="ry-label">One last look</span><h1 tabindex="-1" data-ry-heading>Review your field notebook.</h1><p class="ry-lede">Check your arguments, your evidence and the connections you have made.</p></header><div class="ry-stage-body">${studentFields()}<div class="ry-notice ${errors.length ? "" : "is-ready"}" role="status"><strong>${errors.length ? (errors.some((error) => error.id !== "student") ? `${errors.filter((error) => error.id !== "student").length} written ${errors.filter((error) => error.id !== "student").length === 1 ? "response needs" : "responses need"} attention` : "Add your name to finish.") : "Your written work is ready."}</strong><p>${errors.length ? "Every response must meet the word guidance and required source count. Select a stop below to continue." : "You can still edit your work before you complete this attempt."}</p></div><ol class="ry-review-list">${stages
      .map((stage, index) => {
        const error = validateStage(
          stage,
          state.answers[stage.id],
          state.notebooks[stage.id],
        );
        return `<li class="ry-review-card"><button type="button" data-ry-stage="${esc(stage.id)}"><span class="ry-route-number">${index + 1}</span><span><strong>${esc(stage.title)}</strong><span class="ry-review-preview">${esc(error || String(state.answers[stage.id] || "").slice(0, 190))}${!error && String(state.answers[stage.id] || "").length > 190 ? "…" : ""}</span><small>${wordCount(state.answers[stage.id])} words · ${validCitations(state.notebooks[stage.id]).length} sources</small></span><span class="ry-review-state${error ? " is-incomplete" : ""}">${error ? "Continue" : `${tick}<span class="ry-sr">Ready · Edit response</span>`}</span></button></li>`;
      })
      .join(
        "",
      )}</ol><div class="ry-handin-note"><h2>Ready to hand in?</h2><p>Completing the rallye locks this attempt${hasCheckpoints ? " and reveals optional checkpoint feedback" : ""}. All written answers still need your teacher’s review.</p><p><strong>Nothing is sent automatically.</strong> Download or print your portfolio and hand it in using your class’s usual method.</p></div><button type="button" class="ry-primary" data-ry-action="complete">Complete my rallye ${arrow}</button>${downloads()}</div></article>`;
  }
  function checkpointText(task, response) {
    if (!task) return "";
    if (task.type === "single-choice")
      return optionLabel(task.options, response);
    if (task.type === "map-location")
      return data?.get?.(response)?.name || String(response || "No answer");
    if (task.type === "multi-select")
      return array(response).length
        ? response.map((id) => optionLabel(task.options, id)).join("\n")
        : "No answer";
    if (task.type === "order")
      return (
        (response?.order || task.items.map((item) => item.id))
          .map((id, index) => `${index + 1}. ${optionLabel(task.items, id)}`)
          .join("\n") + (response?.confirmed ? "" : "\nOrder not confirmed")
      );
    if (task.type === "matching")
      return task.items
        .map(
          (item) =>
            `${item.label} → ${optionLabel(task.options, response?.[item.id])}`,
        )
        .join("\n");
    return "";
  }
  function correctCheckpoint(task) {
    if (!task) return "";
    if (task.type === "single-choice")
      return optionLabel(task.options, task.answer);
    if (task.type === "multi-select")
      return task.answer.map((id) => optionLabel(task.options, id)).join("\n");
    if (task.type === "order")
      return task.answer
        .map((id, index) => `${index + 1}. ${optionLabel(task.items, id)}`)
        .join("\n");
    if (task.type === "matching")
      return task.items
        .map(
          (item) =>
            `${item.label} → ${optionLabel(task.options, task.answer[item.id])}`,
        )
        .join("\n");
    return data?.get?.(task.answer)?.name || String(task.answer || "");
  }
  function results() {
    const grades = gradeRallye(state);
    return `<div class="ry-report"><header class="ry-report-header"><span class="ry-label">${tick} Journey completed</span><h1 tabindex="-1" data-ry-heading>Your evidence. Your argument.</h1><p class="ry-lede">${esc(state.student.name)}, your portfolio is ready to hand in.</p><div class="ry-result-summary"><p><strong>${grades.written.pending}</strong><span>written marks awaiting teacher review</span></p>${grades.practice.possible ? `<p><strong>${grades.practice.earned} / ${grades.practice.possible}</strong><span>optional practice marks · separate from your written result</span></p>` : ""}</div><p class="ry-handin-note"><strong>Nothing has been sent.</strong> Download or print your work, then give it to your teacher. There is no automatic grade for your written arguments.</p><div class="ry-report-actions"><button type="button" class="ry-primary" data-ry-action="print">Print / save as PDF</button>${downloads()}</div>${saveLine()}</header><section class="ry-results" aria-labelledby="ry-results-title"><div class="ry-section-heading"><h2 id="ry-results-title">Your completed notebook</h2><span>${stages.length} written responses</span></div>${stages
      .map((stage, index) => {
        const book = state.notebooks[stage.id],
          practice = grades.practice.items.find((item) => item.id === stage.id);
        return `<details class="ry-result"><summary><span class="ry-route-number">${index + 1}</span><span>${esc(stage.title)}</span><span>Awaiting teacher review</span></summary><div class="ry-result-body"><h3>The question</h3><p>${esc(question(stage).prompt)}</p><h3>Your response</h3><p class="ry-preserve">${esc(state.answers[stage.id])}</p>${
          validCitations(book).length
            ? `<h3>Your cited sources</h3><ul class="ry-report-citations">${validCitations(
                book,
              )
                .map(
                  (source) =>
                    `<li><a href="${esc(safeURL(source.url))}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a></li>`,
                )
                .join("")}</ul>`
            : ""
        }${book?.note ? `<details><summary>Your research notes</summary><p class="ry-preserve">${esc(book.note)}</p></details>` : ""}${rubricHTML(stage)}${practice?.attempted ? `<div class="ry-practice-feedback"><h3>Optional checkpoint · ${practice.earned} / ${practice.possible}</h3><p class="ry-preserve"><strong>Your answer</strong>\n${esc(checkpointText(stage.checkpoint, state.checkpoints[stage.id]))}</p><p class="ry-preserve"><strong>Answer and explanation</strong>\n${esc(correctCheckpoint(stage.checkpoint))}</p><p>${esc(stage.checkpoint.explanation || "")}</p></div>` : ""}</div></details>`;
      })
      .join(
        "",
      )}</section><footer class="ry-report-footer"><p>This completed attempt is locked. Download a copy before starting again.</p><button type="button" class="ry-secondary" data-ry-action="reset-dialog">Start a new rallye</button><button type="button" class="ry-text-link" data-ry-action="explore">Return to the atlas ↗</button></footer></div>`;
  }
  function render(focus = false) {
    if (destroyed) return;
    host.innerHTML = `${recoveredWork()}${storageNotice ? `<p class="ry-notice" role="status">${esc(storageNotice)}</p>` : ""}<div class="ry-sr" role="status" aria-live="polite" data-ry-live></div>${screen === "intro" ? introduction() : screen === "results" ? results() : `<div class="ry-layout">${sidebar()}${screen === "review" ? review() : currentStage()}</div>`}<dialog class="ry-dialog" aria-labelledby="ry-reset-title"><h2 id="ry-reset-title">Start a new rallye?</h2><p>Your current answers and notes will be removed from this device. Download a copy first if you want to keep them.${state.previousAttempts.length ? " Earlier preserved attempts will remain available." : ""}</p><button type="button" class="ry-text-link" data-ry-download="txt">Download this attempt (.txt)</button><div class="ry-dialog-actions"><button type="button" class="ry-secondary" data-ry-action="cancel-reset">Keep my work</button><button type="button" class="ry-primary" data-ry-action="confirm-reset">Start again</button></div></dialog>`;
    if (focus) {
      host.querySelector("[data-ry-heading]")?.focus({ preventScroll: true });
      host.scrollIntoView?.({ block: "start", behavior: "instant" });
    }
    onProgress(progress());
  }
  function updateStageError() {
    if (screen !== "stage") return;
    const stage = stages[state.currentIndex],
      task = question(stage),
      error = validationVisible
        ? validateStage(
            stage,
            state.answers[stage.id],
            state.notebooks[stage.id],
          )
        : "";
    const node = host.querySelector("#ry-task-error");
    if (node) {
      node.hidden = !error;
      node.textContent = error;
    }
    const input = host.querySelector("[data-ry-written]");
    if (input) {
      const count = wordCount(state.answers[stage.id]);
      input.setAttribute(
        "aria-invalid",
        String(
          validationVisible &&
            (count < task.minWords || (task.maxWords && count > task.maxWords)),
        ),
      );
    }
    const output = host.querySelector("[data-ry-word-count]");
    if (output) {
      const count = wordCount(state.answers[stage.id]);
      output.textContent = `${count} words`;
      output.classList.toggle("is-over-limit", count > task.maxWords);
    }
  }
  function navigate(index) {
    if (state.submittedAt) return;
    state.currentIndex = Math.max(0, Math.min(stages.length - 1, index));
    screen = "stage";
    validationVisible = false;
    save();
    render(true);
  }
  function addCitation(stage, source) {
    const url = safeURL(source?.url),
      title = String(source?.title || "").trim();
    if (!url || !title) return false;
    const book = notebook(stage);
    if (book.citations.some((item) => safeURL(item.url) === url)) {
      announce("That source is already in this notebook.");
      return false;
    }
    if (book.citations.length >= 30) {
      announce(
        "This stop already has 30 sources. Remove one before adding another.",
      );
      return false;
    }
    book.citations.push({
      title: title.slice(0, 240),
      url,
      ...(source.id ? { id: source.id } : {}),
    });
    save();
    return true;
  }
  function refreshNotebook(focusSelector) {
    const stage = stages[state.currentIndex];
    const details = host.querySelector(".ry-notebook");
    if (details) {
      details.outerHTML = notebookHTML(stage);
      host.querySelector(".ry-notebook").open = true;
    }
    const cited = validCitations(state.notebooks[stage.id]);
    host.querySelectorAll("[data-ry-cite-source]").forEach((button) => {
      const source = sourceList(stage)[Number(button.dataset.ryCiteSource)];
      const added = cited.some(
        (item) => safeURL(item.url) === safeURL(source?.url),
      );
      button.disabled = added;
      button.textContent = added ? "Added to notebook" : "Cite this source +";
    });
    updateStageError();
    if (focusSelector)
      host.querySelector(focusSelector)?.focus({ preventScroll: true });
  }
  function input(event) {
    if (state.submittedAt) return;
    const target = event.target;
    if (target.matches("[data-ry-student]")) {
      state.student[target.dataset.ryStudent] = target.value;
      save();
      if (target.dataset.ryStudent === "name" && target.value.trim()) {
        target.removeAttribute("aria-invalid");
        host.querySelector("#ry-name-error")?.remove();
      }
    } else if (target.matches("[data-ry-written]")) {
      state.answers[target.dataset.ryWritten] = target.value;
      save();
      updateStageError();
    } else if (target.matches("[data-ry-notes]")) {
      notebook(stages[state.currentIndex]).note = target.value;
      save();
    }
  }
  function change(event) {
    if (state.submittedAt) return;
    const target = event.target,
      stage = stages[state.currentIndex],
      task = stage.checkpoint;
    if (!task) return;
    if (target.matches("[data-ry-check-response]"))
      state.checkpoints[stage.id] =
        task.type === "multi-select"
          ? [...host.querySelectorAll("[data-ry-check-response]:checked")].map(
              (input) => input.value,
            )
          : target.value;
    else if (target.matches("[data-ry-match]"))
      state.checkpoints[stage.id] = {
        ...state.checkpoints[stage.id],
        [target.dataset.ryMatch]: target.value,
      };
    else if (target.matches("[data-ry-confirm-order]"))
      state.checkpoints[stage.id] = {
        order:
          state.checkpoints[stage.id]?.order ||
          task.items.map((item) => item.id),
        confirmed: target.checked,
      };
    else if (target.matches("[data-ry-check-map]"))
      state.checkpoints[stage.id] = target.value;
    else return;
    save();
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
    const action = target.dataset.ryAction;
    const stage = stages[state.currentIndex];
    if (action === "explore") {
      save();
      onExplore({ ...stage.mapFocus, returnTo: "rallye" });
      return;
    }
    if (action === "territory" && stage.mapFocus) {
      save();
      onTerritory(stage.mapFocus.territoryId, stage.mapFocus.year);
      return;
    }
    if (action === "print") {
      printReport();
      return;
    }
    if (action === "jump-writing" || action === "jump-evidence") {
      const heading = host.querySelector(
        action === "jump-writing" ? "#ry-prompt-title" : "#ry-sources-title",
      );
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      return;
    }
    if (action === "reset-dialog") {
      host.querySelector("dialog").showModal();
      return;
    }
    if (action === "cancel-reset") {
      host.querySelector("dialog").close();
      return;
    }
    if (action === "confirm-reset") {
      const preserved = state.previousAttempts;
      state = emptyState();
      state.previousAttempts = preserved;
      screen = "intro";
      validationVisible = false;
      storageNotice = "";
      save();
      render(true);
      return;
    }
    if (state.submittedAt) return;
    if (target.dataset.ryStage) {
      navigate(stages.findIndex((item) => item.id === target.dataset.ryStage));
      return;
    }
    if (target.dataset.ryCiteSource !== undefined) {
      const source = sourceList(stage)[Number(target.dataset.ryCiteSource)];
      if (addCitation(stage, source)) {
        refreshNotebook();
        announce(`Added ${source.title} to this stop’s notebook.`);
      }
      return;
    }
    if (target.dataset.ryRemoveCitation !== undefined) {
      notebook(stage).citations.splice(
        Number(target.dataset.ryRemoveCitation),
        1,
      );
      save();
      refreshNotebook(".ry-notebook summary");
      announce("Source removed from this stop’s notebook.");
      return;
    }
    if (target.dataset.ryMove) {
      const task = stage.checkpoint;
      const order = [
          ...(state.checkpoints[stage.id]?.order ||
            task.items.map((item) => item.id)),
        ],
        index = order.indexOf(target.dataset.ryMove),
        direction = Number(target.dataset.ryDirection),
        next = index + direction;
      if (index < 0 || next < 0 || next >= order.length) return;
      [order[index], order[next]] = [order[next], order[index]];
      state.checkpoints[stage.id] = { order, confirmed: false };
      save();
      const details = host.querySelector(".ry-checkpoint");
      details.outerHTML = checkpointHTML(stage);
      host.querySelector(".ry-checkpoint").open = true;
      const buttons = [...host.querySelectorAll("[data-ry-move]")].filter(
        (button) => button.dataset.ryMove === target.dataset.ryMove,
      );
      (
        buttons.find(
          (button) =>
            button.dataset.ryDirection === String(direction) &&
            !button.disabled,
        ) || buttons.find((button) => !button.disabled)
      )?.focus();
      announce(`Moved to position ${next + 1} of ${order.length}.`);
      return;
    }
    switch (action) {
      case "previous":
        navigate(state.currentIndex - 1);
        break;
      case "next":
        if (state.currentIndex < stages.length - 1)
          navigate(state.currentIndex + 1);
        else {
          screen = "review";
          render(true);
        }
        break;
      case "review":
        screen = "review";
        render(true);
        break;
      case "add-source": {
        const title = host.querySelector("#ry-source-title").value.trim(),
          url = safeURL(host.querySelector("#ry-source-url").value.trim()),
          error = host.querySelector("#ry-source-error");
        if (!title || !url) {
          error.hidden = false;
          error.textContent =
            "Add a source title and a complete web address beginning with https:// or http://.";
          host
            .querySelector(!title ? "#ry-source-title" : "#ry-source-url")
            .focus();
          return;
        }
        if (addCitation(stage, { title, url })) {
          refreshNotebook(".ry-notebook summary");
          announce("Your research source was added.");
        }
        break;
      }
      case "reuse-source": {
        const selected = host.querySelector("#ry-reuse-source").value;
        if (selected === "") {
          host.querySelector("#ry-reuse-source").focus();
          return;
        }
        const cited = validCitations(state.notebooks[stage.id]);
        const collected = stages
          .flatMap((other) => validCitations(state.notebooks[other.id]))
          .filter(
            (source, index, list) =>
              list.findIndex(
                (item) => safeURL(item.url) === safeURL(source.url),
              ) === index &&
              !cited.some((item) => safeURL(item.url) === safeURL(source.url)),
          );
        if (addCitation(stage, collected[Number(selected)])) {
          refreshNotebook(".ry-notebook summary");
          announce("Source copied into this stop’s notebook.");
        }
        break;
      }
      case "complete": {
        const errors = validateRallye(state);
        if (errors.length) {
          validationVisible = true;
          render(true);
          announce(
            `Your rallye is not complete. ${errors.length} ${errors.length === 1 ? "item needs" : "items need"} attention.`,
          );
          host
            .querySelector(
              errors[0].id === "student"
                ? "#ry-name"
                : `[data-ry-stage="${errors[0].id}"]`,
            )
            ?.focus();
          return;
        }
        state.submittedAt = new Date().toISOString();
        screen = "results";
        save();
        render(true);
        break;
      }
    }
  }
  function start(event) {
    if (!event.target.matches("[data-ry-start]")) return;
    event.preventDefault();
    if (!state.student.name.trim()) {
      validationVisible = true;
      render();
      host.querySelector("#ry-name")?.focus();
      return;
    }
    state.student.name = state.student.name.trim();
    state.startedAt = new Date().toISOString();
    screen = "stage";
    validationVisible = false;
    save();
    render(true);
  }
  function reportData() {
    const grades = state.submittedAt ? gradeRallye(state) : null;
    return {
      rallye: {
        id: rallye.id,
        title: rallye.title,
        version: VERSION,
        contentRevision: RALLYE_CONTENT_REVISION,
        minutes: rallye.minutes,
      },
      student: { ...state.student },
      status: state.submittedAt ? "completed" : "draft",
      startedAt: state.startedAt,
      submittedAt: state.submittedAt,
      exportedAt: new Date().toISOString(),
      note: `Saved locally. Nothing has been sent to a teacher or a server. Written responses require human assessment.${hasCheckpoints ? " Optional checkpoint marks are separate practice." : ""}`,
      grades,
      previousAttempts: state.previousAttempts,
      stages: stages.map((stage) => ({
        id: stage.id,
        title: stage.title,
        minutes: stage.minutes,
        period: stage.period || "",
        context: stage.context || "",
        mapFocus: stage.mapFocus || null,
        prompt: question(stage).prompt,
        operator: question(stage).operator || "",
        responsePurpose: question(stage).responsePurpose || "",
        instructions: array(question(stage).instructions),
        points: question(stage).points,
        wordGuidance: {
          target: question(stage).expectedWords || "",
          min: question(stage).minWords,
          max: question(stage).maxWords,
        },
        response: state.answers[stage.id] || "",
        wordCount: wordCount(state.answers[stage.id]),
        complete: !validateStage(
          stage,
          state.answers[stage.id],
          state.notebooks[stage.id],
        ),
        citations: validCitations(state.notebooks[stage.id]),
        notes: state.notebooks[stage.id]?.note || "",
        providedSources: sourceList(stage),
        rubric: array(question(stage).rubric).map((item) =>
          state.submittedAt
            ? item
            : { criterion: item.criterion, points: item.points },
        ),
        ...(stage.checkpoint
          ? {
              checkpoint: {
                title: stage.checkpoint.title,
                prompt: stage.checkpoint.prompt,
                response: checkpointText(
                  stage.checkpoint,
                  state.checkpoints[stage.id],
                ),
                responseData: state.checkpoints[stage.id] ?? null,
                ...(state.submittedAt
                  ? {
                      grade: grades.practice.items.find(
                        (item) => item.id === stage.id,
                      ),
                      correctAnswer: correctCheckpoint(stage.checkpoint),
                      explanation: stage.checkpoint.explanation || "",
                    }
                  : {}),
              },
            }
          : {}),
      })),
    };
  }
  function reportText(report) {
    return `${report.rallye.title}\n${report.status === "completed" ? "COMPLETED PORTFOLIO" : "DRAFT — NOT YET COMPLETED"}\nContent revision: ${report.rallye.contentRevision}\n\nName: ${report.student.name}\nClass: ${report.student.className || "Not supplied"}\n${report.submittedAt ? `Completed: ${report.submittedAt}\n` : ""}${report.grades ? `Written marks awaiting teacher review: ${report.grades.written.pending}\n${report.grades.practice.available ? `Optional practice (separate): ${report.grades.practice.earned} / ${report.grades.practice.possible} attempted marks\n` : ""}` : ""}\n${report.note}\n\n${report.stages.map((stage, index) => `${index + 1}. ${stage.title} (${stage.minutes} minutes, ${stage.points} written marks)\n${stage.period}\n${array(stage.context).join("\n\n")}\n\nQuestion: ${stage.prompt}\n${stage.instructions.map((text) => `- ${text}`).join("\n")}\n\nYour response (${stage.wordCount} words):\n${stage.response || "No response yet"}\n\nYour cited sources:\n${stage.citations.map((source) => `- ${source.title}: ${source.url}`).join("\n") || "None yet"}\n${stage.notes ? `\nResearch notes:\n${stage.notes}\n` : ""}\nTeacher review criteria:\n${stage.rubric.map((item) => `- ${item.criterion || item.title || item}${item.points !== undefined ? ` (${item.points} ${item.points === 1 ? "mark" : "marks"})` : ""}${item.description ? `: ${item.description}` : ""}`).join("\n")}\n\nProvided source summaries:\n${stage.providedSources.map((source) => `${source.title} — ${source.organisation || ""}\n${source.url}\n${source.excerpt ? `${source.excerptLabel || "Original wording · short extract"}:\n${source.excerpt}\n` : ""}${source.summaryLabel || "Offline summary · paraphrase"}:\n${source.summary || ""}\n${source.context || ""}`).join("\n\n")}${stage.checkpoint ? `\n\nOptional checkpoint:\n${stage.checkpoint.prompt}\nYour answer: ${stage.checkpoint.response}\n${stage.checkpoint.grade ? `Practice mark: ${stage.checkpoint.grade.attempted ? `${stage.checkpoint.grade.earned} / ${stage.checkpoint.grade.possible}` : "Not attempted"}\nCorrect answer: ${stage.checkpoint.correctAnswer}\n${stage.checkpoint.explanation}\n` : ""}` : ""}`).join("\n\n————————————————————————————\n\n")}${report.previousAttempts.length ? `\n\nEARLIER ATTEMPTS — SEPARATE FROM THIS PORTFOLIO\n\n${report.previousAttempts.map(recoveredAttemptText).join("\n\n")}` : ""}`;
  }
  function reportHTML(report) {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(report.student.name)} — Empire / Echoes portfolio</title><style>body{max-width:820px;margin:40px auto;padding:0 24px;color:#20242b;font:16px/1.55 system-ui,sans-serif}h1,h2{font-family:Georgia,serif;line-height:1.2}h1{font-size:36px}h2{font-size:25px;margin-top:36px}h3{font-size:16px;margin:20px 0 5px}a{color:#263fb5;overflow-wrap:anywhere}.meta{padding:16px 0;border-block:1px solid #cdd2dc}.answer{white-space:pre-wrap;overflow-wrap:anywhere}.note{font-size:14px;color:#555c66}section{border-bottom:1px solid #cdd2dc;padding-bottom:22px}li{margin-bottom:6px}button{font:inherit;padding:10px 16px;cursor:pointer}header{margin-bottom:32px}.sources article{margin:15px 0}.criterion{break-inside:avoid}summary{font-weight:600}@media print{@page{margin:15mm}body{margin:0;padding:0;font-size:10.5pt;line-height:1.4}button{display:none}h1{font-size:24pt}h2{font-size:17pt;break-after:avoid}h3{font-size:11pt;break-after:avoid}section{break-inside:avoid}p,li{orphans:3;widows:3}.meta,.references,.criterion{break-inside:avoid}.note{font-size:10pt}a{color:inherit}.sources{display:none}details>summary{display:none}details>div{display:block}}</style></head><body><header><button onclick="window.print()">Print / save as PDF</button><h1>${esc(report.rallye.title)}</h1><p>${report.status === "completed" ? "Completed portfolio" : "Draft — not yet completed"}</p><p class="note">Content revision: ${esc(report.rallye.contentRevision)}</p><div class="meta"><strong>${esc(report.student.name)}</strong>${report.student.className ? ` · ${esc(report.student.className)}` : ""}${report.submittedAt ? `<br>Completed ${esc(new Date(report.submittedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }))}` : ""}${report.grades ? `<p><strong>${report.grades.written.pending} written marks awaiting teacher review</strong>${report.grades.practice.possible ? `<br>Optional practice: ${report.grades.practice.earned} / ${report.grades.practice.possible} attempted marks (separate)` : ""}</p>` : ""}</div><p class="note">${esc(report.note)}</p></header>${report.stages
      .map(
        (stage, index) =>
          `<section><h2>${index + 1}. ${esc(stage.title)}</h2><p class="note">${esc(stage.period)} · ${stage.minutes} minutes · ${stage.points} written marks</p><h3>The question</h3><p>${esc(stage.prompt)}</p><h3>Your response · ${stage.wordCount} words</h3>${(
            stage.response || "No response yet"
          )
            .split(/\n\s*\n/)
            .map((paragraph) => `<p class="answer">${esc(paragraph)}</p>`)
            .join(
              "",
            )}<div class="references"><h3>Your cited sources</h3>${stage.citations.length ? `<ul>${stage.citations.map((source) => `<li><a href="${esc(safeURL(source.url))}">${esc(source.title)}</a><br><span class="note">${esc(safeURL(source.url))}</span></li>`).join("")}</ul>` : "<p>None yet</p>"}</div>${stage.notes ? `<h3>Research notes</h3><p class="answer">${esc(stage.notes)}</p>` : ""}<div class="criterion"><h3>Teacher review criteria</h3><ul>${stage.rubric.map((item) => `<li><strong>${esc(item.criterion || item.title || item)}</strong>${item.points !== undefined ? ` (${item.points} ${item.points === 1 ? "mark" : "marks"})` : ""}</li>`).join("")}</ul><p>Teacher’s mark: ______ / ${stage.points}</p><p>Feedback: _______________________________________________________</p></div>${stage.checkpoint?.grade ? `<div class="criterion"><h3>Optional checkpoint · separate practice</h3><p>${esc(stage.checkpoint.prompt)}</p><p class="answer"><strong>Your answer</strong>\n${esc(stage.checkpoint.response)}</p><p>${stage.checkpoint.grade.attempted ? `${stage.checkpoint.grade.earned} / ${stage.checkpoint.grade.possible}` : "Not attempted"}</p><p class="answer"><strong>Answer and explanation</strong>\n${esc(stage.checkpoint.correctAnswer)}\n${esc(stage.checkpoint.explanation)}</p></div>` : ""}<details class="sources"><summary>Provided source summaries · optional reference</summary><div>${stage.providedSources.map((source) => `<article><h3>${esc(source.title)}</h3><p class="note">${esc(source.organisation || "")} · <a href="${esc(safeURL(source.url))}">${esc(safeURL(source.url))}</a></p>${source.excerpt ? `<p class="note">${esc(source.excerptLabel || "Original wording · short extract")}</p><blockquote>${esc(source.excerpt)}</blockquote>` : ""}<p class="note">${esc(source.summaryLabel || "Offline summary · paraphrase")}</p><p>${esc(source.summary || "")}</p><p class="note">${esc(source.context || "")}</p></article>`).join("")}</div></details></section>`,
      )
      .join(
        "",
      )}${report.previousAttempts.length ? `<section><h2>Earlier saved work · separate attempts</h2>${report.previousAttempts.map((entry) => recoveredAttemptHTML(entry, true)).join("")}</section>` : ""}</body></html>`;
  }
  function later(callback, delay) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  }
  function downloadArchive(index, format) {
    const entry = state.previousAttempts[index];
    if (!entry || !["txt", "json"].includes(format)) return;
    const content =
      format === "json"
        ? JSON.stringify(entry, null, 2)
        : recoveredAttemptText(entry);
    const url = URL.createObjectURL(
      new Blob([content], {
        type:
          format === "json" ? "application/json" : "text/plain;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `empire-echoes-earlier-attempt-${index + 1}.${format}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    later(() => URL.revokeObjectURL(url), 1000);
    announce(
      "Your earlier saved work has been downloaded with its original questions.",
    );
  }
  function download(format) {
    if (!["txt", "html", "json"].includes(format)) return;
    const report = reportData(),
      content =
        format === "json"
          ? JSON.stringify(report, null, 2)
          : format === "html"
            ? reportHTML(report)
            : reportText(report);
    const blob = new Blob([content], {
      type:
        format === "json"
          ? "application/json"
          : format === "html"
            ? "text/html;charset=utf-8"
            : "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob),
      anchor = document.createElement("a");
    anchor.href = url;
    const name =
      state.student.name
        .trim()
        .replace(/[^\p{L}\p{N}_-]+/gu, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || "student";
    anchor.download = `empire-echoes-${name}-${state.submittedAt ? "completed" : "draft"}.${format}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    later(() => URL.revokeObjectURL(url), 1000);
    announce(
      "Your portfolio has been downloaded. Hand in the file using your class’s usual method.",
    );
  }
  function printReport() {
    const frame = document.createElement("iframe");
    frame.title = "Printable rallye portfolio";
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
        announce("Open the downloaded portfolio to print your work.");
      }
    };
    frame.srcdoc = reportHTML(reportData());
    document.body.append(frame);
    frames.add(frame);
    later(() => {
      frame.remove();
      frames.delete(frame);
    }, 60000);
  }
  function beforePrint() {
    if (screen !== "results" || host.hidden) return;
    host.querySelectorAll(".ry-result:not([open])").forEach((details) => {
      printOpened.add(details);
      details.open = true;
    });
  }
  function afterPrint() {
    printOpened.forEach((details) => (details.open = false));
    printOpened.clear();
  }
  host.addEventListener("input", input);
  host.addEventListener("change", change);
  host.addEventListener("click", click);
  host.addEventListener("submit", start);
  window.addEventListener("beforeprint", beforePrint);
  window.addEventListener("afterprint", afterPrint);
  render();
  return {
    show() {
      if (destroyed) return;
      if (!viewedOnce) {
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
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
      host.innerHTML = "";
    },
  };
}
