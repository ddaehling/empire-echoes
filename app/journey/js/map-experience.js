import { diffMapStates, MAP_MILESTONES } from "./map-change-data.js";

const MIN_YEAR = 1600;
const MAX_YEAR = 1997;
const KINDS = ["added", "removed", "changed"];
const LABELS = {
  added: "Newly coloured",
  removed: "No longer coloured",
  changed: "Rule or coverage changed",
};

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = text;
  return element;
}

/** A compact explanation of the map's two endpoint snapshots. Units are never
 * counted as countries, colonies or area: the underlying geometry mixes scales.
 * Returns the exact unit changes so both map renderers can use the same evidence. */
export function createMapExperience(
  host,
  { data, onYear = () => {}, onSelect = () => {} },
) {
  if (!host) throw new Error("The map-change panel needs a host.");
  let currentYear = null;
  let lastDiff = null;
  let destroyed = false;
  let announcementTimer = null;
  let animation = null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const labels = new Map(
    data.statuses.map((status) => [
      status.id,
      status.label || status.id.replaceAll("-", " "),
    ]),
  );
  const roots = node("section", "map-experience");
  roots.setAttribute("aria-label", "Changes on the map");
  const ribbon = node("div", "map-change-ribbon");
  const narrative = node("div", "map-change-narrative");
  const kicker = node("p", "map-change-kicker", "Follow the changing map");
  const heading = node(
    "p",
    "map-change-heading",
    "Every border has a history.",
  );
  const summary = node(
    "p",
    "map-change-summary",
    "Jump to the next change, or choose two years to compare.",
  );
  narrative.append(kicker, heading, summary);
  const jump = node("div", "map-change-jump");
  const jumpLabel = node("span", "map-change-jump-label", "Mapped changes");
  const buttons = node("div", "map-change-jump-buttons");
  const previous = node("button", "map-change-step");
  previous.type = "button";
  previous.innerHTML = '<span aria-hidden="true">←</span><span>Earlier</span>';
  previous.dataset.mapChange = "previous";
  const next = node("button", "map-change-step");
  next.type = "button";
  next.innerHTML = '<span>Later</span><span aria-hidden="true">→</span>';
  next.dataset.mapChange = "next";
  buttons.append(previous, next);
  jump.append(jumpLabel, buttons);
  ribbon.append(narrative, jump);

  const comparison = node("details", "map-change-details");
  const disclosure = node(
    "summary",
    "map-change-disclosure",
    "Inspect the changes",
  );
  const detailBody = node("div", "map-change-detail-body");
  comparison.append(disclosure, detailBody);
  comparison.hidden = true;
  const footnote = node(
    "p",
    "map-change-note",
    "31 December snapshot · approximate modern boundaries",
  );
  const live = node("span", "map-change-sr");
  live.setAttribute("role", "status");
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");
  roots.append(ribbon, comparison, footnote, live);
  host.replaceChildren(roots);

  // Candidate boundaries come from real temporal spans; the diff test filters
  // records changing underneath a stronger overlapping claim. No hand-written
  // milestone sequence pretends to represent every mapped change.
  const candidates = new Set(data.timeline?.().cuts || []);
  for (const territory of data.territories || []) {
    for (const span of territory.spans || []) {
      if (Number.isFinite(span.start)) candidates.add(span.start);
      if (Number.isFinite(span.end)) candidates.add(span.end + 1);
    }
    for (const event of territory.events || [])
      if (Number.isFinite(event.year)) candidates.add(event.year);
  }
  const years = [...candidates]
    .filter(
      (year) => Number.isFinite(year) && year >= MIN_YEAR && year <= MAX_YEAR,
    )
    .sort((a, b) => a - b);
  const changeCache = new Map();
  let previousTarget = null;
  let nextTarget = null;
  function hasChangeAt(year) {
    if (!changeCache.has(year)) {
      const diff = diffMapStates(data, year - 1, year);
      changeCache.set(
        year,
        KINDS.some((kind) => diff[kind]?.length),
      );
    }
    return changeCache.get(year);
  }
  function updateTargets() {
    previousTarget =
      [...years]
        .reverse()
        .find((year) => year < currentYear && hasChangeAt(year)) ?? null;
    nextTarget =
      years.find((year) => year > currentYear && hasChangeAt(year)) ?? null;
    previous.disabled = previousTarget == null;
    next.disabled = nextTarget == null;
    previous.setAttribute(
      "aria-label",
      previousTarget == null
        ? "No earlier mapped change"
        : `Earlier mapped change: ${previousTarget}`,
    );
    next.setAttribute(
      "aria-label",
      nextTarget == null
        ? "No later mapped change"
        : `Later mapped change: ${nextTarget}`,
    );
    previous.title =
      previousTarget == null
        ? "Beginning of this atlas"
        : `Go to ${previousTarget}`;
    next.title =
      nextTarget == null ? "End of this atlas" : `Go to ${nextTarget}`;
  }
  previous.addEventListener("click", () => {
    if (previousTarget != null) onYear(previousTarget);
  });
  next.addEventListener("click", () => {
    if (nextTarget != null) onYear(nextTarget);
  });

  function statusText(status, degree) {
    return (
      labels.get(status) ||
      (status
        ? String(status).replaceAll("-", " ")
        : degree === 0
          ? "Outside British authority"
          : "Not shown under British authority")
    );
  }
  function relevantEvents(diff) {
    const places = new Set(
      KINDS.flatMap((kind) =>
        (diff.groups?.[kind] || []).flatMap((group) => [
          group.territoryId,
          group.fromTerritoryId,
          group.toTerritoryId,
        ]),
      ).filter(Boolean),
    );
    const priority = (event) =>
      (event.changedStatus ? 20 : 0) +
      (["independence", "constitutional", "treaty", "annexation"].includes(
        event.type,
      )
        ? 12
        : 0) +
      ((event.territoryIds || []).some((id) => places.has(id)) ? 25 : 0) -
      Math.abs(diff.toYear - event.year) * 4;
    return [...(diff.events || [])].sort(
      (a, b) =>
        priority(b) - priority(a) ||
        Math.abs(diff.toYear - a.year) - Math.abs(diff.toYear - b.year),
    );
  }
  function describeChange(group) {
    const parts = [];
    if (
      group.fromTerritoryId &&
      group.toTerritoryId &&
      group.fromTerritoryId !== group.toTerritoryId
    )
      parts.push(`${group.fromName} → ${group.toName}`);
    const from = statusText(group.fromStatus, group.fromDegree),
      to = statusText(group.toStatus, group.toDegree);
    if (from !== to) parts.push(`${from} → ${to}`);
    else if (group.fromDegree !== group.toDegree)
      parts.push(`${to} · level of authority changed`);
    if (group.fromPartial !== group.toPartial)
      parts.push(
        group.toPartial
          ? "Full → partial mapped coverage"
          : "Partial → full mapped coverage",
      );
    return parts.join(" · ") || `${to} · administrative record changed`;
  }
  function renderDetails(diff) {
    detailBody.replaceChildren();
    const reading = node(
      "p",
      "map-change-reading",
      `This compares ${diff.fromYear} with ${diff.toYear}. ${diff.toYear < diff.fromYear ? "You are moving backwards in time; “newly coloured” describes what appears on this earlier map." : "A colour change can mean independence, a transfer, occupation or a change in how authority is recorded."}`,
    );
    detailBody.append(reading);
    const milestone = MAP_MILESTONES.find((item) => item.year === diff.toYear);
    if (milestone) {
      const context = node("div", "map-change-milestone");
      context.append(node("p", "", milestone.summary));
      const sourceLine = node("p", "map-change-source-links");
      for (const source of milestone.sources) {
        const link = node("a", "", source.title);
        link.href = source.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        sourceLine.append(link);
      }
      context.append(sourceLine);
      detailBody.append(context);
    }
    const columns = node("div", "map-change-columns");
    for (const kind of KINDS) {
      const seen = new Set();
      const groups = (diff.groups?.[kind] || []).filter((group) => {
        const key = [
          group.territoryId,
          kind === "changed"
            ? describeChange(group)
            : kind === "added"
              ? group.toStatus
              : group.fromStatus,
        ].join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (!groups.length) continue;
      const section = node(
        "section",
        `map-change-group map-change-group--${kind}`,
      );
      section.append(node("h3", "map-change-group-title", LABELS[kind]));
      const list = node("ul", "map-change-list");
      for (const [index, group] of groups.entries()) {
        const row = node("li", "map-change-row");
        if (index >= 5) {
          row.hidden = true;
          row.dataset.moreChange = "";
        }
        const title = node(
          group.territoryId ? "button" : "strong",
          "map-change-place",
          group.name || group.territoryId || "Mapped area",
        );
        if (group.territoryId) {
          title.type = "button";
          title.dataset.mapChangePlace = group.territoryId;
          title.addEventListener("click", () => onSelect(group.territoryId));
        }
        row.append(title);
        if (kind === "changed")
          row.append(node("span", "map-change-status", describeChange(group)));
        else if (kind === "added" && group.toStatus)
          row.append(
            node(
              "span",
              "map-change-status",
              statusText(group.toStatus, group.toDegree),
            ),
          );
        else if (kind === "removed" && group.fromStatus)
          row.append(
            node(
              "span",
              "map-change-status",
              `Previously: ${statusText(group.fromStatus, group.fromDegree)}`,
            ),
          );
        list.append(row);
      }
      section.append(list);
      columns.append(section);
    }
    detailBody.append(columns);
    if (columns.querySelector("[data-more-change]")) {
      const more = node(
        "button",
        "map-change-show-all",
        "Show all named changes",
      );
      more.type = "button";
      more.setAttribute("aria-expanded", "false");
      more.addEventListener("click", () => {
        const expanded = more.getAttribute("aria-expanded") !== "true";
        columns.querySelectorAll("[data-more-change]").forEach((row) => {
          row.hidden = !expanded;
        });
        more.setAttribute("aria-expanded", String(expanded));
        more.textContent = expanded
          ? "Show fewer changes"
          : "Show all named changes";
      });
      detailBody.append(more);
    }
    const events = relevantEvents(diff)
      .slice(0, 4)
      .sort((a, b) => a.year - b.year);
    if (events.length) {
      const context = node("section", "map-change-events");
      context.append(node("h3", "", "Events in this interval"));
      const list = node("ul", "map-change-event-list");
      for (const event of events) {
        const row = node("li");
        row.append(
          node("span", "map-change-event-year", event.year),
          node("span", "", event.title || event.name || "Historical event"),
        );
        list.append(row);
      }
      context.append(list);
      context.append(
        node(
          "p",
          "map-change-event-note",
          "Selected context, not a complete list of causes. Open a territory to examine the evidence.",
        ),
      );
      detailBody.append(context);
    }
    const notes = (diff.notes || []).filter(
      (note) => !note.startsWith("31 December"),
    );
    if (notes.length)
      detailBody.append(node("p", "map-change-caveat", notes.join(" ")));
  }

  function render(diff) {
    const activeKinds = KINDS.filter((kind) => diff?.[kind]?.length);
    const hasChanges = activeKinds.length > 0;
    comparison.hidden = !hasChanges;
    roots.dataset.hasChanges = String(hasChanges);
    if (!diff || diff.fromYear === diff.toYear) {
      kicker.textContent = `At the end of ${currentYear}`;
      heading.textContent =
        MAP_MILESTONES.find((item) => item.year === currentYear)?.title ||
        "Every border has a history.";
      summary.textContent =
        "Move through time to trace changes in British authority.";
    } else {
      kicker.textContent = `${diff.fromYear} → ${diff.toYear} · ${diff.toYear < diff.fromYear ? "Looking back" : "Moving forward"}`;
      const placeNames = KINDS.flatMap((kind) =>
        (diff.groups?.[kind] || []).map((group) => group.name),
      ).filter(Boolean);
      const uniqueNames = [...new Set(placeNames)];
      const milestone = MAP_MILESTONES.find(
        (item) => item.year === currentYear,
      );
      const event = hasChanges ? relevantEvents(diff)[0] : null;
      heading.textContent = hasChanges
        ? milestone
          ? `${milestone.year} · ${milestone.title}`
          : event?.title
            ? `In this interval: ${event.year} · ${event.title}`
            : uniqueNames.length === 1
              ? `A changing relationship: ${uniqueNames[0]}`
              : "Authority shifts. The story continues."
        : "The map holds its shape.";
      summary.replaceChildren();
      if (hasChanges) {
        for (const kind of activeKinds) {
          const label = node(
            "span",
            `map-change-key map-change-key--${kind}`,
            LABELS[kind],
          );
          label.dataset.changeKey = kind;
          summary.append(label);
        }
        renderDetails(diff);
      } else
        summary.textContent =
          "No change in mapped authority between these snapshots. History continues beyond the map.";
    }
    if (!reducedMotion.matches && document.visibilityState !== "hidden") {
      animation?.cancel();
      animation = narrative.animate(
        [
          { transform: "translateY(3px)", opacity: 0.6 },
          { transform: "translateY(0)", opacity: 1 },
        ],
        { duration: 240, easing: "cubic-bezier(.2,0,0,1)" },
      );
    }
    clearTimeout(announcementTimer);
    announcementTimer = setTimeout(() => {
      live.textContent =
        diff && diff.fromYear !== diff.toYear
          ? `${diff.fromYear} to ${diff.toYear}. ${hasChanges ? activeKinds.map((kind) => LABELS[kind]).join("; ") + ". Inspect the changes for named places." : "No change in mapped authority."}`
          : `Map at the end of ${currentYear}.`;
    }, 350);
  }

  function update({ year, previousYear } = {}) {
    if (destroyed) return lastDiff;
    const requestedYear = Number(year);
    if (!Number.isFinite(requestedYear)) return lastDiff;
    const nextYear = Math.max(
      MIN_YEAR,
      Math.min(MAX_YEAR, Math.trunc(requestedYear)),
    );
    if (nextYear === currentYear) return lastDiff;
    const from = Number.isFinite(previousYear)
      ? Math.trunc(previousYear)
      : (currentYear ?? nextYear);
    currentYear = nextYear;
    lastDiff = diffMapStates(data, from, nextYear);
    updateTargets();
    render(lastDiff);
    return lastDiff;
  }
  return {
    update,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearTimeout(announcementTimer);
      animation?.cancel();
      roots.remove();
    },
  };
}
