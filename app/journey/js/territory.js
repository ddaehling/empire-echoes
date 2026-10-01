import { readDate } from "../../js/core/data.js";
import { territoryStories } from "./territory-content.js";

const list = (value) =>
  Array.isArray(value) ? value : value == null ? [] : [value];
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const readable = (value) =>
  String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
const unique = (values) => [...new Set(values.filter(Boolean))];
const yearOf = (value) => readDate(value)?.year;
const date = (value) => {
  const d = readDate(value);
  return d
    ? d.display || `${d.circa ? "c. " : ""}${d.year}`
    : "Date not recorded";
};
const period = (start, end) =>
  `${date(start)}${end ? ` – ${date(end)}` : " onwards"}`;
const external = (url) => {
  try {
    const u = new URL(url);
    return /^(https?:)$/.test(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
};
const sourceTitle = (source) =>
  source.title || source.work || source.name || source.author || "Source";
const sourceLink = (url, title) =>
  external(url)
    ? `<a href="${escape(external(url))}" target="_blank" rel="noopener noreferrer">${escape(title)} <span aria-hidden="true">↗</span><span class="tp-sr"> (opens in a new tab)</span></a>`
    : escape(title);
let instance = 0;

function sourcesFor(territory, story) {
  const rows = [
    ...list(story?.sources),
    ...list(territory.evidence),
    ...list(territory.sources),
  ];
  for (const item of [
    ...territory.acquisitions,
    ...territory.departures,
    ...list(territory.statusPeriods),
    ...territory.events,
  ])
    rows.push(...list(item.evidence || item.sources));
  const seen = new Set();
  return rows.filter((row) => {
    if (!row || typeof row !== "object") return false;
    const key = [sourceTitle(row), row.author || "", row.year || ""].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function timelineFor(territory) {
  const rows = [
    ...territory.acquisitions.map((item) => ({
      ...item,
      type: "British involvement",
      title: readable(item.mechanism),
      text: item.how,
      year: item.year ?? yearOf(item.date),
    })),
    ...territory.departures.map((item) => ({
      ...item,
      type: "A changing relationship",
      title: readable(item.mechanism),
      text: item.how,
      year: item.year ?? yearOf(item.date),
    })),
    ...territory.events.map((item) => ({
      ...item,
      type: readable(item.type),
      text: item.summary,
      year: item.year ?? yearOf(item.date),
    })),
  ]
    .filter((item) => item.text || item.title)
    .sort((a, b) => (a.year || 0) - (b.year || 0));
  const seen = new Set();
  return rows.filter((item) => {
    const key = `${item.year}|${item.title}|${item.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sameRecordedDate(a, b) {
  const asDate = (value) =>
    value &&
    typeof value === "object" &&
    "month" in value &&
    Number.isFinite(value.year)
      ? value
      : readDate(value);
  const left = asDate(a),
    right = asDate(b);
  return (
    left &&
    right &&
    left.year === right.year &&
    left.month === right.month &&
    left.day === right.day
  );
}

function timelineHighlights(territory, timeline, selectedYear) {
  const keyDates = list(territory.pedagogy?.keyDates).filter(
    (item) => item.what && readDate(item.date),
  );
  if (keyDates.length) {
    // These are authored teaching selections in the dataset, not the first
    // handful of entries in a potentially centuries-long administrative record.
    return keyDates
      .map((item) => {
        const record = timeline.find((event) =>
          sameRecordedDate(event.date, item.date),
        );
        return {
          ...record,
          date: item.date,
          year: yearOf(item.date),
          title: item.what,
          type: "Selected turning point",
          text: record?.text || "",
        };
      })
      .sort((a, b) => a.year - b.year);
  }
  if (timeline.length <= 6) return timeline;
  const selected = new Set();
  const add = (item) => {
    if (item) selected.add(item);
  };
  add(
    timeline.find((item) => item.id === territory.acquisitions[0]?.id) ||
      timeline[0],
  );
  add(
    timeline.find((item) => item.id === territory.departures.at(-1)?.id) ||
      timeline.at(-1),
  );
  const changes = timeline.filter((item) => item.changedStatus);
  add(changes[0]);
  add(changes.at(-1));
  add(
    [...timeline].sort(
      (a, b) =>
        Math.abs(a.year - selectedYear) - Math.abs(b.year - selectedYear),
    )[0],
  );
  for (const fraction of [0.25, 0.5, 0.75]) {
    if (selected.size >= 6) break;
    add(timeline[Math.round((timeline.length - 1) * fraction)]);
  }
  return [...selected].sort((a, b) => a.year - b.year);
}

/** The reading pane for a deep-linkable territory focus. The atlas remains the source
 * for the long tail; curated stories and documented images add context where
 * available. No new historical assertions are synthesized at runtime. */
export function createTerritory(
  host,
  { data, onExplore = () => {}, onNavigate = () => {} },
) {
  if (!host || !data)
    throw new Error("Territory pages require a host and atlas data.");
  const prefix = `territory-page-${++instance}`;
  let current = null,
    currentYear = 1922,
    destroyed = false;
  const statuses = new Map(
    data.statuses.map((item) => [item.id, item.label || readable(item.id)]),
  );
  const regions = new Map(
    data.regions.map((item) => [item.id, item.label || readable(item.id)]),
  );

  function render() {
    if (!current) {
      host.innerHTML = `<div class="territory-page tp-missing"><h1 id="territory-focus-title" data-tp-heading tabindex="-1">Territory not found</h1><p>Choose a place from the atlas to open its history.</p><button class="button primary" data-tp-explore>Return to the atlas</button></div>`;
      return;
    }
    const t = current;
    const story = territoryStories[t.id];
    const at = data.territoryAt(t.id, currentYear);
    const currentPeriod = at?.span?.raw;
    const selectedPeriod =
      currentPeriod ||
      list(t.statusPeriods).find((item) => item.howControlWorked) ||
      {};
    const timeline = timelineFor(t);
    const highlights = timelineHighlights(t, timeline, currentYear);
    const sources = sourcesFor(t, story);
    const periods = list(t.statusPeriods);
    const imageRows = list(story?.images).filter(
      (item) => item.src && item.alt && item.caption,
    );
    const summary =
      story?.subtitle ||
      t.pedagogy?.hook ||
      t.pedagogy?.summary ||
      selectedPeriod.howControlWorked ||
      t.acquisitions[0]?.how ||
      `${t.name} is recorded in the atlas as part of ${regions.get(t.region) || readable(t.region)}. Follow its changing relationship with British authority through the chronology and sources below.`;
    const activeStatus = at?.active
      ? statuses.get(at.status) || readable(at.status)
      : "Outside the recorded period";
    const start = t.acquisitions[0]?.date || periods[0]?.from;
    const end = t.departures[0]?.date || periods.at(-1)?.to;
    const storySections = list(story?.sections);
    const firstAcquisition = t.acquisitions[0];
    const lastDeparture = t.departures.at(-1);
    const related = unique([
      ...list(t.relatedTerritories),
      t.nestedWithin,
      ...data.territories
        .filter((item) => item.nestedWithin === t.id)
        .map((item) => item.id),
    ])
      .filter((id) => data.get(id) && id !== t.id)
      .slice(0, 5);
    const sourceItem = (item) =>
      `<li><strong>${sourceLink(item.url || item.href, sourceTitle(item))}</strong>${item.author || item.year ? `<p class="tp-source-meta">${escape([item.author, item.year, item.publisher].filter(Boolean).join(" · "))}</p>` : ""}${item.supports ? `<p>${escape(item.supports)}</p>` : ""}${item.check ? `<p class="tp-small">${escape(item.check)}</p>` : ""}</li>`;
    const visibleSourceCount = Math.max(3, list(story?.sources).length);
    const timelineItem = (item) =>
      `<li class="tp-timeline-item"><div class="tp-timeline-date">${escape(date(item.date || item.year))}</div><div><h3>${escape(item.title || item.type)}</h3>${item.text ? `<p>${escape(item.text)}</p>` : ""}${item.significance ? `<p class="tp-timeline-context">${escape(item.significance)}</p>` : ""}<button class="tp-inline-button" data-tp-explore data-year="${escape(item.year || currentYear)}">Explore ${escape(item.year || currentYear)} on the map <span aria-hidden="true">↗</span></button></div></li>`;
    host.innerHTML = `<article class="territory-page" data-territory-id="${escape(t.id)}">
      <div class="tp-breadcrumb"><span>${escape(regions.get(t.region) || readable(t.region))}${t.subregion ? ` / ${escape(t.subregion)}` : ""}</span></div>
      <header class="tp-heading"><h1 id="territory-focus-title" data-tp-heading tabindex="-1">${escape(t.name)}</h1><p>${escape(summary)}</p></header>
      <div class="tp-facts"><div><span>Relationship recorded</span><strong>${escape(start ? period(start, end) : "See chronology")}</strong></div><div><span>At ${escape(currentYear)}</span><strong>${escape(activeStatus)}</strong></div><div><span>Geographic setting</span><strong>${escape(t.subregion || regions.get(t.region) || readable(t.region))}</strong></div></div>
      <nav class="tp-jump-nav" aria-label="On this territory page"><a href="#${prefix}-story" data-tp-jump="story">The story</a><a href="#${prefix}-timeline" data-tp-jump="timeline">Turning points</a><a href="#${prefix}-power" data-tp-jump="power">People &amp; power</a><a href="#${prefix}-sources" data-tp-jump="sources">Sources</a></nav>
      <div class="tp-reading-layout"><div class="tp-main-reading">
        <section class="tp-section" id="${prefix}-story"><h2>The story</h2>${storySections.length ? storySections.map((section) => `<div class="tp-prose-section"><h3>${escape(section.title)}</h3><p>${escape(section.text)}</p></div>`).join("") : `<div class="tp-prose-section"><h3>How the relationship began</h3><p>${escape(firstAcquisition?.how || selectedPeriod.howControlWorked || "The chronology below records the forms of British authority described in this atlas.")}</p></div>${lastDeparture?.how ? `<div class="tp-prose-section"><h3>How the relationship changed</h3><p>${escape(lastDeparture.how)}</p></div>` : ""}`}
        ${imageRows.length ? `<div class="tp-photographs">${imageRows.map((image) => `<figure><img src="${escape(image.src)}" alt="${escape(image.alt)}" loading="lazy" decoding="async"><figcaption>${escape(image.caption)}<details class="tp-image-credit"><summary>Image credit &amp; source</summary><p>${escape(image.credit || "")}${image.license ? ` · ${escape(image.license)}` : ""}</p>${image.sourceUrl ? sourceLink(image.sourceUrl, "View the original image record") : ""}</details></figcaption></figure>`).join("")}</div>` : ""}</section>
        <section class="tp-section" id="${prefix}-timeline"><h2>Turning points</h2><p class="tp-section-intro">Selected moments in power, resistance and political change. Expand the full chronology to investigate further.</p>${highlights.length ? `<ol class="tp-timeline" data-tp-highlights>${highlights.map(timelineItem).join("")}</ol>${timeline.length ? `<details class="tp-more tp-full-chronology"><summary>Full atlas chronology · ${timeline.length} recorded events</summary><p class="tp-section-intro">All recorded acquisitions, departures and linked events, in date order. Some appear in the selected turning points above.</p><ol class="tp-timeline">${timeline.map(timelineItem).join("")}</ol></details>` : ""}` : `<p>The dataset has no separate event entries for this territory. Its recorded status periods are below.</p>`}</section>
        <section class="tp-section" id="${prefix}-power"><h2>People &amp; power</h2>${currentPeriod?.howControlWorked ? `<div class="tp-prose-section"><h3>How authority worked in ${escape(currentYear)}</h3><p>${escape(currentPeriod.howControlWorked)}</p>${currentPeriod.governedFrom ? `<p class="tp-small">Administration: ${escape(currentPeriod.governedFrom)}.</p>` : ""}</div>` : `<p class="tp-section-intro">The selected year lies outside this territory’s recorded status periods. Explore the forms of authority below.</p>`}
        ${firstAcquisition?.resistance ? `<div class="tp-prose-section"><h3>Resistance and negotiation</h3><p>${escape(firstAcquisition.resistance)}</p></div>` : ""}
        ${lastDeparture?.movement ? `<div class="tp-prose-section"><h3>Movements for change</h3><p>${escape(lastDeparture.movement)}</p></div>` : ""}
        ${periods.length ? `<details class="tp-more"><summary>All ${periods.length} recorded forms of government</summary><div class="tp-authority-list">${periods.map((item) => `<section><p class="tp-small">${escape(period(item.from, item.to))}</p><h3>${escape(item.label || statuses.get(item.status) || readable(item.status))}</h3>${item.howControlWorked ? `<p>${escape(item.howControlWorked)}</p>` : ""}</section>`).join("")}</div></details>` : ""}
        ${list(t.namesOverTime).length > 1 ? `<details class="tp-more"><summary>Names and perspectives</summary><ul class="tp-names">${t.namesOverTime.map((item) => `<li><strong>${escape(item.name)}</strong>${item.language ? ` <span>(${escape(item.language)})</span>` : ""}${item.note ? `<p>${escape(item.note)}</p>` : ""}</li>`).join("")}</ul></details>` : ""}</section>
        <section class="tp-section tp-sources" id="${prefix}-sources"><h2>Follow the evidence</h2><p class="tp-section-intro">${story ? "The linked readings support the story above. The atlas bibliography also records works used for its chronology and government descriptions." : "These works are recorded in the atlas bibliography. Use them to investigate the chronology and compare perspectives."}</p>${sources.length ? `<ol>${sources.slice(0, visibleSourceCount).map(sourceItem).join("")}</ol>${sources.length > visibleSourceCount ? `<details class="tp-more tp-bibliography"><summary>Atlas bibliography · ${sources.length - visibleSourceCount} more works</summary><ol start="${visibleSourceCount + 1}">${sources.slice(visibleSourceCount).map(sourceItem).join("")}</ol></details>` : ""}` : `<p>No separate bibliography is recorded for this territory. Its page draws on the atlas’s territory record.</p>`}<a class="tp-dataset-link" href="${escape(new URL(`../../data/territories/${t.shard}`, import.meta.url).href)}" target="_blank" rel="noopener noreferrer">Inspect the atlas record <span aria-hidden="true">↗</span><span class="tp-sr"> (opens JSON in a new tab)</span></a></section>
      </div><aside class="tp-aside"><section class="tp-identity"><h2>Echoes in Britain</h2><p>${escape(story?.identityConnection || "Use this case to investigate a connection with Britain today: migration and belonging, trade and wealth, public memory, or ideas about Britain’s place in the world. Find evidence for a specific connection, and distinguish it from a claim about what all British people think.")}</p><p class="tp-identity-prompt">Whose experience is visible here? Whose account would change the story?</p></section>${related.length ? `<section class="tp-related"><h2>Connected places</h2><ul>${related.map((id) => `<li><a href="#territory?id=${encodeURIComponent(id)}&amp;year=${currentYear}" data-tp-territory="${escape(id)}">${escape(data.get(id).name)} <span aria-hidden="true">↗</span></a></li>`).join("")}</ul></section>` : ""}<button class="button primary tp-map-action" data-tp-explore>Return to the full atlas <span aria-hidden="true">↗</span></button></aside></div>
    </article>`;
  }

  function onClick(event) {
    const explore = event.target.closest("[data-tp-explore]");
    if (explore) {
      event.preventDefault();
      onExplore({
        territoryId: current?.id || null,
        year: Number(explore.dataset.year) || currentYear,
      });
      return;
    }
    const navigate = event.target.closest("[data-tp-territory]");
    if (navigate) {
      event.preventDefault();
      onNavigate(navigate.dataset.tpTerritory, currentYear);
      return;
    }
    const jump = event.target.closest("[data-tp-jump]");
    if (jump) {
      event.preventDefault();
      const section = host.querySelector(`#${prefix}-${jump.dataset.tpJump}`);
      section?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
      const heading = section?.querySelector("h2");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
  }
  host.addEventListener("click", onClick);
  return {
    show(id, { year = 1922 } = {}) {
      if (destroyed) return;
      current = data.get(id);
      currentYear = Number.isFinite(Number(year))
        ? Math.round(Number(year))
        : 1922;
      host.hidden = false;
      render();
    },
    hide() {
      host.hidden = true;
    },
    destroy() {
      destroyed = true;
      host.removeEventListener("click", onClick);
      host.replaceChildren();
    },
  };
}
