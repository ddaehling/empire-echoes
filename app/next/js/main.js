import { loadData, readDate } from "../../js/core/data.js";
import { createMap, MAP_LEGEND } from "../../js/classroom/map.js";
import { eras } from "../../js/classroom/content.js";

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
let data, globe, flatMap, assessment;
let year = 1922,
  colourMode = "extent",
  projection = "globe",
  selectedId = null;
let activeView = "explore",
  playTimer = null,
  globeUnavailable = false,
  returningToTest = false,
  transition;
let progress = {
  started: false,
  completed: 0,
  total: 8,
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
const state = () => ({ year, mode: colourMode, selectedId });
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
  if (returningToTest) parameters.set("return", "assessment");
  history.replaceState(null, "", `#explore?${parameters}`);
}
function updateLegend() {
  const items =
    colourMode === "extent"
      ? [{ label: "British authority", color: "#c77766" }]
      : MAP_LEGEND.rule;
  $("#legend-items").innerHTML =
    items
      .map(
        (item) =>
          `<span><i class="legend-swatch" style="background:${item.color}"></i>${escape(item.label)}</span>`,
      )
      .join("") +
    `<span><i class="legend-swatch" style="background:#34594d"></i>${year < 1707 ? "England & Wales" : "Britain"}</span><span><i class="legend-swatch partial-swatch"></i>Partial extent</span>`;
}
function refreshWorld() {
  globe?.update(state());
  flatMap?.update(state());
}
function setYear(nextYear, { notify = false, url = true } = {}) {
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
  if (notify) announce(`The atlas shows ${year}.`);
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
    target.innerHTML = `<p class="context-label">${year === era.year ? "The bigger picture" : `Historical context · from ${era.year}`}</p><h2>${escape(yearHeadings[era.year] || era.title)}</h2><p>${escape(era.summary)}</p><div class="context-question"><span>${questionIcon}A question to carry with you</span><p>${escape(era.question)}</p></div>${returningToTest ? '<a href="#assessment" class="text-link" style="margin-top:22px">Return to your assessment →</a>' : '<p class="context-chapter">Select a place for a more detailed view.</p>'}`;
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
    )}</ul>${returningToTest ? '<a href="#assessment" class="text-link" style="margin-top:16px">Return to your assessment →</a>' : ""}<details class="territory-sources"><summary>Sources & context</summary><p>The map shows ${year}; this summary spans the territory’s history. These works underpin the original dataset.</p>${(
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
  selectedId = id;
  stopPlayback();
  $("#place-search").value = "";
  hideResults();
  refreshWorld();
  if (projection === "globe") globe?.focusTerritory(id);
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
async function setProjection(next, { url = true } = {}) {
  projection = next === "globe" && !globeUnavailable ? "globe" : "flat";
  $("#globe-container").hidden = projection !== "globe";
  $("#flat-container").hidden = projection !== "flat";
  $("#scene-stage").dataset.projection = projection;
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
      : "Compare the whole world";
  if (projection === "flat" && !flatMap) {
    flatMap = createMap($("#flat-container"), {
      data,
      onSelect: (id) => selectPlace(id),
    });
  }
  globe?.setActive(projection === "globe" && activeView === "explore");
  refreshWorld();
  if (url) updateURL();
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
function reflectProgress(next) {
  progress = { ...progress, ...next };
  $("#nav-count").textContent = progress.submitted
    ? "✓"
    : `${progress.completed}/${progress.total}`;
  $("#assessment-cta").innerHTML =
    `${progress.submitted ? "View your results" : progress.started ? "Continue your assessment" : "Start the assessment"} <span aria-hidden="true">→</span>`;
  $("#assessment-status").textContent = progress.submitted
    ? "Completed on this device. Open your report to save a copy."
    : !progress.canSave
      ? "Progress is kept until this tab closes."
      : progress.started
        ? `${progress.completed} of ${progress.total} assignments answered · Saved on this device.`
        : "Your progress is saved on this device.";
}
function renderRoute({ initial = false } = {}) {
  if (!data || !assessment) return;
  stopPlayback();
  hideResults();
  if (location.hash === "#main") {
    $("#main").focus();
    return;
  }
  const [path, query = ""] = location.hash.slice(1).split("?");
  activeView = path === "assessment" ? "assessment" : "explore";
  $("#explore-view").hidden = activeView !== "explore";
  $("#assessment-view").hidden = activeView !== "assessment";
  $$("[data-view]").forEach((link) => {
    if (link.dataset.view === activeView)
      link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (activeView === "assessment") {
    globe?.setActive(false);
    assessment.show();
    document.title = "Your assessment · The British Empire";
  } else {
    const parameters = new URLSearchParams(query);
    returningToTest = parameters.get("return") === "assessment";
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
    setProjection(
      parameters.has("view") ? parameters.get("view") : projection,
      { url: false },
    );
    if (selectedId && projection === "globe") globe?.focusTerritory(selectedId);
    document.title = "The British Empire · Explore & assess";
  }
  if (!initial) {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("#main").focus({ preventScroll: true });
  }
}
function navigate() {
  if (document.startViewTransition && !reducedMotion.matches) {
    transition?.skipTransition();
    transition = document.startViewTransition(() => renderRoute());
    transition.finished.catch(() => {});
  } else renderRoute();
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
    announce(`The atlas shows ${year}.`),
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
    (projection === "globe" ? globe : flatMap)?.zoomBy(1.3),
  );
  $("#zoom-out").addEventListener("click", () =>
    (projection === "globe" ? globe : flatMap)?.zoomBy(1 / 1.3),
  );
  $("#reset-view").addEventListener("click", () =>
    (projection === "globe" ? globe : flatMap)?.reset(),
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
async function boot() {
  try {
    data = await loadData();
    if (data.meta.placeholder || !data.geo.coarse?.data)
      throw new Error("The local historical dataset could not be loaded.");
    const { createAssessment } = await import("./assessment.js");
    assessment = await createAssessment($("#assessment-view"), {
      data,
      onProgress: reflectProgress,
      onExplore: ({ year: wantedYear = 1922, territoryId }) => {
        const parameters = new URLSearchParams({
          year: wantedYear,
          return: "assessment",
        });
        if (territoryId) parameters.set("place", territoryId);
        location.hash = `explore?${parameters}`;
      },
    });
    try {
      const { createGlobe } = await import("./globe.js");
      $("#globe-container").replaceChildren();
      globe = await createGlobe($("#globe-container"), {
        data,
        onSelect: (id) => selectPlace(id),
        onFallback: () => {
          globeUnavailable = true;
          $("#globe-view").disabled = true;
          setProjection("flat");
          announce("3D is unavailable. The flat atlas is ready to use.");
        },
      });
    } catch (error) {
      globeUnavailable = true;
      $("#globe-view").disabled = true;
      $("#globe-view").title =
        "3D is unavailable on this device. Use the flat map.";
      projection = "flat";
      // WebGL is an enhancement. The complete atlas and assessment work without it.
    }
    wireEvents();
    reflectProgress(assessment.getProgress());
    renderRoute({ initial: true });
    $("#atlas-experience").setAttribute("aria-busy", "false");
    document.documentElement.dataset.ready = "true";
    document.documentElement.dataset.version = "assessment-v2";
    announce(
      "The atlas is ready. Explore the world, then complete all eight assessment assignments.",
    );
  } catch (error) {
    console.error("Atlas startup failed:", error);
    $("#boot-error").hidden = false;
    $("#boot-error-message").textContent =
      "The new experience could not open. Reload to try again, or use the original classroom version.";
    $("#atlas-experience").setAttribute("aria-busy", "false");
    $("#reload-app").onclick = () => location.reload();
  }
}
boot();
