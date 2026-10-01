import { loadData, readDate } from "../core/data.js";
import { createMap, MAP_LEGEND } from "./map.js";
import { eras, stories, quiz, teacherNotes } from "./content.js";
import { feature, merge, geoMercator, geoPath } from "../../vendor/geo.js";

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [
  ...parent.querySelectorAll(selector),
];
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
const STORAGE_KEY = "empire-classroom-v1";
let stored = {};
let canSave = true;
try {
  stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
} catch {
  canSave = false;
}
const notes =
  stored.notes &&
  typeof stored.notes === "object" &&
  !Array.isArray(stored.notes)
    ? stored.notes
    : {};
const progress =
  stored.progress &&
  typeof stored.progress === "object" &&
  !Array.isArray(stored.progress)
    ? stored.progress
    : {};
const completed = Array.isArray(stored.completed)
  ? stored.completed.filter((id) => stories.some((story) => story.id === id))
  : [];
let data,
  map,
  year = 1922,
  mapMode = "extent",
  selectedId = null,
  returnTo = null,
  playTimer = null;
let view = "explore",
  activeStory = null,
  activeStep = 0;
let quizIndex = 0,
  quizSelection = null,
  quizChecked = false,
  quizAnswers = [],
  quizFinished = false;
let toastTimer;
const announce = (message) => {
  $("#live-status").textContent = message;
};
const promptIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6m-5 3h4M8 14a7 7 0 1 1 8 0c-1.5 1-2 2-2 4h-4c0-2-.5-3-2-4z"/></svg>';

function save() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ notes, progress, completed }),
    );
    canSave = true;
  } catch {
    canSave = false;
  }
  return canSave;
}
function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").hidden = false;
  toastTimer = setTimeout(() => {
    $("#toast").hidden = true;
  }, 3500);
}
function safeURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
function sourceLinks(story) {
  return `<details class="source-details"><summary>Sources & further reading</summary><p>These short summaries work offline. External sources open in a new tab and need an internet connection.</p><ul>${story.sources.map((source) => `<li>${safeURL(source.url) ? `<a href="${escape(safeURL(source.url))}" target="_blank" rel="noopener noreferrer">${escape(source.title)} ↗</a>` : escape(source.title)}</li>`).join("")}</ul></details>`;
}
function resumeStep(story) {
  const value = Number(progress[story.id]);
  return Number.isInteger(value)
    ? Math.max(0, Math.min(story.steps.length - 1, value))
    : 0;
}
function art(story) {
  if (!data) return "";
  const topology = data.geo.coarse.data;
  let ids;
  if (story.id === "company") ids = data.get("british-india").units;
  else ids = data.get(story.territoryId).units;
  const desired = new Set(ids);
  const shapes = topology.objects.units.geometries.filter((shape) =>
    desired.has(String(shape.id)),
  );
  if (!shapes.length) return "";
  const geometry = merge(topology, shapes);
  const projection = geoMercator().fitExtent(
    [
      [11, 15],
      [84, 126],
    ],
    geometry,
  );
  return `<svg viewBox="0 0 95 140" aria-hidden="true"><circle cx="48" cy="69" r="49" fill="none" stroke="#637861" stroke-opacity=".16" stroke-width=".6"/><circle cx="48" cy="69" r="34" fill="none" stroke="#637861" stroke-opacity=".16" stroke-width=".6"/><path d="${geoPath(projection)(geometry)}" fill="${story.id === "atlantic" ? "#ba8970" : story.id === "company" ? "#8c9864" : "#75978a"}" stroke="#ffffff" stroke-width=".7"/></svg>`;
}
function storyArt(story) {
  return `<div class="story-art ${story.id === "company" ? "india" : story.id === "independence" ? "kenya" : "jamaica"}">${art(story)}</div>`;
}
function renderStoryPreview() {
  $("#story-preview").innerHTML = stories
    .map(
      (story) =>
        `<a class="story-card" href="#learn/${story.id}/${resumeStep(story)}">${storyArt(story)}<div class="story-card-content"><div class="story-meta">${escape(data.get(story.territoryId).name.replace("British ", ""))} · ${story.minutes} min</div><h3>${escape(story.title)}</h3><p>${escape(story.description)}</p></div><span class="story-arrow" aria-hidden="true">↗</span></a>`,
    )
    .join("");
}
function updateLegend() {
  const items =
    mapMode === "extent"
      ? [{ label: "British authority", color: "#c77766" }]
      : MAP_LEGEND.rule;
  $("#map-legend").innerHTML =
    items
      .map(
        (item) =>
          `<span><i class="swatch" style="background:${item.color}"></i>${escape(item.label)}</span>`,
      )
      .join("") +
    `<span><i class="swatch" style="background:#34594d"></i>${year < 1707 ? "England & Wales" : "Britain"}</span><span class="legend-partial"><i class="swatch partial"></i>Partial extent</span>`;
}
function updateExploreURL() {
  if (view !== "explore") return;
  const parameters = new URLSearchParams({ year });
  if (selectedId) parameters.set("place", selectedId);
  if (returnTo) parameters.set("return", returnTo);
  history.replaceState(null, "", `#explore?${parameters}`);
}
function setYear(value, { url = true, notify = false } = {}) {
  year = Math.max(1600, Math.min(1997, Math.round(Number(value) || 1922)));
  $("#map-year").textContent = year;
  updateLegend();
  $("#year-output").textContent = year;
  $("#year-slider").value = year;
  $("#year-slider").setAttribute("aria-valuetext", `${year}`);
  $("#year-back").disabled = year === 1600;
  $("#year-forward").disabled = year === 1997;
  $$("[data-year]", $(".timeline-ticks")).forEach((button) =>
    button.classList.toggle("is-active", Number(button.dataset.year) === year),
  );
  map?.update({ year, mode: mapMode, selectedId });
  renderDiscovery();
  if (url) updateExploreURL();
  if (notify) announce(`Map updated to ${year}.`);
}
function shortProse(text, count = 2) {
  if (!text) return "";
  return (text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [text])
    .slice(0, count)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
function renderDiscovery() {
  if (!data) return;
  const panel = $("#discovery-content");
  const territory = selectedId && data.get(selectedId);
  panel.classList.toggle("is-territory", !!territory);
  if (!territory) {
    const era =
      [...eras].reverse().find((item) => year >= item.year) || eras[0];
    const story =
      year < 1757 ? stories[0] : year < 1947 ? stories[1] : stories[2];
    panel.innerHTML = `<p class="panel-label">${year === era.year ? "A moment in history" : `Historical context · ${era.year}`}</p><span class="moment-year">${era.year}</span><h2>${escape(era.title)}</h2><p>${escape(era.summary)}</p><div class="think-prompt"><div class="prompt-label">${promptIcon}Pause for thought</div><p>${escape(era.question)}</p></div><a class="panel-link" href="#learn/${story.id}/${resumeStep(story)}">Explore this story <span aria-hidden="true">→</span></a>`;
    return;
  }
  const current = data.territoryAt(territory.id, year);
  const status =
    current?.span?.label ||
    (current?.controlled
      ? data.statuses.find((item) => item.id === current.status)?.label ||
        current.status
      : "Outside British authority");
  const match = stories.find((item) => item.territoryId === territory.id);
  const currentSummary = match
    ? match.steps.reduce(
        (best, step) => (step.year <= year ? step : best),
        match.steps[0],
      ).body
    : shortProse(
        territory.pedagogy?.whyItMatters ||
          territory.pedagogy?.hook ||
          current?.span?.howControlWorked ||
          territory.summary ||
          "Explore the key dates and sources for this territory.",
      );
  const dates = territory.pedagogy?.keyDates || [];
  const chosenDates =
    dates.length <= 4
      ? dates
      : [
          dates[0],
          dates[Math.floor(dates.length / 3)],
          dates[Math.floor((2 * dates.length) / 3)],
          dates.at(-1),
        ];
  const region =
    data.regions.find((item) => item.id === territory.region)?.label ||
    territory.region.replaceAll("-", " ");
  panel.innerHTML = `<button class="territory-back" id="close-territory">← Back to the overview</button><p class="territory-meta">${escape(region)}</p><h2>${escape(territory.name)}</h2><div class="status-label">${escape(status)} · ${year}</div><p class="territory-context">The story in brief</p><p>${escape(shortProse(currentSummary, 3))}</p><ul class="territory-dates">${chosenDates
    .map((item) => {
      const date = readDate(item.date);
      if (!date) return "";
      const inRange = date.year >= 1600 && date.year <= 1997;
      return `<li>${inRange ? `<button data-territory-year="${date.year}" title="Show ${date.year} on the map">${date.year}</button>` : `<span>${date.year}</span>`}<span>${escape(item.what)}</span></li>`;
    })
    .join(
      "",
    )}</ul>${returnTo ? `<a class="panel-link" href="#${escape(returnTo)}">← Return to your lesson</a>` : match ? `<a class="panel-link" href="#learn/${match.id}/${resumeStep(match)}">Follow the guided story <span aria-hidden="true">→</span></a>` : ""}<details class="territory-sources"><summary>Read the sources</summary>${(
    territory.evidence || []
  )
    .slice(0, 4)
    .map(
      (source) =>
        `<p>${escape(source.author)}. <em>${escape(source.work)}</em> (${escape(source.year)}).${source.url && safeURL(source.url) ? ` <a href="${escape(safeURL(source.url))}" target="_blank" rel="noopener noreferrer">Read source ↗</a>` : ""}</p>`,
    )
    .join(
      "",
    )}<a class="text-link" href="research.html#year=${year}&sel=${encodeURIComponent(territory.id)}">Full territory record ↗</a></details>`;
  $("#close-territory").addEventListener("click", () => {
    selectedId = null;
    returnTo = null;
    map.update({ year, mode: mapMode, selectedId });
    renderDiscovery();
    updateExploreURL();
    $("#place-search").focus();
  });
  $$("[data-territory-year]", panel).forEach((button) =>
    button.addEventListener("click", () =>
      setYear(button.dataset.territoryYear, { notify: true }),
    ),
  );
}
function selectTerritory(id) {
  if (!data.get(id)) return;
  selectedId = id;
  stopPlayback();
  $("#place-search").value = "";
  hideSearch();
  map.update({ year, mode: mapMode, selectedId });
  renderDiscovery();
  updateExploreURL();
  announce(
    `${data.get(id).name} selected. Its history is shown beside the map.`,
  );
  if (matchMedia("(max-width: 900px)").matches)
    $(".discovery-panel").scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
}
function hideSearch() {
  $("#search-results").hidden = true;
  $("#place-search").setAttribute("aria-expanded", "false");
}
function renderSearch() {
  const query = $("#place-search").value.trim().toLocaleLowerCase();
  const results = $("#search-results");
  const rank = (territory) => {
    const name = territory.name.toLocaleLowerCase();
    return name === query
      ? 0
      : name.replace(/^british /, "") === query
        ? 1
        : name.startsWith(query)
          ? 2
          : name.includes(query)
            ? 3
            : (territory.aka || []).some(
                  (alias) => alias.toLocaleLowerCase() === query,
                )
              ? 4
              : 5;
  };
  const matches = query
    ? data.territories
        .filter((territory) =>
          [territory.name, ...(territory.aka || [])].some((name) =>
            name.toLocaleLowerCase().includes(query),
          ),
        )
        .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
        .slice(0, 9)
    : ["british-india", "jamaica", "kenya", "canada", "hong-kong"]
        .map((id) => data.get(id))
        .filter(Boolean);
  results.innerHTML = matches.length
    ? matches
        .map(
          (territory) =>
            `<button type="button" role="option" aria-selected="false" data-select-place="${escape(territory.id)}">${escape(territory.name)}<small>${escape(data.regions.find((region) => region.id === territory.region)?.label || territory.region.replaceAll("-", " "))}</small></button>`,
        )
        .join("")
    : "<p role='option' aria-disabled='true'>No matching place. Try a modern or historical name, such as “India”.</p>";
  if (!matches.length)
    announce("No matching place. Try a modern or historical name.");
  results.hidden = false;
  $("#place-search").setAttribute("aria-expanded", "true");
  $$("[data-select-place]", results).forEach((button) =>
    button.addEventListener("click", () => {
      selectTerritory(button.dataset.selectPlace);
      $("#close-territory")?.focus({ preventScroll: true });
    }),
  );
}
function stopPlayback() {
  clearInterval(playTimer);
  playTimer = null;
  $("#play-years").setAttribute("aria-pressed", "false");
  $("#play-years span").textContent = "Play timeline";
  $("#play-years svg").innerHTML = '<path d="m9 5 10 7-10 7z"/>';
}
function startPlayback() {
  if (playTimer) return stopPlayback();
  if (year >= 1997) setYear(1600);
  $("#play-years").setAttribute("aria-pressed", "true");
  $("#play-years span").textContent = "Pause timeline";
  $("#play-years svg").innerHTML = '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>';
  playTimer = setInterval(() => {
    setYear(Math.min(1997, year + 5));
    if (year === 1997) stopPlayback();
  }, 650);
}
function renderLearn() {
  $("#learn-view").innerHTML =
    `<div class="sub-intro"><p class="intro-label"><span></span>A little context. A bigger picture.</p><h1 id="learn-title">Follow a story.</h1><p>Choose a place. Read four short chapters. Use the map and a few good questions to connect the ideas.</p></div><div class="learning-note"><h3>Made for a conversation</h3><p>Work on your own or with a partner. Each lesson takes about 12 minutes, including time to think and discuss.</p></div><div class="lesson-list">${stories.map((story) => `<article class="lesson-row">${storyArt(story)}<div><div class="story-meta">${escape(data.get(story.territoryId).name.replace("British ", ""))} · 4 chapters · ${story.minutes} minutes${completed.includes(story.id) ? " · Completed" : notes[`${story.id}:0`] || resumeStep(story) ? " · In progress" : ""}</div><h2>${escape(story.title)}</h2><p>${escape(story.description)}</p></div><a class="button ${story.id === "company" ? "button-primary" : ""}" href="#learn/${story.id}/${resumeStep(story)}">${completed.includes(story.id) ? "Revisit story" : resumeStep(story) || notes[`${story.id}:0`] ? "Continue lesson" : "Begin lesson"} <span aria-hidden="true">→</span></a></article>`).join("")}</div>`;
}
function renderLesson(story, stepIndex) {
  activeStory = story;
  activeStep = stepIndex;
  progress[story.id] = stepIndex;
  save();
  const step = story.steps[stepIndex];
  const key = `${story.id}:${stepIndex}`;
  $("#learn-view").innerHTML =
    `<div class="sub-intro"><a href="#learn" class="back-link">← All guided lessons</a><h1 id="learn-title">${escape(story.title)}</h1></div><div class="lesson-layout"><aside class="lesson-sidebar" aria-label="Lesson chapters"><h2>Your route through the story</h2><ol class="step-list">${story.steps.map((item, index) => `<li><button data-step="${index}" class="${index === stepIndex ? "is-active" : ""}" ${index === stepIndex ? 'aria-current="step"' : ""} aria-label="Chapter ${index + 1}: ${escape(item.title)}"><span>${index + 1}</span><span class="step-name">${escape(item.title)}</span></button></li>`).join("")}</ol></aside><article class="lesson-body"><div class="step-topline"><span class="date-tag">${step.year}</span><span>Chapter ${stepIndex + 1} of ${story.steps.length}</span></div><h2>${escape(step.title)}</h2><p class="lesson-prose">${escape(step.body)}</p><div class="lesson-map-link"><span>${escape(data.get(step.territoryId).name)} · ${step.year}</span><a class="text-link" href="#explore?year=${step.year}&place=${encodeURIComponent(step.territoryId)}&return=${encodeURIComponent(`learn/${story.id}/${stepIndex}`)}">Find it on the map <span aria-hidden="true">↗</span></a></div><div class="response-block"><label for="lesson-response">${escape(step.question)}</label><textarea id="lesson-response" maxlength="4000" placeholder="A few sentences, or discuss with a partner…">${escape(typeof notes[key] === "string" ? notes[key] : "")}</textarea><div class="response-meta"><span>Notes are optional.</span><span id="save-status">${canSave ? "Saved only on this device" : "Kept until this tab closes"}</span></div><details><summary>A little help getting started</summary><p>${escape(step.hint)}</p></details></div><div class="step-navigation"><button class="button" id="previous-step" ${stepIndex === 0 ? "disabled" : ""}>← Back</button><div class="step-progress" aria-hidden="true">${story.steps.map((_, index) => `<span class="${index <= stepIndex ? "is-complete" : ""}"></span>`).join("")}</div><button class="button button-primary" id="next-step">${stepIndex === story.steps.length - 1 ? "Finish lesson" : "Next chapter"} <span aria-hidden="true">→</span></button></div>${sourceLinks(story)}</article></div>`;
  $$("[data-step]").forEach((button) =>
    button.addEventListener("click", () => {
      location.hash = `learn/${story.id}/${button.dataset.step}`;
    }),
  );
  $("#previous-step").addEventListener("click", () => {
    location.hash = `learn/${story.id}/${stepIndex - 1}`;
  });
  $("#next-step").addEventListener("click", () => {
    if (stepIndex < story.steps.length - 1)
      location.hash = `learn/${story.id}/${stepIndex + 1}`;
    else {
      if (!completed.includes(story.id)) completed.push(story.id);
      save();
      location.hash = `learn/${story.id}/complete`;
    }
  });
  $("#lesson-response").addEventListener("input", (event) => {
    notes[key] = event.target.value;
    save();
    $("#save-status").textContent = canSave
      ? "Saved on this device"
      : "Kept until this tab closes";
  });
}
function downloadNotes(story) {
  const text = `${story.title}\nThe British Empire · A classroom atlas\n\n${story.steps.map((step, index) => `${index + 1}. ${step.title} (${step.year})\n${step.question}\n\n${notes[`${story.id}:${index}`] || "[No note added]"}\n`).join("\n")}\nSources\n${story.sources.map((source) => `${source.title}\n${source.url}`).join("\n\n")}`;
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `empire-${story.id}-notes.txt`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Your notes are ready to save.");
}
function renderCompletion(story) {
  $("#learn-view").innerHTML =
    `<div class="sub-intro"><a href="#learn" class="back-link">← All guided lessons</a></div><article class="completion"><div class="completion-mark" aria-hidden="true">✓</div><h1 id="learn-title">A story to take with you.</h1><p>You’ve reached the end of <strong>${escape(story.title.toLowerCase())}</strong>. Use your notes to explain one change, and one thing the map could not show.</p><div class="action-row"><a class="button button-primary" href="#check">Try the quick check <span aria-hidden="true">→</span></a><button class="button" id="download-notes">Save your notes ↓</button><button class="button" id="print-notes">Print notes</button></div><div class="quiz-review">${story.steps.map((step, index) => `<section class="answer-review"><h3>${index + 1}. ${escape(step.question)}</h3><p>${escape(notes[`${story.id}:${index}`] || "No written note. You can return to this chapter to add one.")}</p><a class="text-link" href="#learn/${story.id}/${index}">Revisit chapter ${index + 1} →</a></section>`).join("")}</div>${sourceLinks(story)}</article>`;
  $("#download-notes").addEventListener("click", () => downloadNotes(story));
  $("#print-notes").addEventListener("click", () => window.print());
}
function renderQuiz() {
  const host = $("#check-view");
  if (quizFinished) {
    const score = quizAnswers.filter(
      (answer, index) => answer === quiz[index].answer,
    ).length;
    host.innerHTML = `<div class="quiz-shell"><div class="completion-mark" aria-hidden="true">✓</div><h1 id="check-title" tabindex="-1">Keep the ideas. Keep the questions.</h1><p class="score-line">${score} of ${quiz.length} correct</p><p class="lesson-prose" style="margin-top:20px">${score === quiz.length ? "You’ve connected the key ideas. The next step is explaining them with examples from a place you’ve explored." : "Every explanation is a chance to strengthen what you know. Review the ideas below, then give it another go."}</p><div class="action-row"><button class="button button-primary" id="restart-quiz">Try again ↻</button><a class="button" href="#learn">Explore another story →</a></div><div class="quiz-review">${quiz.map((item, index) => `<section class="answer-review"><h3>${quizAnswers[index] === item.answer ? "✓" : "↗"} ${escape(item.question)}</h3><p>${escape(item.explanation)}</p></section>`).join("")}</div></div>`;
    $("#restart-quiz").addEventListener("click", () => {
      quizIndex = 0;
      quizSelection = null;
      quizChecked = false;
      quizAnswers = [];
      quizFinished = false;
      renderQuiz();
      $("#check-title").focus({ preventScroll: true });
    });
    return;
  }
  const item = quiz[quizIndex];
  host.innerHTML = `<div class="quiz-shell"><div class="sub-intro"><p class="intro-label"><span></span>Five questions. Room to think.</p><h1 id="check-title" tabindex="-1">What stayed with you?</h1><p>A short check of the big picture. Choose an answer, then find out why. Your score stays in this tab.</p></div><div class="quiz-status"><span>Question ${quizIndex + 1} of ${quiz.length}</span><div class="quiz-progress" aria-hidden="true">${quiz.map((_, index) => `<span class="${index <= quizIndex ? "is-complete" : ""}"></span>`).join("")}</div></div><h2 class="quiz-question" id="quiz-question">${escape(item.question)}</h2><div class="quiz-options" role="group" aria-labelledby="quiz-question">${item.options.map((option, index) => `<button class="quiz-option ${quizSelection === index ? "is-selected" : ""} ${quizChecked && index === item.answer ? "is-correct" : ""} ${quizChecked && quizSelection === index && index !== item.answer ? "is-incorrect" : ""}" data-option="${index}" aria-pressed="${quizSelection === index}" ${quizChecked ? "disabled" : ""}><span class="option-letter" aria-hidden="true">${quizChecked && index === item.answer ? "✓" : ["A", "B", "C", "D"][index]}</span><span>${escape(option)}</span></button>`).join("")}</div>${quizChecked ? `<div class="quiz-feedback" role="status"><h3>${quizSelection === item.answer ? "That’s right." : "Here’s the connection."}</h3><p>${escape(item.explanation)}</p></div>` : ""}<div class="quiz-actions"><span>${quizChecked ? "Take a moment to read the explanation." : "No timer. Take your time."}</span><button class="button button-primary" id="quiz-action" ${quizSelection === null ? "disabled" : ""}>${quizChecked ? (quizIndex === quiz.length - 1 ? "See your results" : "Next question") : "Check answer"} <span aria-hidden="true">→</span></button></div><a class="back-link" style="margin-top:25px" href="#explore">← Revisit the map and timeline</a></div>`;
  $$("[data-option]", host).forEach((button) =>
    button.addEventListener("click", () => {
      quizSelection = Number(button.dataset.option);
      $$("[data-option]", host).forEach((option) => {
        option.classList.toggle(
          "is-selected",
          Number(option.dataset.option) === quizSelection,
        );
        option.setAttribute(
          "aria-pressed",
          String(Number(option.dataset.option) === quizSelection),
        );
      });
      $("#quiz-action").disabled = false;
    }),
  );
  $("#quiz-action").addEventListener("click", () => {
    if (quizSelection === null) return;
    if (!quizChecked) {
      quizChecked = true;
      quizAnswers[quizIndex] = quizSelection;
      renderQuiz();
      $("#quiz-action").focus({ preventScroll: true });
    } else {
      if (quizIndex === quiz.length - 1) quizFinished = true;
      else quizIndex++;
      quizSelection = null;
      quizChecked = false;
      renderQuiz();
      $("#check-title")?.focus({ preventScroll: true });
    }
  });
}
function renderTeacher() {
  $("#teacher-view").innerHTML =
    `<div class="sub-intro"><p class="intro-label"><span></span>A little less preparation</p><h1 id="teacher-title">Make room for the discussion.</h1><p>One map, three routes through history, and a clear plan for a ${teacherNotes.duration}-minute lesson.</p></div><div class="teacher-layout"><div><h2>A lesson you can make your own</h2><p>${escape(teacherNotes.aim)}</p><div class="teacher-agenda">${teacherNotes.plan.map((item) => `<div class="agenda-row"><span>${item.minutes} min</span><div><h3>${escape(item.title)}</h3><p>${escape(item.activity)}</p></div></div>`).join("")}</div><div class="teacher-sources"><h3>Using this with your class</h3><p>${escape(teacherNotes.timingNote)} Start together on a projector, then let pairs choose the same story or compare different ones. Notes are saved in this browser, on this device; students can download or print them at the end of a story.</p></div><div class="teacher-sources"><h3>Evidence, and its limits</h3><p>${escape(teacherNotes.sourceNote)} ${escape(teacherNotes.mapNote)}</p></div><div class="print-only"><h2>Student discussion sheet</h2><p>Name: _______________________ &nbsp; Class: _______________</p><p>Story: Jamaica / India / Kenya</p>${["Explain one change using a date, a place and an action taken by people living there.", "What does the map help you understand about imperial power?", "What can the map not show? Support your answer with an example."].map((question, index) => `<section class="print-question"><h3>${index + 1}. ${question}</h3><div class="print-line"></div><div class="print-line"></div><div class="print-line"></div></section>`).join("")}</div></div><aside class="teacher-aside"><h2>Ready for the classroom</h2><p>${escape(teacherNotes.audience)} · ${teacherNotes.duration} minutes<br>No sign-in or student accounts.</p><ul>${teacherNotes.successCriteria.map((criterion) => `<li>${escape(criterion)}</li>`).join("")}</ul><button class="button button-primary" id="print-lesson">Print plan & worksheet <span aria-hidden="true">↓</span></button><button class="button" id="copy-link">Copy classroom link <span aria-hidden="true">↗</span></button><a href="research.html" class="text-link">Open the full research atlas ↗</a><p style="margin-top:20px;font-size:13px">Run <strong>start.command</strong> or <strong>npm start</strong> from this project. The atlas, fonts and lesson text are served locally; external reading links require internet.</p></aside></div>`;
  $("#print-lesson").addEventListener("click", () => window.print());
  $("#copy-link").addEventListener("click", async () => {
    const url = new URL(location.href);
    url.hash = "explore?year=1922";
    try {
      await navigator.clipboard.writeText(url.href);
      toast(
        "Classroom link copied. It opens wherever this server is reachable.",
      );
    } catch {
      const input = document.createElement("input");
      input.value = url.href;
      input.setAttribute("aria-label", "Classroom link — select and copy");
      input.readOnly = true;
      input.className = "copy-link-fallback";
      $("#copy-link").after(input);
      input.select();
      toast("Select and copy the link below the button.");
    }
  });
}
function route({ initial = false } = {}) {
  if (!data) return;
  if (location.hash === "#main") {
    $("#main").focus();
    return;
  }
  const [path, queryString = ""] = location.hash.slice(1).split("?");
  const segments = path.split("/");
  const nextView = ["explore", "learn", "check", "teacher"].includes(
    segments[0],
  )
    ? segments[0]
    : "explore";
  stopPlayback();
  hideSearch();
  view = nextView;
  $$(".view").forEach((section) => {
    section.hidden = section.id !== `${view}-view`;
  });
  $$("[data-view]").forEach((link) => {
    if (link.dataset.view === view) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (view === "explore") {
    const parameters = new URLSearchParams(queryString);
    if (parameters.has("year")) year = Number(parameters.get("year")) || 1922;
    selectedId = parameters.has("place")
      ? data.get(parameters.get("place"))
        ? parameters.get("place")
        : null
      : selectedId;
    const requestedReturn = parameters.get("return");
    returnTo =
      requestedReturn &&
      /^learn\/(atlantic|company|independence)\/[0-3]$/.test(requestedReturn)
        ? requestedReturn
        : null;
    setYear(year, { url: false });
    renderStoryPreview();
    document.title = "The British Empire · A classroom atlas";
  } else if (view === "learn") {
    const story = stories.find((item) => item.id === segments[1]);
    if (!story) renderLearn();
    else if (segments[2] === "complete") renderCompletion(story);
    else {
      const step = Number(segments[2]);
      renderLesson(
        story,
        Number.isInteger(step) && step >= 0 && step < story.steps.length
          ? step
          : resumeStep(story),
      );
    }
    document.title = `${story ? story.title : "Guided lessons"} · The British Empire`;
  } else if (view === "check") {
    renderQuiz();
    document.title = "Quick check · The British Empire";
  } else {
    renderTeacher();
    document.title = "For teachers · The British Empire";
  }
  if (!initial) {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("#main").focus({ preventScroll: true });
  }
}
function wireEvents() {
  $(".skip-link").addEventListener("click", (event) => {
    event.preventDefault();
    $("#main").focus();
    $("#main").scrollIntoView({ block: "start" });
  });
  $("#year-slider").addEventListener("input", (event) => {
    stopPlayback();
    setYear(event.target.value);
  });
  $("#year-slider").addEventListener("change", () =>
    announce(`Map updated to ${year}.`),
  );
  $("#year-back").addEventListener("click", () => {
    stopPlayback();
    setYear(year - 1, { notify: true });
  });
  $("#year-forward").addEventListener("click", () => {
    stopPlayback();
    setYear(year + 1, { notify: true });
  });
  $$("[data-year]").forEach((button) =>
    button.addEventListener("click", () => {
      stopPlayback();
      selectedId = null;
      setYear(button.dataset.year, { notify: true });
    }),
  );
  $$("[data-map-mode]").forEach((button) =>
    button.addEventListener("click", () => {
      mapMode = button.dataset.mapMode;
      $$("[data-map-mode]").forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      map.update({ year, mode: mapMode, selectedId });
      updateLegend();
      announce(
        `${mapMode === "extent" ? "Empire extent" : "Levels of British authority"} shown on the map.`,
      );
    }),
  );
  $("#zoom-in").addEventListener("click", () => map.zoomBy(1.4));
  $("#zoom-out").addEventListener("click", () => map.zoomBy(1 / 1.4));
  $("#zoom-reset").addEventListener("click", () => map.reset());
  $("#play-years").addEventListener("click", startPlayback);
  $("#map-note-toggle").addEventListener("click", () => {
    const open = $("#map-note").hidden;
    $("#map-note").hidden = !open;
    $("#map-note-toggle").setAttribute("aria-expanded", String(open));
  });
  $("#place-search").addEventListener("input", renderSearch);
  $("#place-search").addEventListener("focus", renderSearch);
  $("#place-search").addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter") {
      const first = $("#search-results button");
      if (first) {
        event.preventDefault();
        if (event.key === "Enter") first.click();
        else first.focus();
      }
    }
    if (event.key === "Escape") {
      hideSearch();
      event.preventDefault();
    }
  });
  $("#search-results").addEventListener("keydown", (event) => {
    const buttons = $$("#search-results button"),
      index = buttons.indexOf(document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      buttons[Math.min(index + 1, buttons.length - 1)]?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index <= 0) $("#place-search").focus();
      else buttons[index - 1].focus();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      $("#place-search").focus();
      hideSearch();
    }
  });
  document.addEventListener("click", (event) => {
    if (!$(".search-area").contains(event.target)) hideSearch();
  });
  document.addEventListener("focusin", (event) => {
    if (!$(".search-area").contains(event.target)) hideSearch();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "/" &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) &&
      view === "explore"
    ) {
      event.preventDefault();
      $("#place-search").focus();
    }
    if (event.key === "Escape") stopPlayback();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopPlayback();
  });
  addEventListener("hashchange", () => route());
}
async function boot() {
  try {
    data = await loadData();
    if (data.meta.placeholder || !data.geo.coarse?.data)
      throw new Error("The local atlas data is unavailable.");
    $("#world-map").replaceChildren();
    map = createMap($("#world-map"), { data, onSelect: selectTerritory });
    wireEvents();
    updateLegend();
    route({ initial: true });
    $("#atlas-workspace").setAttribute("aria-busy", "false");
    document.documentElement.dataset.ready = "true";
    announce(
      "The classroom atlas is ready. Explore the map or choose a guided lesson.",
    );
  } catch (error) {
    console.error("Classroom atlas failed to open:", error);
    $("#atlas-workspace").setAttribute("aria-busy", "false");
    $("#world-map").innerHTML =
      '<div class="map-loading" role="alert"><h2>The atlas could not open.</h2><p>Check that the project’s data files are present and the local server is running, then try again.</p><button class="button" id="retry-boot">Try again</button></div>';
    $("#retry-boot").addEventListener("click", () => location.reload());
    $$("button, input", $(".atlas-workspace")).forEach((control) => {
      if (control.id !== "retry-boot") control.disabled = true;
    });
  }
}
boot();
