import { loadData, readDate } from "../../js/core/data.js";
import { createMap, MAP_LEGEND } from "./flat-map.js";
import { eras } from "../../js/classroom/content.js";
import { createYearEndData } from "./map-change-data.js";
import { createTerritoryFocus } from "./territory-focus.js";

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
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let data,
  globe,
  flatMap,
  rallye,
  territoryPage,
  territoryFocus,
  focusSession,
  fullscreen,
  mapExperience;
let previousYear = 1922,
  projectionRequest = 0,
  routeRequest = 0;
let year = 1922,
  colourMode = "extent",
  projection = "globe",
  selectedId = null;
let activeView = "explore",
  playTimer = null,
  globeUnavailable = false,
  returningToRallye = false,
  transition;
let progress = {
  started: false,
  completed: 0,
  total: 7,
  submitted: false,
  canSave: true,
};
const yearHeadings = {
  1600: "Trade came first. Territorial power followed.",
  1757: "A trading company becomes a political power.",
  1858: "One empire. Different ways of ruling.",
  1922: "Territory was vast. Control was uneven.",
  1947: "Independence redraws the map.",
  1997: "Borders change. Histories continue.",
};
const questionIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6m-5 3h4M8 14a7 7 0 1 1 8 0c-1.5 1-2 2-2 4h-4c0-2-.5-3-2-4z"/></svg>';
const territorySummaries = {
  "british-india":
    "The East India Company developed from a trading organisation into a territorial power. Crown government replaced Company rule in 1858. Directly ruled provinces coexisted with princely states; independence and partition came in 1947.",
  jamaica:
    "Plantation wealth depended on the forced labour of enslaved Africans. Maroon communities defended their freedom, and resistance by enslaved people helped bring emancipation. Jamaica became independent in 1962.",
  kenya:
    "Colonial control of land and political power shaped the struggle for independence. Armed resistance, political organising and negotiation all mattered. Kenya became independent on 12 December 1963.",
};
const announce = (text) => {
  $("#live-status").textContent = text;
};
const safeURL = (value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};
const state = () => ({
  year,
  mode: colourMode,
  selectedId,
  focusId: activeView === "territory" ? selectedId : null,
});
const atlas = () => (globeUnavailable ? flatMap : globe);
const exploreHash = (options = {}) => {
  const params = new URLSearchParams({ year, view: projection, ...options });
  if (selectedId && !params.has("place")) params.set("place", selectedId);
  if (colourMode !== "extent") params.set("colour", colourMode);
  if (returningToRallye) params.set("return", "rallye");
  return `#explore?${params}`;
};
function territoryHash(id, wantedYear = year, fromRallye = returningToRallye) {
  const params = new URLSearchParams({
    id,
    year: wantedYear,
    view: projection,
    colour: colourMode,
  });
  if (fromRallye) params.set("return", "rallye");
  return `#territory?${params}`;
}
function refocusTerritory({ animate = true } = {}) {
  if (activeView !== "territory" || !selectedId) return;
  atlas()?.resize?.();
  if (globeUnavailable) flatMap?.focusTerritory(selectedId, year);
  else globe?.focusTerritory(selectedId, { spotlight: true, animate });
  const note = $("[data-focus-note]");
  const projectionNote = atlas()?.getFocusNote?.();
  if (note)
    note.textContent = `${note.dataset.baseNote || ""}${projectionNote ? ` ${projectionNote}` : ""}`;
}
function closeTerritory({ toAtlas = false } = {}) {
  location.hash =
    !toAtlas && focusSession?.origin === "rallye"
      ? "#rallye"
      : focusSession?.atlasHash || exploreHash();
}
const shortProse = (text) =>
  (String(text || "").match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [])
    .slice(0, 2)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

function updateURL() {
  if (activeView !== "explore") return;
  const parameters = new URLSearchParams({ year, view: projection });
  if (selectedId) parameters.set("place", selectedId);
  if (colourMode !== "extent") parameters.set("colour", colourMode);
  if (returningToRallye) parameters.set("return", "rallye");
  history.replaceState(null, "", `#explore?${parameters}`);
}
function updateLegend() {
  const items =
    colourMode === "extent"
      ? [
          {
            label: "British authority",
            color:
              getComputedStyle(document.documentElement)
                .getPropertyValue("--map-empire")
                .trim() || "#e97535",
          },
        ]
      : MAP_LEGEND.rule;
  $("#legend-items").innerHTML =
    items
      .map(
        (item) =>
          `<span><i class="legend-swatch" style="background:${item.color}"></i>${escape(item.label)}</span>`,
      )
      .join("") +
    `<span><i class="legend-swatch" style="background:var(--map-home)"></i>${year < 1707 ? "England & Wales" : "Britain"}</span><span><i class="legend-swatch partial-swatch"></i>Partial extent</span>`;
}
function refreshWorld() {
  const changes =
    activeView === "territory"
      ? null
      : mapExperience?.update({ ...state(), previousYear });
  globe?.update({ ...state(), previousYear, changes });
  flatMap?.update({ ...state(), previousYear, changes });
}
function setYear(nextYear, { notify = false, url = true } = {}) {
  previousYear = year;
  const parsed = Number(nextYear);
  year = Number.isFinite(parsed)
    ? Math.max(1600, Math.min(1997, Math.round(parsed)))
    : 1922;
  $("#hero-year").textContent = year;
  $("#year-output").textContent = year;
  $("#year-slider").value = year;
  $("#year-slider").setAttribute("aria-valuetext", `${year}`);
  $("#previous-year").disabled = year === 1600;
  $("#next-year").disabled = year === 1997;
  $$("[data-year]", $(".year-waypoints")).forEach((button) =>
    button.classList.toggle("is-active", Number(button.dataset.year) === year),
  );
  refreshWorld();
  updateLegend();
  renderContext();
  if (url) updateURL();
  if (notify) announce(`The atlas shows the end of ${year}.`);
}
function renderContext() {
  if (!data) return;
  const target = $("#historical-context");
  const territory = selectedId && data.get(selectedId);
  target.classList.toggle("is-territory", !!territory);
  $("#place-shortcuts").hidden = !!territory;
  if (!territory) {
    const era =
      [...eras].reverse().find((item) => item.year <= year) || eras[0];
    target.innerHTML = `<p class="context-label">${year === era.year ? "The bigger picture" : `Historical context · from ${era.year}`}</p><h2>${escape(yearHeadings[era.year] || era.title)}</h2><p>${escape(era.summary)}</p><div class="context-question"><span>${questionIcon}A question to carry with you</span><p>${escape(era.question)}</p></div>${returningToRallye ? '<a href="#rallye" class="text-link" style="margin-top:22px">Return to your rallye →</a>' : '<p class="context-chapter">Select a place for a more detailed view.</p>'}`;
    return;
  }
  const current = data.territoryAt(territory.id, year);
  const label = current?.controlled
    ? current.span?.label ||
      data.statuses.find((item) => item.id === current.status)?.label ||
      current.status
    : "Outside British authority";
  const summary =
    territorySummaries[territory.id] ||
    shortProse(
      territory.pedagogy?.whyItMatters ||
        territory.pedagogy?.hook ||
        current?.span?.howControlWorked ||
        "Read the dates and sources to explore this territory’s history.",
    );
  const allDates = territory.pedagogy?.keyDates || [];
  const dates =
    allDates.length > 3
      ? [
          allDates[0],
          allDates[Math.floor(allDates.length / 2)],
          allDates.at(-1),
        ]
      : allDates;
  target.innerHTML = `<button class="territory-back" id="back-to-context">← The bigger picture</button><p class="context-label">${escape(data.regions.find((region) => region.id === territory.region)?.label || territory.region.replaceAll("-", " "))}</p><h2>${escape(territory.name)}</h2><span class="territory-status">${escape(label)} · ${year}</span><p>${escape(summary)}</p><ul class="territory-dates">${dates
    .map((item) => {
      const date = readDate(item.date);
      if (!date) return "";
      return `<li>${date.year >= 1600 && date.year <= 1997 ? `<button data-context-year="${date.year}" title="Show ${date.year}">${date.year}</button>` : `<strong>${date.year}</strong>`}<span>${escape(item.what)}</span></li>`;
    })
    .join(
      "",
    )}</ul><a class="button button-primary territory-open" href="${escape(territoryHash(territory.id))}">Explore ${escape(territory.name)} <span aria-hidden="true">↗</span></a>${returningToRallye ? '<a href="#rallye" class="text-link" style="margin-top:16px">Return to your rallye →</a>' : ""}<details class="territory-sources"><summary>Sources & context</summary><p>The map shows the end of ${year}; this summary spans the territory’s history. These works underpin the original dataset.</p>${(
    territory.evidence || []
  )
    .slice(0, 3)
    .map(
      (source) =>
        `<p>${escape(source.author)}. <em>${escape(source.work)}</em> (${escape(source.year)}).${safeURL(source.url) ? ` <a href="${escape(safeURL(source.url))}" target="_blank" rel="noopener noreferrer">Read ↗</a>` : ""}</p>`,
    )
    .join("")}</details>`;
  $("#back-to-context").addEventListener("click", () => {
    selectedId = null;
    refreshWorld();
    renderContext();
    updateURL();
    $("#place-search").focus({ preventScroll: true });
  });
  $$("[data-context-year]", target).forEach((button) =>
    button.addEventListener("click", () => {
      stopPlayback();
      setYear(button.dataset.contextYear, { notify: true });
    }),
  );
}
function selectPlace(id, { focus = false } = {}) {
  if (!data.get(id)) return;
  if (activeView === "territory") {
    location.hash = territoryHash(id);
    return;
  }
  selectedId = id;
  stopPlayback();
  $("#place-search").value = "";
  hideResults();
  refreshWorld();
  if (projection === "globe" || focus) {
    if (globeUnavailable) flatMap?.focusTerritory?.(id, year);
    else globe?.focusTerritory(id);
  }
  renderContext();
  updateURL();
  announce(
    `${data.get(id).name} selected. Its history is shown in the context panel.`,
  );
  if (focus) $("#back-to-context")?.focus({ preventScroll: true });
  if (matchMedia("(max-width: 760px)").matches)
    $(".context-panel").scrollIntoView({
      block: "nearest",
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
}
function hideResults() {
  $("#place-results").hidden = true;
  $("#place-search").setAttribute("aria-expanded", "false");
}
function showResults() {
  if (!data) return;
  const query = $("#place-search").value.trim().toLocaleLowerCase();
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
        .slice(0, 8)
    : ["british-india", "jamaica", "kenya", "canada", "hong-kong"]
        .map((id) => data.get(id))
        .filter(Boolean);
  $("#place-results").innerHTML = matches.length
    ? matches
        .map(
          (territory) =>
            `<button role="option" aria-selected="false" data-select-place="${escape(territory.id)}">${escape(territory.name)}<small>${escape(data.regions.find((region) => region.id === territory.region)?.label || territory.region.replaceAll("-", " "))}</small></button>`,
        )
        .join("")
    : '<p role="option" aria-disabled="true">No matching place. Try a modern or historical name.</p>';
  $("#place-results").hidden = false;
  $("#place-search").setAttribute("aria-expanded", "true");
  if (!matches.length)
    announce("No matching place. Try a modern or historical name.");
  $$("[data-select-place]").forEach((button) =>
    button.addEventListener("click", () =>
      selectPlace(button.dataset.selectPlace, { focus: true }),
    ),
  );
}
async function setProjection(next, { url = true, animate = true } = {}) {
  const request = ++projectionRequest;
  projection = next === "globe" && !globeUnavailable ? "globe" : "flat";
  $("#globe-container").hidden = globeUnavailable;
  $("#flat-container").hidden = !globeUnavailable;
  $("#scene-stage").dataset.projection = projection;
  renderContext();
  $("#globe-view").setAttribute("aria-pressed", String(projection === "globe"));
  $("#flat-view").setAttribute("aria-pressed", String(projection === "flat"));
  $("#interaction-hint span").textContent =
    projection === "globe"
      ? "Drag to rotate · Select a place"
      : "Select a place · Zoom to look closer";
  $("#view-description").textContent = globeUnavailable
    ? "Flat atlas · 3D unavailable on this device"
    : projection === "globe"
      ? "A world in perspective"
      : "The world, unfolded";
  if (globeUnavailable && !flatMap)
    flatMap = createMap($("#flat-container"), {
      data,
      onSelect: (id) => selectPlace(id),
    });
  globe?.setActive(activeView === "explore" || activeView === "territory");
  refreshWorld();
  if (url) updateURL();
  if (globe && !globeUnavailable) {
    $("#scene-stage").setAttribute("aria-busy", "true");
    try {
      await globe.setProjection?.(projection, {
        animate: animate && !reducedMotion.matches,
      });
    } finally {
      if (request === projectionRequest)
        $("#scene-stage").setAttribute("aria-busy", "false");
    }
  }
}
function stopPlayback() {
  clearInterval(playTimer);
  playTimer = null;
  $("#play-timeline").setAttribute("aria-pressed", "false");
  $("#play-timeline span").textContent = "Play history";
  $("#play-timeline svg").innerHTML = '<path d="m8 5 11 7-11 7z"/>';
}
function togglePlayback() {
  if (playTimer) return stopPlayback();
  if (year >= 1997) setYear(1600);
  $("#play-timeline").setAttribute("aria-pressed", "true");
  $("#play-timeline span").textContent = "Pause";
  $("#play-timeline svg").innerHTML = '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>';
  playTimer = setInterval(() => {
    setYear(Math.min(1997, year + 5));
    if (year >= 1997) stopPlayback();
  }, 1000);
}
function reflectProgress(next = {}) {
  progress = { ...progress, ...next };
  $("#nav-count").textContent = progress.submitted
    ? "✓"
    : `${progress.completed}/${progress.total}`;
  $("#assessment-cta").innerHTML =
    `${progress.submitted ? "View your field notes" : progress.started ? "Continue the rallye" : "Begin the rallye"} <span aria-hidden="true">→</span>`;
  $("#assessment-status").textContent = progress.submitted
    ? "Your notes are saved. Revisit, edit or download them at any time."
    : !progress.canSave
      ? "Keep this tab open and download your notes before leaving."
      : progress.started
        ? `${progress.completed} of ${progress.total} tasks marked done by you · Saved on this device.`
        : "Your field notes are saved as you go.";
}
async function renderRoute({ initial = false } = {}) {
  if (!data || !rallye) return;
  const request = ++routeRequest;
  stopPlayback();
  hideResults();
  if (location.hash === "#main") {
    $("#main").focus();
    return;
  }
  const [path, query = ""] = location.hash.slice(1).split("?");
  const parameters = new URLSearchParams(query);
  const nextView = ["rallye", "territory"].includes(path)
    ? path
    : "explore";
  const previousView = activeView;
  const leavingFocus = previousView === "territory" && nextView !== "territory";
  let restoredFocus = null,
    restoredCamera = null;
  if (nextView !== "explore") await fullscreen?.exit?.();
  if (request !== routeRequest) return;
  if (nextView === "territory" && previousView !== "territory") {
    focusSession = {
      origin:
        parameters.get("return") === "rallye" || previousView === "rallye"
          ? "rallye"
          : "explore",
      atlasHash: initial ? null : exploreHash(),
      camera: atlas()?.captureView?.(),
      year,
      previousYear,
      projection,
      colourMode,
      selectedId,
    };
  }
  if (previousView === "rallye" && nextView !== previousView) rallye.hide?.();
  if (leavingFocus) {
    territoryPage.hide?.();
    restoredFocus = territoryFocus.close();
    restoredCamera = focusSession?.camera;
    // Routes without explicit atlas state return to the context we left.
    if (focusSession) {
      year = focusSession.year;
      previousYear = focusSession.previousYear;
      projection = focusSession.projection;
      colourMode = focusSession.colourMode;
      selectedId = focusSession.selectedId;
    }
  }
  activeView = nextView;
  for (const view of ["explore", "rallye", "territory"])
    $("#" + view + "-view").hidden =
      view === "explore"
        ? !["explore", "territory"].includes(activeView)
        : view !== activeView;
  $$("[data-view]").forEach((link) => {
    const current = activeView === "territory" ? "explore" : activeView;
    if (link.dataset.view === current)
      link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  globe?.setActive(activeView === "explore" || activeView === "territory");
  if (activeView === "territory") {
    const id = parameters.get("id") || "british-india";
    selectedId = data.get(id) ? id : null;
    returningToRallye = parameters.get("return") === "rallye";
    if (parameters.has("colour"))
      colourMode = parameters.get("colour") === "rule" ? "rule" : "extent";
    setYear(parameters.has("year") ? parameters.get("year") : year, {
      url: false,
    });
    await setProjection(
      parameters.has("view") ? parameters.get("view") : projection,
      { url: false, animate: false },
    );
    if (request !== routeRequest) return;
    if (initial) {
      focusSession.camera = atlas()?.captureView?.();
      focusSession.year = year;
      focusSession.projection = projection;
      focusSession.colourMode = colourMode;
      focusSession.selectedId = selectedId;
    }
    if (!focusSession.atlasHash) focusSession.atlasHash = exploreHash();
    const at = selectedId && data.territoryAt(selectedId, year);
    territoryFocus.open({
      id: selectedId,
      name: data.get(id)?.name || "Territory not found",
      year,
      projection,
      fromRallye: returningToRallye,
      note: selectedId
        ? `${at?.active ? `Approximate coverage recorded for ${year}.` : `No status recorded in ${year}; the outline locates its combined historical extent.`} Other geography is faded. Modern boundaries stand in for historical frontiers; a marker locates small territories.${at?.span?.partial?.length ? " Hatching marks partial control." : ""}`
        : "Choose another territory from the atlas to read its story.",
    });
    territoryPage.show(id, { year });
    refreshWorld();
    refocusTerritory();
    territoryFocus.focusHeading();
    document.title = `${data.get(id)?.name || "Territory"} · Empire / Echoes`;
    announce(
      `${data.get(id)?.name || "Territory"} in focus on the ${projection === "globe" ? "globe" : "flat map"}, ${year}. Escape returns to ${focusSession.origin === "rallye" ? "your rallye" : "the atlas"}.`,
    );
    return;
  }
  if (leavingFocus) {
    refreshWorld();
    atlas()?.restoreView?.(restoredCamera);
    focusSession = null;
  }
  if (activeView === "rallye") {
    rallye.show();
    document.title = "The Empire Rallye · Empire / Echoes";
  } else {
    returningToRallye = parameters.get("return") === "rallye";
    $("#rallye-map-return").hidden = !returningToRallye;
    if (parameters.has("place"))
      selectedId = data.get(parameters.get("place"))
        ? parameters.get("place")
        : null;
    if (parameters.has("colour"))
      colourMode = parameters.get("colour") === "rule" ? "rule" : "extent";
    $("#colour-mode").value = colourMode;
    setYear(parameters.has("year") ? parameters.get("year") : year, {
      url: false,
    });
    await setProjection(
      parameters.has("view") ? parameters.get("view") : projection,
      { url: false, animate: false },
    );
    if (request !== routeRequest) return;
    if (leavingFocus) atlas()?.restoreView?.(restoredCamera);
    else if (selectedId && projection === "globe")
      globe?.focusTerritory(selectedId);
    document.title = "Empire / Echoes · An atlas of power and belonging";
  }
  if (!initial && request === routeRequest && activeView !== "rallye") {
    if (
      leavingFocus &&
      restoredFocus?.isConnected &&
      !["BODY", "HTML"].includes(restoredFocus.tagName) &&
      !restoredFocus.closest("[hidden], [inert]")
    )
      restoredFocus.focus({ preventScroll: true });
    else if (leavingFocus && activeView === "explore")
      ($(".territory-open") || $("#place-search")).focus({
        preventScroll: true,
      });
    else {
      window.scrollTo({ top: 0, behavior: "instant" });
      $("#main").focus({ preventScroll: true });
    }
  }
}

function navigate() {
  if (
    activeView !== "territory" &&
    !location.hash.startsWith("#territory") &&
    document.startViewTransition &&
    !reducedMotion.matches
  ) {
    transition?.skipTransition();
    transition = document.startViewTransition(() => renderRoute());
    transition.finished.catch(() => {});
    transition.ready.catch(() => {});
    transition.updateCallbackDone.catch(showBootError);
  } else renderRoute().catch(showBootError);
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
    announce(`The atlas shows the end of ${year}.`),
  );
  $("#previous-year").addEventListener("click", () => {
    stopPlayback();
    setYear(year - 1, { notify: true });
  });
  $("#next-year").addEventListener("click", () => {
    stopPlayback();
    setYear(year + 1, { notify: true });
  });
  $$("[data-year]").forEach((button) =>
    button.addEventListener("click", () => {
      selectedId = null;
      stopPlayback();
      setYear(button.dataset.year, { notify: true });
    }),
  );
  $$("[data-place]").forEach((button) =>
    button.addEventListener("click", () =>
      selectPlace(button.dataset.place, { focus: true }),
    ),
  );
  $("#colour-mode").addEventListener("change", (event) => {
    colourMode = event.target.value;
    refreshWorld();
    updateLegend();
    updateURL();
    announce("Atlas colour view updated.");
  });
  $("#globe-view").addEventListener("click", () => setProjection("globe"));
  $("#flat-view").addEventListener("click", () => setProjection("flat"));
  $("#zoom-in").addEventListener("click", () =>
    (globeUnavailable ? flatMap : globe)?.zoomBy(1.3),
  );
  $("#zoom-out").addEventListener("click", () =>
    (globeUnavailable ? flatMap : globe)?.zoomBy(1 / 1.3),
  );
  $("#reset-view").addEventListener("click", () =>
    (globeUnavailable ? flatMap : globe)?.reset(),
  );
  $("#play-timeline").addEventListener("click", togglePlayback);
  $("#read-map").addEventListener("click", () => {
    const open = $("#map-reading").hidden;
    $("#map-reading").hidden = !open;
    $("#read-map").setAttribute("aria-expanded", String(open));
  });
  $("#place-search").addEventListener("focus", showResults);
  $("#place-search").addEventListener("input", showResults);
  $("#place-search").addEventListener("keydown", (event) => {
    const first = $("#place-results button");
    if ((event.key === "ArrowDown" || event.key === "Enter") && first) {
      event.preventDefault();
      if (event.key === "Enter") first.click();
      else first.focus();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      hideResults();
    }
  });
  $("#place-results").addEventListener("keydown", (event) => {
    const buttons = $$("#place-results button");
    const index = buttons.indexOf(document.activeElement);
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
      hideResults();
    }
  });
  document.addEventListener("click", (event) => {
    if (!$(".place-search").contains(event.target)) hideResults();
  });
  document.addEventListener("focusin", (event) => {
    if (!$(".place-search").contains(event.target)) hideResults();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(
        document.activeElement.tagName,
      ) &&
      activeView === "explore"
    ) {
      event.preventDefault();
      $("#place-search").focus();
    }
    if (event.key === "Escape") stopPlayback();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopPlayback();
  });
  addEventListener("hashchange", navigate);
  $("#reload-app").addEventListener("click", () => location.reload());
}
function showBootError(error) {
  console.error("Journey startup failed:", error);
  $("#boot-error").hidden = false;
  $("#boot-error-message").textContent =
    "The new atlas could not open. Reload to try again, or use the previous classroom version.";
  $("#atlas-experience").setAttribute("aria-busy", "false");
  $("#reload-app").onclick = () => location.reload();
}
async function boot() {
  try {
    data = createYearEndData(await loadData());
    if (data.meta.placeholder || !data.geo.coarse?.data)
      throw new Error("The local historical dataset could not be loaded.");
    const [
      { createRallye },
      { createTerritory },
      { createFullscreen },
      { createMapExperience },
    ] = await Promise.all([
      import("./rallye.js"),
      import("./territory.js"),
      import("./fullscreen.js"),
      import("./map-experience.js"),
    ]);
    const explore = (
      { year: wantedYear = 1922, territoryId } = {},
      fromRallye = false,
    ) => {
      const params = new URLSearchParams({
        year: wantedYear,
        view: projection,
        colour: colourMode,
      });
      if (fromRallye) params.set("return", "rallye");
      if (territoryId) params.set("place", territoryId);
      location.hash = `explore?${params}`;
    };
    rallye = await createRallye($("#rallye-view"), {
      data,
      onProgress: reflectProgress,
      onExplore: (options) => explore(options, true),
      onTerritory: (id, wantedYear = year) => {
        location.hash = territoryHash(id, wantedYear, true);
      },
    });
    territoryFocus = createTerritoryFocus($("#territory-view"), {
      stage: $("#scene-stage"),
      onClose: () => closeTerritory(),
      onAtlas: () => closeTerritory({ toAtlas: true }),
      onRefocus: (options) => refocusTerritory(options),
    });
    territoryPage = await createTerritory(territoryFocus.reading, {
      data,
      onExplore: (options) => explore(options, returningToRallye),
      onNavigate: (id, wantedYear = year) => {
        location.hash = territoryHash(id, wantedYear);
      },
    });
    mapExperience = createMapExperience($("#map-experience"), {
      data,
      onYear: (next) => {
        stopPlayback();
        setYear(next, { notify: true });
      },
      onSelect: (id) => selectPlace(id, { focus: true }),
    });
    fullscreen = createFullscreen(
      $("#atlas-experience"),
      $("#fullscreen-toggle"),
      {
        onChange: () => {
          stopPlayback();
        },
      },
    );
    try {
      const { createGlobe } = await import("./globe.js");
      $("#globe-container").replaceChildren();
      globe = await createGlobe($("#globe-container"), {
        data,
        onSelect: (id) => selectPlace(id),
        onFallback: () => {
          globeUnavailable = true;
          $("#globe-view").disabled = true;
          setProjection("flat", { animate: false }).then(() => {
            if (activeView === "territory") {
              if (focusSession) {
                // A lost WebGL context cannot restore its camera into SVG.
                // Keep the atlas/history state, with the fallback's own view.
                focusSession.camera = flatMap?.captureView?.();
                focusSession.projection = "flat";
                if (focusSession.atlasHash) {
                  const params = new URLSearchParams(
                    focusSession.atlasHash.split("?")[1],
                  );
                  params.set("view", "flat");
                  focusSession.atlasHash = `#explore?${params}`;
                }
              }
              $("[data-focus-context]").textContent = `Flat map · ${year}`;
              refocusTerritory({ animate: false });
            }
          });
          announce("3D is unavailable. The flat atlas is ready to use.");
        },
      });
    } catch (error) {
      console.warn("Using flat atlas:", error.message);
      globeUnavailable = true;
      $("#globe-view").disabled = true;
      $("#globe-view").title =
        "3D is unavailable on this device. Use the flat map.";
      projection = "flat";
    }
    wireEvents();
    reflectProgress(rallye.getProgress());
    await renderRoute({ initial: true });
    $("#atlas-experience").setAttribute("aria-busy", "false");
    $("#boot-error").hidden = true;
    document.documentElement.dataset.ready = "true";
    document.documentElement.dataset.version = "empire-echoes-v3";
    announce(
      "The atlas is ready. Explore the map or begin the Empire Rallye. Plan about 60 minutes for the enquiry.",
    );
  } catch (error) {
    showBootError(error);
  }
}
boot();
