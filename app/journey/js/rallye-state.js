import { rallye } from "./rallye-content.js";
import {
  LEGACY_CONTENT_REVISION,
  LEGACY_PROMPT_SNAPSHOT,
} from "./rallye-legacy-prompts.js";
import {
  Q2_CONTENT_REVISION,
  Q2_PROMPT_SNAPSHOT,
} from "./rallye-q2-prompts.js";

// The previous application owns its v3 key. This module performs no storage I/O.
export const RALLYE_STORAGE_KEY = "empire-echoes-enquiry-v4";
export const LEGACY_STORAGE_KEY = "empire-echoes-rallye-v3";
export const VERSION = 4;
export const RALLYE_CONTENT_REVISION = rallye.contentRevision;
const stages = [...rallye.stations, rallye.finalAssessment];
const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const array = (value) => (Array.isArray(value) ? value : []);
const copy = (value) => JSON.parse(JSON.stringify(value));
const question = (stage) => stage.investigation || stage.question || stage;
const validDate = (value) =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

export function safeURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

// These optional references are checked for usable links, never for completion.
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

// Retained as non-blocking compatibility APIs for callers of the earlier engine.
export function validateStage() {
  return "";
}
export function validateRallye() {
  return [];
}
export function responseNotice(response) {
  return String(response || "").trim()
    ? ""
    : "No response saved here yet. You can keep exploring and return when you are ready.";
}

// Whitelisting prevents historical assessment metadata entering current exports.
export function promptSnapshot() {
  return stages.map((stage) => {
    const task = question(stage);
    return {
      id: stage.id,
      title: stage.title,
      prompt: task.prompt || "",
      operator: task.operator || "",
      responsePurpose: task.responsePurpose || "",
      instructions: [...array(task.instructions)],
    };
  });
}

export function emptyState() {
  return {
    version: VERSION,
    rallyeId: rallye.id,
    contentRevision: RALLYE_CONTENT_REVISION,
    promptSnapshot: promptSnapshot(),
    previousAttempts: [],
    student: { name: "", className: "" },
    answers: {},
    notebooks: {},
    completedStages: {},
    startedAt: null,
    finishedAt: null,
    updatedAt: null,
    currentIndex: 0,
  };
}

function originalPrompts(raw, revision) {
  if (Array.isArray(raw.promptSnapshot)) return copy(raw.promptSnapshot);
  if (raw.rallyeId !== rallye.id) return [];
  if (revision === LEGACY_CONTENT_REVISION) return copy(LEGACY_PROMPT_SNAPSHOT);
  if (revision === Q2_CONTENT_REVISION) return copy(Q2_PROMPT_SNAPSHOT);
  // A question from an unknown revision must never be invented or substituted.
  return [];
}

export function preserveEarlierAttempt(raw, options = {}) {
  const contentRevision =
    raw.contentRevision ||
    (raw.version === 3 && raw.rallyeId === rallye.id
      ? LEGACY_CONTENT_REVISION
      : "unknown");
  return {
    contentRevision,
    archivedAt: options.archivedAt || new Date().toISOString(),
    ...(options.sourceStorageKey
      ? { sourceStorageKey: options.sourceStorageKey }
      : {}),
    promptSnapshot: originalPrompts(raw, contentRevision),
    // Keep the complete original record, including its own earlier history.
    attempt: copy(raw),
  };
}

function earlierAttempts(raw) {
  return array(raw?.previousAttempts)
    .filter((entry) => isObject(entry) && isObject(entry.attempt))
    .map((entry) => {
      const saved = copy(entry);
      const revision =
        saved.contentRevision ||
        saved.attempt.contentRevision ||
        LEGACY_CONTENT_REVISION;
      saved.contentRevision = revision;
      if (!Array.isArray(saved.promptSnapshot))
        saved.promptSnapshot = originalPrompts(saved.attempt, revision);
      return saved;
    });
}

/** Resume this revision, or preserve another revision as separate original work. */
export function normaliseSaved(raw, options = {}) {
  const state = emptyState();
  if (!isObject(raw)) return state;
  state.previousAttempts = earlierAttempts(raw);
  if (isObject(raw.student)) {
    if (typeof raw.student.name === "string")
      state.student.name = raw.student.name;
    if (typeof raw.student.className === "string")
      state.student.className = raw.student.className;
  }
  if (
    raw.version !== VERSION ||
    raw.rallyeId !== rallye.id ||
    raw.contentRevision !== RALLYE_CONTENT_REVISION
  ) {
    state.previousAttempts.push(preserveEarlierAttempt(raw, options));
    return state;
  }
  if (isObject(raw.answers)) {
    for (const [id, response] of Object.entries(raw.answers)) {
      if (typeof response === "string")
        Object.defineProperty(state.answers, id, {
          value: response,
          enumerable: true,
          configurable: true,
          writable: true,
        });
    }
  }
  if (isObject(raw.notebooks)) {
    for (const [id, notebook] of Object.entries(raw.notebooks)) {
      if (!isObject(notebook)) continue;
      Object.defineProperty(state.notebooks, id, {
        value: {
          note: typeof notebook.note === "string" ? notebook.note : "",
          citations: validCitations(notebook).map((source) => ({
            title: String(source.title).trim(),
            url: safeURL(source.url),
            ...(typeof source.id === "string" ? { id: source.id } : {}),
          })),
        },
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
  }
  for (const stage of stages)
    if (raw.completedStages?.[stage.id] === true)
      state.completedStages[stage.id] = true;
  for (const key of ["startedAt", "finishedAt", "updatedAt"])
    if (validDate(raw[key])) state[key] = raw[key];
  state.currentIndex = Number.isInteger(raw.currentIndex)
    ? Math.max(0, Math.min(stages.length - 1, raw.currentIndex))
    : 0;
  return state;
}

/** Read parsed records; the UI writes the returned state only to the new key. */
export function recoverSavedState(currentRaw, legacyRaw, options = {}) {
  if (isObject(currentRaw)) return normaliseSaved(currentRaw, options);
  if (isObject(legacyRaw))
    return normaliseSaved(legacyRaw, {
      ...options,
      sourceStorageKey: LEGACY_STORAGE_KEY,
    });
  return emptyState();
}

/** An explicit learner choice, independent of answer, sources, or final status. */
export function markStageDone(state, id, done = true) {
  if (!stages.some((stage) => stage.id === id)) return state;
  const completedStages = { ...state.completedStages };
  if (done) completedStages[id] = true;
  else delete completedStages[id];
  return { ...state, completedStages };
}

export function progressFor(state) {
  return {
    started: !!state.startedAt,
    completed: stages.filter(
      (stage) => state.completedStages?.[stage.id] === true,
    ).length,
    total: stages.length,
    finished: !!state.finishedAt,
    // Existing atlas callbacks use this name; it never locks or assesses work.
    submitted: !!state.finishedAt,
    currentIndex: state.currentIndex || 0,
    minutes: rallye.minutes,
  };
}

export function recoveredStages(entry) {
  const attempt = isObject(entry?.attempt) ? entry.attempt : {};
  const prompts = array(entry?.promptSnapshot).filter(isObject);
  const ids = new Set([
    ...prompts.map((item) => item.id),
    ...Object.keys(attempt.answers || {}),
    ...Object.keys(attempt.notebooks || {}),
    ...Object.keys(attempt.checkpoints || {}),
  ]);
  return [...ids].map((id) => ({
    id,
    original: prompts.find((item) => item.id === id),
    response:
      typeof attempt.answers?.[id] === "string" ? attempt.answers[id] : "",
    notebook: attempt.notebooks?.[id],
    checkpoint: attempt.checkpoints?.[id],
  }));
}

// This is a separate recovery download, not part of a current enquiry export.
export function recoveredAttemptText(entry) {
  const attempt = entry.attempt || {};
  return [
    "EARLIER SAVED WORK — ORIGINAL QUESTIONS AND RESPONSES",
    `Content revision: ${entry.contentRevision || "Unknown"}`,
    `Original activity: ${attempt.rallyeId || "Not recorded"}`,
    `Name: ${attempt.student?.name || "Not supplied"}`,
    `Class: ${attempt.student?.className || "Not supplied"}`,
    `Original status: ${attempt.submittedAt || attempt.finishedAt || "Draft"}`,
    "These answers belong to the earlier questions below. The current enquiry is a separate notebook.",
    "",
    ...recoveredStages(entry).map(
      ({ id, original, response, notebook, checkpoint }) =>
        [
          original?.title || id,
          `Original question: ${original?.prompt || "Unavailable in this saved attempt — consult the original assignment."}`,
          ...array(original?.instructions),
          "",
          "Saved response:",
          response || "No response saved",
          "",
          "Saved notes:",
          notebook?.note || "No notes saved",
          "",
          "Saved sources:",
          ...array(notebook?.citations).map(
            (source) =>
              `${source?.title || "Untitled"}: ${source?.url || "No address saved"}`,
          ),
          ...(checkpoint !== undefined
            ? [
                "",
                "Saved original checkpoint:",
                JSON.stringify(checkpoint, null, 2),
              ]
            : []),
        ].join("\n"),
    ),
  ].join("\n\n");
}
