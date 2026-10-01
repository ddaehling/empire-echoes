import { assessment } from "./assessment-content.js";
import { createMap } from "../../js/classroom/map.js";

export const ASSESSMENT_STORAGE_KEY = "empire-classroom-assessment-v2";
const VERSION = 2;
const tasks = assessment.tasks;
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const check =
  '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>';
const arrow =
  '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg>';
const isObject = (value) =>
  !!value && typeof value === "object" && !Array.isArray(value);
const sameSet = (a, b) =>
  a.length === b.length &&
  new Set(a).size === a.length &&
  a.every((id) => b.includes(id));
const safeURL = (value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};
const humanTask = (task) =>
  task.review === "human" ||
  ["source-analysis", "extended-writing"].includes(task.type);
const optionLabel = (options, id) =>
  options?.find((option) => option.id === id)?.label ||
  String(id || "No answer");
export const wordCount = (text) =>
  String(text || "")
    .trim()
    .match(/\S+/gu)?.length || 0;

/** Completeness only. Correct answers and explanations stay hidden until submit. */
export function validateTask(task, response) {
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
        : "Arrange the events, then confirm that you have checked your order.";
    case "matching":
      if (
        !isObject(response) ||
        task.items.some(
          (item) =>
            !task.options.some((option) => option.id === response[item.id]),
        )
      )
        return "Choose a match for every item.";
      return task.uniqueMatches &&
        new Set(task.items.map((item) => response[item.id])).size !==
          task.items.length
        ? "Use each answer only once. Check the repeated matches."
        : "";
    case "map-location":
      return isObject(response) &&
        typeof response.territoryId === "string" &&
        response.territoryId
        ? ""
        : "Select a territory on the map or from the list.";
    case "source-analysis":
    case "extended-writing": {
      const words = wordCount(response);
      if (words < task.minWords)
        return `Write at least ${task.minWords} words. You have ${words}.`;
      return task.maxWords && words > task.maxWords
        ? `Keep your response to ${task.maxWords} words or fewer. You have ${words}.`
        : "";
    }
    default:
      return "This task could not be loaded.";
  }
}

export function validateAssessment(state) {
  const errors = [];
  if (!String(state.student?.name || "").trim())
    errors.push({
      id: "student",
      message: "Add your name to identify your work.",
    });
  for (const task of tasks) {
    const message = validateTask(task, state.answers?.[task.id]);
    if (message) errors.push({ id: task.id, message });
  }
  return errors;
}

/** The score is derived from responses, never restored from stored score fields. */
export function gradeAssessment(state) {
  const items = tasks.map((task) => {
    const response = state.answers?.[task.id];
    if (humanTask(task))
      return {
        id: task.id,
        earned: null,
        possible: task.points,
        review: "human",
      };
    let earned = 0;
    if (!validateTask(task, response)) {
      switch (task.type) {
        case "single-choice":
          earned = response === task.answer ? task.points : 0;
          break;
        case "multi-select":
          earned = response.filter((id) => task.answer.includes(id)).length;
          break;
        case "order":
          earned = response.order.filter(
            (id, index) => id === task.answer[index],
          ).length;
          break;
        case "matching":
          earned = task.items.filter(
            (item) => response[item.id] === task.answer[item.id],
          ).length;
          break;
        case "map-location":
          earned =
            response.territoryId === task.answer.territoryId ? task.points : 0;
          break;
      }
    }
    return {
      id: task.id,
      earned: Math.min(task.points, earned),
      possible: task.points,
      review: "automatic",
    };
  });
  return {
    earned: items.reduce((sum, item) => sum + (item.earned || 0), 0),
    possible: items
      .filter((item) => item.review === "automatic")
      .reduce((sum, item) => sum + item.possible, 0),
    pending: items
      .filter((item) => item.review === "human")
      .reduce((sum, item) => sum + item.possible, 0),
    items,
  };
}

function emptyState() {
  return {
    version: VERSION,
    assessmentId: assessment.id,
    student: { name: "", className: "" },
    answers: {},
    startedAt: null,
    submittedAt: null,
    updatedAt: null,
    currentIndex: 0,
  };
}

function normaliseSaved(raw, data) {
  const state = emptyState();
  if (
    !isObject(raw) ||
    raw.version !== VERSION ||
    raw.assessmentId !== assessment.id
  )
    return state;
  if (isObject(raw.student)) {
    state.student.name = String(raw.student.name || "").slice(0, 120);
    state.student.className = String(raw.student.className || "").slice(0, 80);
  }
  for (const task of tasks) {
    const response = raw.answers?.[task.id];
    if (response === undefined) continue;
    switch (task.type) {
      case "single-choice":
        if (task.options.some((option) => option.id === response))
          state.answers[task.id] = response;
        break;
      case "multi-select":
        if (Array.isArray(response))
          state.answers[task.id] = [
            ...new Set(
              response.filter((id) =>
                task.options.some((option) => option.id === id),
              ),
            ),
          ];
        break;
      case "order":
        if (
          isObject(response) &&
          Array.isArray(response.order) &&
          sameSet(
            response.order,
            task.items.map((item) => item.id),
          )
        )
          state.answers[task.id] = {
            order: response.order,
            confirmed: response.confirmed === true,
          };
        break;
      case "matching":
        if (isObject(response))
          state.answers[task.id] = Object.fromEntries(
            task.items.map((item) => [
              item.id,
              task.options.some((option) => option.id === response[item.id])
                ? response[item.id]
                : "",
            ]),
          );
        break;
      case "map-location":
        if (isObject(response) && data.get(response.territoryId))
          state.answers[task.id] = { territoryId: response.territoryId };
        break;
      case "source-analysis":
      case "extended-writing":
        if (typeof response === "string")
          state.answers[task.id] = response.slice(0, 15000);
        break;
    }
  }
  for (const key of ["startedAt", "submittedAt", "updatedAt"])
    if (typeof raw[key] === "string" && Number.isFinite(Date.parse(raw[key])))
      state[key] = raw[key];
  state.currentIndex = Number.isInteger(raw.currentIndex)
    ? Math.max(0, Math.min(tasks.length - 1, raw.currentIndex))
    : 0;
  if (state.submittedAt && validateAssessment(state).length)
    state.submittedAt = null;
  return state;
}

export function createAssessment(
  host,
  { data, onProgress = () => {}, onExplore = () => {} },
) {
  let state = emptyState();
  let canSave = true;
  let storageNotice = "";
  let map = null;
  let destroyed = false;
  let validationVisible = false;
  let viewedOnce = false;
  const frames = new Set();
  const printOpened = new Set();
  try {
    const saved = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = normaliseSaved(parsed, data);
      if (
        !isObject(parsed) ||
        parsed.version !== VERSION ||
        parsed.assessmentId !== assessment.id
      )
        storageNotice =
          "The saved assessment uses a different format. A fresh draft is ready.";
      else if (parsed.submittedAt && !state.submittedAt)
        storageNotice =
          "Some saved answers were incomplete. Your attempt has reopened as a draft so you can finish it.";
    }
  } catch (error) {
    if (error instanceof SyntaxError)
      storageNotice =
        "The saved attempt could not be read. A fresh draft is ready.";
    else {
      canSave = false;
      storageNotice =
        "Autosave is unavailable. Keep this page open and download your work before leaving.";
    }
  }
  let screen = state.submittedAt
    ? "results"
    : state.startedAt
      ? "task"
      : "intro";
  host.classList.add("assessment");

  function progress() {
    const completed = tasks.filter(
      (task) => !validateTask(task, state.answers[task.id]),
    ).length;
    const score = state.submittedAt ? gradeAssessment(state) : null;
    return {
      started: !!state.startedAt,
      completed,
      total: tasks.length,
      submitted: !!state.submittedAt,
      score: score?.earned ?? null,
      maxObjective:
        score?.possible ??
        tasks
          .filter((task) => !humanTask(task))
          .reduce((sum, task) => sum + task.points, 0),
      pendingMarks:
        score?.pending ??
        tasks.filter(humanTask).reduce((sum, task) => sum + task.points, 0),
      canSave,
    };
  }
  function statusText() {
    return canSave
      ? state.submittedAt
        ? "Completed attempt saved on this device"
        : state.updatedAt
          ? "Draft saved on this device"
          : "Autosave ready on this device"
      : "Autosave unavailable · download your work";
  }
  function announce(message) {
    const live = host.querySelector("[data-as-live]");
    if (live) live.textContent = message;
  }
  function save() {
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(state));
      canSave = true;
    } catch {
      canSave = false;
    }
    updateProgress();
    onProgress(progress());
  }
  function updateProgress() {
    const p = progress();
    host.querySelectorAll("[data-as-save]").forEach((node) => {
      node.textContent = statusText();
      node.classList.toggle("is-unavailable", !canSave);
    });
    host.querySelectorAll("[data-as-backup]").forEach((node) => {
      node.hidden = canSave;
    });
    host.querySelectorAll("[data-as-completed]").forEach((node) => {
      node.textContent = `${p.completed} of ${p.total} ready`;
    });
    host.querySelectorAll("[data-as-progress]").forEach((node) => {
      node.value = p.completed;
    });
    for (const task of tasks) {
      const done = !validateTask(task, state.answers[task.id]);
      const button = host.querySelector(`[data-as-task="${task.id}"]`);
      if (!button) continue;
      button.classList.toggle("is-done", done);
      const status = button.querySelector(".as-nav-status");
      if (status)
        status.innerHTML = done
          ? `${check}<span class="as-sr">Answer complete</span>`
          : '<span class="as-sr">Answer incomplete</span>';
    }
  }
  function saveLine() {
    return `<p class="as-save${canSave ? "" : " is-unavailable"}" data-as-save>${esc(statusText())}</p><button type="button" class="text-link as-backup" data-as-backup data-as-download="txt" ${canSave ? "hidden" : ""}>Download a backup</button>`;
  }
  function footer() {
    return `<div class="as-bottom-note">${saveLine()}<span>Your work stays in this browser until you download it.</span></div>`;
  }
  function studentFields() {
    return `<div class="as-student-fields"><div><label for="as-name">Your name <span>required</span></label><input id="as-name" name="name" autocomplete="name" required maxlength="120" value="${esc(state.student.name)}" data-as-student="name" ${validationVisible && !state.student.name.trim() ? 'aria-invalid="true" aria-describedby="as-name-error"' : ""}>${validationVisible && !state.student.name.trim() ? '<p class="as-error" id="as-name-error">Add your name to identify your work.</p>' : ""}</div><div><label for="as-class">Class <span>optional</span></label><input id="as-class" name="className" autocomplete="off" maxlength="80" value="${esc(state.student.className)}" data-as-student="className"></div></div>`;
  }
  function introduction() {
    const objective = tasks
      .filter((task) => !humanTask(task))
      .reduce((sum, task) => sum + task.points, 0);
    const written = tasks
      .filter(humanTask)
      .reduce((sum, task) => sum + task.points, 0);
    return `<div class="as-intro"><div class="as-intro-copy"><span class="as-section-label">From exploration to understanding</span><h1 tabindex="-1" data-as-heading>Your assessment</h1><p class="as-intro-lede">Make connections. Weigh the evidence. Show what you understand about the British Empire.</p><dl class="as-facts"><div><dt>Time to allow</dt><dd>${assessment.minutes} minutes</dd></div><div><dt>What to complete</dt><dd>${tasks.length} required tasks</dd></div><div><dt>Available marks</dt><dd>${objective + written} in total</dd></div></dl><div class="as-intro-guidance"><h2>Work at your own pace</h2><p>Move freely between tasks and return to the atlas whenever you need it. Your answers are saved as you work. Feedback appears after you complete all eight tasks and submit your attempt.</p><p>${objective} marks are checked automatically. Your two written responses carry ${written} marks for your teacher to review.</p></div></div><div class="as-start"><h2>Make this work yours</h2><p>Your name appears on the copy you hand in.</p><form data-as-start novalidate>${studentFields()}<button class="button button-primary as-start-button" type="submit">Start assessment ${arrow}</button></form><p class="as-start-note">Suggested time, not a countdown. You can leave and return on this device.</p>${footer()}</div></div>`;
  }
  function sidebar() {
    const p = progress();
    return `<aside class="as-sidebar" aria-label="Assessment progress"><div class="as-sidebar-title"><h2>Your assessment</h2><span data-as-completed>${p.completed} of ${p.total} ready</span><progress data-as-progress max="${p.total}" value="${p.completed}" aria-label="Tasks ready to submit"></progress></div><nav aria-label="Assessment tasks"><ol class="as-task-list">${tasks.map((task, index) => `<li><button type="button" data-as-task="${esc(task.id)}" class="${index === state.currentIndex && screen === "task" ? "is-current" : ""} ${!validateTask(task, state.answers[task.id]) ? "is-done" : ""}" ${index === state.currentIndex && screen === "task" ? 'aria-current="step"' : ""}><span class="as-task-number">${index + 1}</span><span class="as-nav-label">${esc(task.title)}</span><span class="as-nav-status">${!validateTask(task, state.answers[task.id]) ? `${check}<span class="as-sr">Answer complete</span>` : '<span class="as-sr">Answer incomplete</span>'}</span></button></li>`).join("")}</ol><button type="button" class="as-review-link ${screen === "review" ? "is-current" : ""}" data-as-action="review" ${screen === "review" ? 'aria-current="page"' : ""}>Review & finish ${arrow}</button></nav><div class="as-sidebar-footer"><button class="text-link" type="button" data-as-action="explore">Return to the atlas ↗</button>${saveLine()}</div></aside>`;
  }
  function sourceHTML(source) {
    if (!source) return "";
    const url = safeURL(source.url);
    return `<figure class="as-source"><figcaption><strong>${esc(source.title)}</strong><span>${[source.author, source.date].filter(Boolean).map(esc).join(" · ")}</span></figcaption><blockquote>${esc(source.excerpt)}</blockquote>${source.purpose ? `<p class="as-source-context">${esc(source.purpose)}</p>` : ""}${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">View source ↗</a>` : ""}</figure>`;
  }
  function optionsHTML(task, response, multiple) {
    return `<fieldset class="as-choices"><legend>${multiple ? `Choose ${task.requiredSelections} answers` : "Choose one answer"}</legend>${task.options.map((option, index) => `<label class="as-choice"><input type="${multiple ? "checkbox" : "radio"}" name="${esc(task.id)}" value="${esc(option.id)}" data-as-response="${esc(task.id)}" ${(multiple ? (response || []).includes(option.id) : response === option.id) ? "checked" : ""}><span class="as-choice-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span><span>${esc(option.label)}</span></label>`).join("")}</fieldset>`;
  }
  function taskInputs(task) {
    const response = state.answers[task.id];
    switch (task.type) {
      case "single-choice":
        return optionsHTML(task, response, false);
      case "multi-select":
        return optionsHTML(task, response, true);
      case "order": {
        const order = response?.order || task.items.map((item) => item.id);
        return `<div class="as-order-instruction"><span>First</span><span>Use the arrows to arrange the events</span></div><ol class="as-order">${order.map((id, index) => `<li><span class="as-order-number" aria-hidden="true">${index + 1}</span><span class="as-order-label">${esc(optionLabel(task.items, id))}</span><div class="as-order-controls"><button type="button" data-as-move="${esc(id)}" data-as-direction="-1" aria-label="Move ${esc(optionLabel(task.items, id))} earlier" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" data-as-move="${esc(id)}" data-as-direction="1" aria-label="Move ${esc(optionLabel(task.items, id))} later" ${index === order.length - 1 ? "disabled" : ""}>↓</button></div></li>`).join("")}</ol><div class="as-order-end">Last</div><label class="as-confirm-order"><input type="checkbox" data-as-confirm="${esc(task.id)}" ${response?.confirmed ? "checked" : ""}><span>I have checked this order.</span></label>`;
      }
      case "matching":
        return `<div class="as-matching">${task.items.map((item) => `<div class="as-match-row"><label for="as-match-${esc(item.id)}">${esc(item.label)}</label><span aria-hidden="true">→</span><select id="as-match-${esc(item.id)}" data-as-match="${esc(item.id)}"><option value="">Choose a match</option>${task.options.map((option) => `<option value="${esc(option.id)}" ${response?.[item.id] === option.id ? "selected" : ""}>${esc(option.label)}</option>`).join("")}</select></div>`).join("")}</div>`;
      case "map-location": {
        const options =
          task.mapOptions ||
          [...data.territories]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((territory) => ({ id: territory.id, label: territory.name }));
        const selectedId = response?.territoryId;
        const selected = selectedId && data.get(selectedId);
        const extra =
          selected && !options.some((option) => option.id === selected.id)
            ? `<option value="${esc(selected.id)}" selected>${esc(selected.name)}</option>`
            : "";
        return `<div class="as-map-wrap"><div class="as-map-caption"><span>World map · ${task.year}</span><span>Click a territory to select it</span></div><div class="as-map" data-as-map></div><div class="as-map-legend"><span><i></i>British authority</span><span>Modern boundaries are approximate.</span></div></div><div class="as-map-answer"><label for="as-map-select">Your selected territory</label><select id="as-map-select" data-as-map-select><option value="">Choose a territory</option>${options.map((option) => `<option value="${esc(option.id)}" ${selectedId === option.id ? "selected" : ""}>${esc(option.label || option.name)}</option>`).join("")}${extra}</select><p class="as-input-help">The list and the map record the same answer. Use whichever works best for you.</p></div>`;
      }
      case "source-analysis":
      case "extended-writing":
        return `${sourceHTML(task.source)}${task.evidence?.length ? `<div class="as-evidence"><h2>Evidence to consider</h2>${task.evidence.map((item) => `<p><strong>${esc(item.title)}</strong> ${esc(item.text)}</p>`).join("")}</div>` : ""}<div class="as-written"><label for="as-written-${esc(task.id)}">Your response</label><textarea id="as-written-${esc(task.id)}" rows="${task.type === "extended-writing" ? 10 : 7}" maxlength="15000" data-as-written="${esc(task.id)}" aria-describedby="as-word-guidance as-task-error">${esc(response || "")}</textarea><div class="as-writing-meta" id="as-word-guidance"><span>${task.minWords}–${task.maxWords} words</span><output data-as-word-count for="as-written-${esc(task.id)}">${wordCount(response)} words</output></div><p class="as-input-help">Develop your own explanation. Length alone does not determine your mark.</p></div>`;
      default:
        return "<p>This task could not be loaded. Please reload the page.</p>";
    }
  }
  function currentTask() {
    const task = tasks[state.currentIndex];
    const error = validationVisible
      ? validateTask(task, state.answers[task.id])
      : "";
    return `<article class="as-task-panel"><header class="as-task-header"><div class="as-task-meta"><span>Task ${state.currentIndex + 1} of ${tasks.length}</span><span>${task.points} marks${humanTask(task) ? " · teacher review" : ""}</span></div><h1 tabindex="-1" data-as-heading>${esc(task.title)}</h1><p class="as-prompt">${esc(task.prompt)}</p>${task.instructions && task.type !== "single-choice" ? `<p class="as-task-instructions">${esc(Array.isArray(task.instructions) ? task.instructions.join(" ") : task.instructions)}</p>` : ""}</header><div class="as-task-body">${taskInputs(task)}<p class="as-error" id="as-task-error" ${error ? "" : "hidden"}>${esc(error)}</p></div><footer class="as-task-footer"><button type="button" class="button as-button-quiet" data-as-action="previous" ${state.currentIndex === 0 ? "disabled" : ""}>Previous</button><span>All tasks are required.</span><button type="button" class="button button-primary" data-as-action="next">${state.currentIndex === tasks.length - 1 ? "Review answers" : "Next task"} ${arrow}</button></footer></article>`;
  }
  function responseText(task, response) {
    switch (task.type) {
      case "single-choice":
        return optionLabel(task.options, response);
      case "multi-select":
        return response?.length
          ? response.map((id) => optionLabel(task.options, id)).join("\n")
          : "No answer";
      case "order":
        return (
          (response?.order || task.items.map((item) => item.id))
            .map((id, i) => `${i + 1}. ${optionLabel(task.items, id)}`)
            .join("\n") +
          (response?.confirmed ? "" : "\nOrder not yet confirmed")
        );
      case "matching":
        return task.items
          .map(
            (item) =>
              `${item.label} → ${optionLabel(task.options, response?.[item.id])}`,
          )
          .join("\n");
      case "map-location":
        return data.get(response?.territoryId)?.name || "No territory selected";
      default:
        return String(response || "No response yet");
    }
  }
  function correctText(task) {
    switch (task.type) {
      case "single-choice":
        return optionLabel(task.options, task.answer);
      case "multi-select":
        return task.answer
          .map((id) => optionLabel(task.options, id))
          .join("\n");
      case "order":
        return task.answer
          .map((id, index) => `${index + 1}. ${optionLabel(task.items, id)}`)
          .join("\n");
      case "matching":
        return task.items
          .map(
            (item) =>
              `${item.label} → ${optionLabel(task.options, task.answer[item.id])}`,
          )
          .join("\n");
      case "map-location":
        return (
          data.get(task.answer.territoryId)?.name || task.answer.territoryId
        );
      default:
        return "";
    }
  }
  function downloads() {
    return `<details class="as-downloads"><summary>Download your work</summary><div><button type="button" data-as-download="txt">Text document (.txt)</button><button type="button" data-as-download="html">Printable report (.html)</button><button type="button" data-as-download="json">Answer data (.json)</button></div></details>`;
  }
  function review() {
    const errors = validateAssessment(state);
    return `<article class="as-task-panel as-review-panel"><header class="as-task-header"><div class="as-task-meta"><span>One last look</span><span>${progress().completed} of ${tasks.length} tasks ready</span></div><h1 tabindex="-1" data-as-heading>Review your work</h1><p class="as-prompt">Read through your answers before you complete your assessment.</p></header><div class="as-task-body">${studentFields()}${errors.length ? `<div class="as-review-notice" role="status"><strong>${errors.filter((error) => error.id !== "student").length ? `${errors.filter((error) => error.id !== "student").length} ${errors.filter((error) => error.id !== "student").length === 1 ? "task needs" : "tasks need"} your attention` : "Add your name to finish"}</strong><p>Every task is required. Select an unfinished task below to complete it.</p></div>` : `<div class="as-review-notice is-ready">${check}<div><strong>All eight tasks are ready.</strong><p>You can still edit any answer before you finish.</p></div></div>`}<ol class="as-review-list">${tasks
      .map((task, index) => {
        const error = validateTask(task, state.answers[task.id]);
        return `<li><button type="button" data-as-task="${esc(task.id)}"><span class="as-review-number">${index + 1}</span><span><strong>${esc(task.title)}</strong><span class="as-review-preview">${esc(error || responseText(task, state.answers[task.id]).slice(0, 170))}${!error && responseText(task, state.answers[task.id]).length > 170 ? "…" : ""}</span></span><span class="as-review-state ${error ? "is-incomplete" : ""}">${error ? "Incomplete" : check}<span class="as-sr">${error ? "" : "Ready"} · Edit task ${index + 1}</span></span></button></li>`;
      })
      .join(
        "",
      )}</ol><div class="as-submit-note"><p>Completing your assessment locks this attempt and reveals feedback. Your written answers still need your teacher’s review.</p><p><strong>Nothing is sent automatically.</strong> Download or print your completed work to hand it in.</p></div><button type="button" class="button button-primary as-submit" data-as-action="submit">Complete assessment ${arrow}</button>${downloads()}</div></article>`;
  }
  function rubricHTML(task) {
    return task.rubric?.length
      ? `<div class="as-rubric"><h3>What your teacher will assess</h3><ul>${task.rubric.map((item) => `<li><span>${esc(item.criterion)}</span><strong>${item.points} ${item.points === 1 ? "mark" : "marks"}</strong></li>`).join("")}</ul></div>`
      : "";
  }
  function results() {
    const score = gradeAssessment(state);
    return `<div class="as-results"><header class="as-results-header"><span class="as-complete-label">${check}Attempt completed</span><h1 tabindex="-1" data-as-heading>You’ve made your case.</h1><p class="as-results-lede">${esc(state.student.name)}, your answers are ready to hand in.</p><div class="as-results-marks"><p><strong>${score.earned}<span> / ${score.possible}</span></strong><span>automatically checked marks</span></p><p><strong>${score.pending}</strong><span>written marks awaiting teacher review</span></p></div><p class="as-result-explanation">This is not your final mark. Download or print your work for your teacher to assess your written responses. Nothing has been sent automatically.</p><div class="as-result-actions"><button type="button" class="button button-primary" data-as-action="print">Print / save as PDF</button>${downloads()}</div>${saveLine()}</header><section class="as-feedback" aria-labelledby="as-feedback-title"><div class="as-feedback-heading"><h2 id="as-feedback-title">Your answers & feedback</h2><span>${tasks.length} tasks completed</span></div>${tasks
      .map((task, index) => {
        const marks = score.items[index];
        return `<details class="as-feedback-item"><summary><span class="as-feedback-number">${index + 1}</span><span>${esc(task.title)}</span><span class="as-feedback-mark">${humanTask(task) ? "Awaiting review" : `${marks.earned} / ${marks.possible}`}</span></summary><div class="as-feedback-body"><h3>Your answer</h3><p class="as-preserve">${esc(responseText(task, state.answers[task.id]))}</p>${humanTask(task) ? rubricHTML(task) : `<h3>${marks.earned === marks.possible ? "Why this works" : "The correct answer"}</h3>${marks.earned === marks.possible ? "" : `<p class="as-preserve">${esc(correctText(task))}</p>`}`}<p class="as-feedback-explanation">${esc(task.explanation || "")}</p>${sourceLinks(task)}</div></details>`;
      })
      .join(
        "",
      )}</section><footer class="as-results-footer"><p>This attempt is locked. Starting again replaces the saved attempt on this device.</p><button type="button" class="text-link" data-as-action="reset-dialog">Start a new attempt</button><button type="button" class="text-link" data-as-action="explore">Return to the atlas ↗</button></footer></div>`;
  }
  function sourceLinks(task) {
    const sources =
      task.sources ||
      (task.source?.url
        ? [{ title: task.source.title, url: task.source.url }]
        : []);
    return sources.length
      ? `<div class="as-task-sources"><h3>Sources</h3><ul>${sources.map((source) => `<li>${safeURL(source.url) ? `<a href="${esc(safeURL(source.url))}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a>` : esc(source.title)}</li>`).join("")}</ul></div>`
      : "";
  }
  function render(focus = false) {
    if (destroyed) return;
    map?.destroy();
    map = null;
    host.innerHTML = `${storageNotice ? `<p class="as-storage-notice" role="status">${esc(storageNotice)}</p>` : ""}<div class="as-sr" role="status" aria-live="polite" data-as-live></div>${screen === "intro" ? introduction() : screen === "results" ? results() : `<div class="as-workspace">${sidebar()}${screen === "review" ? review() : currentTask()}</div>`}<dialog class="as-reset-dialog" aria-labelledby="as-reset-title"><h2 id="as-reset-title">Start a new attempt?</h2><p>Your current answers will be removed from this device. Download a copy first if you want to keep them.</p><button type="button" class="text-link" data-as-download="txt">Download this attempt (.txt)</button><div><button type="button" class="button" data-as-action="cancel-reset">Keep this attempt</button><button type="button" class="button button-primary" data-as-action="confirm-reset">Start again</button></div></dialog>`;
    if (screen === "task" && tasks[state.currentIndex].type === "map-location")
      mountMap();
    if (focus) {
      host.querySelector("[data-as-heading]")?.focus({ preventScroll: true });
      if (typeof host.scrollIntoView === "function")
        host.scrollIntoView({ block: "start", behavior: "instant" });
    }
    onProgress(progress());
  }
  function mountMap() {
    const task = tasks[state.currentIndex];
    const container = host.querySelector("[data-as-map]");
    try {
      map = createMap(container, {
        data,
        onSelect(territoryId) {
          selectTerritory(task, territoryId);
        },
      });
      map.update({
        year: task.year,
        mode: "extent",
        selectedId: state.answers[task.id]?.territoryId || null,
      });
      const title = container.querySelector("title");
      const desc = container.querySelector("desc");
      if (title)
        title.textContent = `World map, ${task.year}. Choose a territory for your answer.`;
      if (desc)
        desc.textContent =
          "Click a territory to record your answer. The territory list below provides the same selection by keyboard. Boundaries are approximate and use modern units.";
    } catch {
      container.innerHTML =
        '<p class="as-map-fallback">The map could not be displayed. Use the territory list below to complete this task.</p>';
    }
  }
  function selectTerritory(task, territoryId) {
    if (state.submittedAt || !data.get(territoryId)) return;
    const selected = data.get(territoryId);
    // Historical India contains several modern countries and princely states.
    // Any overlapping unit represents the same subcontinent answer in this task.
    if (
      task.answer.unitIds?.length &&
      selected.units?.some((id) => task.answer.unitIds.includes(id))
    )
      territoryId = task.answer.territoryId;
    state.answers[task.id] = { territoryId };
    const select = host.querySelector("[data-as-map-select]");
    if (select) {
      if (![...select.options].some((option) => option.value === territoryId)) {
        const option = document.createElement("option");
        option.value = territoryId;
        option.textContent = data.get(territoryId).name;
        select.append(option);
      }
      select.value = territoryId;
    }
    map?.update({ selectedId: territoryId });
    save();
    updateTaskError();
    announce(`${data.get(territoryId).name} selected.`);
  }
  function updateTaskError() {
    if (screen !== "task") return;
    const task = tasks[state.currentIndex];
    const error = validationVisible
      ? validateTask(task, state.answers[task.id])
      : "";
    const node = host.querySelector("#as-task-error");
    if (node) {
      node.hidden = !error;
      node.textContent = error;
    }
    const textarea = host.querySelector("[data-as-written]");
    if (textarea) {
      textarea.setAttribute("aria-invalid", String(!!error));
      const words = wordCount(textarea.value);
      const output = host.querySelector("[data-as-word-count]");
      if (output) {
        output.textContent = `${words} words`;
        output.classList.toggle("is-over-limit", words > task.maxWords);
      }
    }
  }
  function navigate(index, focus = true) {
    if (state.submittedAt) return;
    state.currentIndex = Math.max(0, Math.min(tasks.length - 1, index));
    screen = "task";
    save();
    render(focus);
  }
  function input(event) {
    if (state.submittedAt) return;
    const target = event.target;
    if (target.matches("[data-as-student]")) {
      state.student[target.dataset.asStudent] = target.value;
      save();
      if (target.dataset.asStudent === "name" && target.value.trim()) {
        target.removeAttribute("aria-invalid");
        host.querySelector("#as-name-error")?.remove();
      }
    } else if (target.matches("[data-as-written]")) {
      state.answers[target.dataset.asWritten] = target.value;
      save();
      updateTaskError();
    }
  }
  function change(event) {
    if (state.submittedAt) return;
    const target = event.target;
    const task = tasks[state.currentIndex];
    if (target.matches("[data-as-response]")) {
      state.answers[task.id] =
        task.type === "multi-select"
          ? [
              ...host.querySelectorAll(
                `[data-as-response="${task.id}"]:checked`,
              ),
            ].map((input) => input.value)
          : target.value;
      save();
      updateTaskError();
    } else if (target.matches("[data-as-match]")) {
      state.answers[task.id] = {
        ...state.answers[task.id],
        [target.dataset.asMatch]: target.value,
      };
      save();
      updateTaskError();
    } else if (target.matches("[data-as-confirm]")) {
      state.answers[task.id] = {
        order:
          state.answers[task.id]?.order || task.items.map((item) => item.id),
        confirmed: target.checked,
      };
      save();
      updateTaskError();
    } else if (target.matches("[data-as-map-select]")) {
      if (target.value) selectTerritory(task, target.value);
      else {
        delete state.answers[task.id];
        map?.update({ selectedId: null });
        save();
        updateTaskError();
      }
    }
  }
  function click(event) {
    const target = event.target.closest("button, [data-as-action]");
    if (!target || !host.contains(target)) return;
    if (target.dataset.asDownload) {
      download(target.dataset.asDownload);
      return;
    }
    if (target.dataset.asAction === "explore") {
      onExplore({ year: 1922, returnTo: "assessment" });
      return;
    }
    if (target.dataset.asAction === "print") {
      printReport();
      return;
    }
    if (target.dataset.asAction === "reset-dialog") {
      host.querySelector("dialog").showModal();
      return;
    }
    if (target.dataset.asAction === "cancel-reset") {
      host.querySelector("dialog").close();
      return;
    }
    if (target.dataset.asAction === "confirm-reset") {
      state = emptyState();
      screen = "intro";
      validationVisible = false;
      storageNotice = "";
      save();
      render(true);
      return;
    }
    if (state.submittedAt) return;
    if (target.dataset.asTask) {
      validationVisible = screen === "review" || validationVisible;
      navigate(tasks.findIndex((task) => task.id === target.dataset.asTask));
      return;
    }
    if (target.dataset.asMove) {
      const task = tasks[state.currentIndex];
      const order = [
        ...(state.answers[task.id]?.order || task.items.map((item) => item.id)),
      ];
      const index = order.indexOf(target.dataset.asMove);
      const direction = Number(target.dataset.asDirection);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= order.length) return;
      [order[index], order[next]] = [order[next], order[index]];
      state.answers[task.id] = { order, confirmed: false };
      save();
      render();
      const buttons = [...host.querySelectorAll("[data-as-move]")].filter(
        (button) => button.dataset.asMove === target.dataset.asMove,
      );
      (
        buttons.find(
          (button) =>
            button.dataset.asDirection === String(direction) &&
            !button.disabled,
        ) || buttons.find((button) => !button.disabled)
      )?.focus();
      announce(
        `Moved to position ${next + 1} of ${order.length}. Confirm your order when ready.`,
      );
      return;
    }
    switch (target.dataset.asAction) {
      case "previous":
        navigate(state.currentIndex - 1);
        break;
      case "next":
        if (state.currentIndex < tasks.length - 1)
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
      case "submit": {
        const errors = validateAssessment(state);
        if (errors.length) {
          validationVisible = true;
          render(true);
          announce(
            `Your assessment is not complete. ${errors.length} ${errors.length === 1 ? "item needs" : "items need"} attention.`,
          );
          if (errors[0].id === "student")
            host.querySelector("#as-name")?.focus();
          else host.querySelector(`[data-as-task="${errors[0].id}"]`)?.focus();
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
    if (!event.target.matches("[data-as-start]")) return;
    event.preventDefault();
    if (!state.student.name.trim()) {
      validationVisible = true;
      render();
      host.querySelector("#as-name")?.focus();
      return;
    }
    state.student.name = state.student.name.trim();
    state.startedAt = new Date().toISOString();
    screen = "task";
    validationVisible = false;
    save();
    render(true);
  }
  function reportData() {
    const score = state.submittedAt ? gradeAssessment(state) : null;
    return {
      assessment: {
        id: assessment.id,
        title: assessment.title,
        version: VERSION,
      },
      student: { ...state.student },
      status: state.submittedAt ? "completed" : "draft",
      startedAt: state.startedAt,
      submittedAt: state.submittedAt,
      exportedAt: new Date().toISOString(),
      note: "Saved locally. This file has not been sent to a teacher or a server. Written responses require human assessment.",
      score,
      tasks: tasks.map((task, index) => ({
        id: task.id,
        title: task.title,
        prompt: task.prompt,
        type: task.type,
        points: task.points,
        response: responseText(task, state.answers[task.id]),
        responseData: state.answers[task.id] ?? null,
        complete: !validateTask(task, state.answers[task.id]),
        sources:
          task.sources ||
          (task.source?.url
            ? [{ title: task.source.title, url: task.source.url }]
            : []),
        ...(task.source ? { source: task.source } : {}),
        ...(task.evidence ? { evidence: task.evidence } : {}),
        ...(state.submittedAt
          ? {
              mark: score.items[index],
              explanation: task.explanation,
              ...(humanTask(task)
                ? { rubric: task.rubric }
                : { correctAnswer: correctText(task) }),
            }
          : {}),
      })),
    };
  }
  function reportText(report) {
    return `${report.assessment.title}\n${report.status === "completed" ? "COMPLETED ATTEMPT" : "DRAFT — NOT YET COMPLETED"}\n\nName: ${report.student.name}\nClass: ${report.student.className || "Not supplied"}\n${report.submittedAt ? `Completed: ${new Date(report.submittedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}\n` : ""}${report.score ? `Automatically checked: ${report.score.earned} / ${report.score.possible}\nWritten marks awaiting teacher review: ${report.score.pending}\n` : ""}\n${report.note}\n\n${report.tasks.map((task, index) => `${index + 1}. ${task.title} (${task.points} marks)\n${task.prompt}\n${task.source ? `\nSource: ${task.source.title}\n${task.source.author} · ${task.source.date}\n${task.source.excerpt}\n${task.source.purpose || ""}\n` : ""}${task.evidence ? `\nEvidence provided:\n${task.evidence.map((item) => `${item.title}: ${item.text}`).join("\n\n")}\n` : ""}\nYour answer:\n${task.response}\n${task.mark ? `\n${task.mark.review === "human" ? "Awaiting teacher review" : `Mark: ${task.mark.earned} / ${task.mark.possible}`}\n${task.correctAnswer && task.mark.earned !== task.mark.possible ? `Correct answer:\n${task.correctAnswer}\n` : ""}${task.explanation || ""}\n${task.rubric ? `\nReview criteria:\n${task.rubric.map((item) => `- ${item.criterion} (${item.points} ${item.points === 1 ? "mark" : "marks"})`).join("\n")}\n` : ""}` : ""}${task.sources.length ? `\nSources:\n${task.sources.map((source) => `${source.title}: ${source.url}`).join("\n")}\n` : ""}`).join("\n————————————————————————————\n\n")}`;
  }
  function reportAnswerHTML(task, correct = false) {
    const text = correct ? task.correctAnswer : task.response;
    const grouped = ["order", "matching"].includes(task.type);
    return `<div${grouped ? ' class="report-answer"' : ""}><h3>${correct ? "Correct answer" : "Your answer"}</h3>${text
      .split(/\n\s*\n/)
      .map((paragraph) => `<p class="answer">${esc(paragraph)}</p>`)
      .join("")}</div>`;
  }
  function reportHTML(report) {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(report.student.name)} — British Empire assessment</title><style>body{max-width:820px;margin:40px auto;padding:0 24px;color:#203b32;font:16px/1.55 system-ui,sans-serif}h1,h2{font-family:Georgia,serif;line-height:1.2}h1{font-size:34px}h2{font-size:23px;margin-top:36px}h3{font-size:16px;margin:20px 0 5px}a{color:#254e3e;overflow-wrap:anywhere}.meta{padding:16px 0;border-block:1px solid #d8e1d5}.answer{white-space:pre-wrap;overflow-wrap:anywhere}.mark{font-weight:700}.note{font-size:14px;color:#42564d}section{border-bottom:1px solid #d8e1d5;padding-bottom:22px}li{margin-bottom:6px}button{font:inherit;padding:10px 16px;cursor:pointer}header{margin-bottom:32px}@media print{@page{margin:15mm}body{margin:0;padding:0;font-size:10.5pt;line-height:1.38}button{display:none}header{margin-bottom:22px}h1{font-size:24pt;margin:0 0 12px}h2{font-size:16pt;margin:20px 0 9px;break-after:avoid}h3{font-size:10.5pt;margin:12px 0 5px;break-after:avoid}p{margin:7px 0}p,li{orphans:3;widows:3}ul{margin:6px 0;padding-left:22px}li{margin-bottom:4px}blockquote{margin:10px 18px}section{padding-bottom:12px}.note{font-size:10pt}.meta{padding:10px 0;break-inside:avoid}.report-source,.report-rubric,.report-references,.report-answer{break-inside:avoid}.report-source h3,.report-rubric h3,.report-references h3{break-after:avoid}a{color:inherit}}</style></head><body><header><button onclick="window.print()">Print / save as PDF</button><h1>${esc(report.assessment.title)}</h1><p>${report.status === "completed" ? "Completed attempt" : "Draft — not yet completed"}</p><div class="meta"><strong>${esc(report.student.name)}</strong>${report.student.className ? ` · ${esc(report.student.className)}` : ""}${report.submittedAt ? `<br>Completed ${esc(new Date(report.submittedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }))}` : ""}${report.score ? `<p class="mark">Automatically checked: ${report.score.earned} / ${report.score.possible}<br>Written marks awaiting teacher review: ${report.score.pending}</p>` : ""}</div><p class="note">${esc(report.note)}</p></header>${report.tasks.map((task, index) => `<section><h2>${index + 1}. ${esc(task.title)}</h2><p>${esc(task.prompt)}</p>${task.source ? `<div class="report-source"><h3>Source: ${esc(task.source.title)}</h3><p>${esc(task.source.author)} · ${esc(task.source.date)}</p><blockquote>${esc(task.source.excerpt)}</blockquote><p class="note">${esc(task.source.purpose || "")}</p></div>` : ""}${task.evidence ? `<h3>Evidence provided</h3>${task.evidence.map((item) => `<p><strong>${esc(item.title)}</strong> ${esc(item.text)}</p>`).join("")}` : ""}${reportAnswerHTML(task)}${task.mark ? `<p class="mark">${task.mark.review === "human" ? `${task.points} marks awaiting teacher review` : `${task.mark.earned} / ${task.mark.possible} marks`}</p>${task.correctAnswer && task.mark.earned !== task.mark.possible ? reportAnswerHTML(task, true) : ""}<p>${esc(task.explanation || "")}</p>${task.rubric ? `<div class="report-rubric"><h3>Review criteria</h3><ul>${task.rubric.map((item) => `<li>${esc(item.criterion)} (${item.points} ${item.points === 1 ? "mark" : "marks"})</li>`).join("")}</ul><p>Teacher’s mark: ______ / ${task.points}</p><p>Feedback: _______________________________________________________</p></div>` : ""}` : ""}${task.sources.length ? `<div class="report-references"><h3>Sources</h3><ul>${task.sources.map((source) => `<li>${safeURL(source.url) ? `<a href="${esc(safeURL(source.url))}">${esc(source.title)}</a>` : esc(source.title)}</li>`).join("")}</ul></div>` : ""}</section>`).join("")}</body></html>`;
  }
  function download(format) {
    const report = reportData();
    const content =
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
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    const name =
      state.student.name
        .trim()
        .replace(/[^\p{L}\p{N}_-]+/gu, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || "student";
    anchor.download = `british-empire-${name}-${state.submittedAt ? "completed" : "draft"}.${format}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce(
      "Your work has been downloaded. Hand in the file using your class’s usual method.",
    );
  }
  function printReport() {
    const frame = document.createElement("iframe");
    frame.title = "Printable assessment report";
    frame.style.cssText =
      "position:fixed;left:-10000px;top:0;width:800px;height:600px;border:0;";
    frame.setAttribute("aria-hidden", "true");
    frame.onload = () => {
      if (!destroyed) {
        try {
          frame.contentWindow.focus();
          frame.contentWindow.print();
        } catch {
          download("html");
          announce("Open the downloaded report to print your work.");
        }
      }
    };
    frame.srcdoc = reportHTML(reportData());
    document.body.append(frame);
    frames.add(frame);
    setTimeout(() => {
      frame.remove();
      frames.delete(frame);
    }, 60000);
  }
  function beforePrint() {
    if (screen !== "results") return;
    host
      .querySelectorAll(".as-feedback-item:not([open])")
      .forEach((details) => {
        printOpened.add(details);
        details.open = true;
      });
  }
  function afterPrint() {
    printOpened.forEach((details) => {
      details.open = false;
    });
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
        host.querySelector("[data-as-heading]")?.focus({ preventScroll: true });
      }
      map?.update();
    },
    getProgress: progress,
    destroy() {
      destroyed = true;
      map?.destroy();
      frames.forEach((frame) => frame.remove());
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
