import { teacherGuide } from "./teacher-content.js";

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
const list = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);
const paragraphs = (items) =>
  list(typeof items === "string" ? [items] : items)
    .map((text) => `<p>${esc(text)}</p>`)
    .join("");
const bulletList = (items) =>
  list(items).length
    ? `<ul>${list(items)
        .map((text) => `<li>${esc(text)}</li>`)
        .join("")}</ul>`
    : "";
const safeURL = (value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};
const sources = (items, documentMode = false) =>
  list(items).length
    ? `<ul class="tg-sources">${list(items)
        .map((source) => {
          const url = safeURL(source.url);
          return `<li>${url ? `<a href="${esc(url)}"${documentMode ? "" : ' target="_blank" rel="noopener noreferrer"'}>${esc(source.label || source.title || url)}${documentMode ? "" : '<span aria-hidden="true"> ↗</span>'}</a><span class="tg-source-url">${esc(url)}</span>` : esc(source.label || source.title)}${source.note ? `<p>${esc(source.note)}</p>` : ""}</li>`;
        })
        .join("")}</ul>`
    : "";
const topic = (
  title,
  body,
  { id = "", open = false, documentMode = false, subtitle = "" } = {},
) =>
  documentMode
    ? `<section class="tg-topic"${id ? ` id="${esc(id)}"` : ""}><div class="tg-topic-heading"><h3>${esc(title)}</h3>${subtitle ? `<p class="tg-meta">${esc(subtitle)}</p>` : ""}</div>${body}</section>`
    : `<details class="tg-topic"${id ? ` id="${esc(id)}"` : ""}${open ? " open" : ""}><summary><span role="heading" aria-level="3">${esc(title)}${subtitle ? `<small>${esc(subtitle)}</small>` : ""}</span><span class="tg-disclosure" aria-hidden="true">+</span></summary><div class="tg-topic-body">${body}</div></details>`;
const subsection = (title, content, level = 4) =>
  content
    ? `<div class="tg-subsection"><h${level} class="tg-subheading">${esc(title)}</h${level}>${content}</div>`
    : "";
function routeMarkup(guide, documentMode) {
  return `<ol class="tg-route">${list(guide.route)
    .map(
      (step) =>
        `<li><div class="tg-route-time">${Number(step.minutes) || ""}<span> min</span></div><div>${documentMode ? `<strong>${esc(step.title)}</strong>` : `<button type="button" data-tg-jump="tg-${esc(step.id)}">${esc(step.title)}<span aria-hidden="true"> ↗</span></button>`}${step.focus ? `<p>${esc(step.focus)}</p>` : ""}</div></li>`,
    )
    .join("")}</ol>`;
}

function stationMarkup(station, index, documentMode) {
  const map = station.map;
  const mapLabel = map ? `Explore ${station.mapLabel || station.title} in ${map.year}` : "";
  const mapAction = map
    ? documentMode
      ? `<p class="tg-map-reference">Map reference: ${esc(map.territoryId || "world map")}, ${esc(map.year)}.</p>`
      : `<button class="tg-map-link" type="button" data-tg-map="${index}">${esc(mapLabel)} <span aria-hidden="true">↗</span></button>`
    : "";
  const body = `${subsection("The student scenario", paragraphs(station.context))}
    ${station.prompt ? `<div class="tg-question"><h4>Student task</h4><p>${esc(station.prompt)}</p>${station.operator || station.product ? `<p class="tg-meta">${esc([station.operator, station.product].filter(Boolean).join(" · "))}</p>` : ""}${bulletList(station.requirements)}</div>` : ""}${mapAction}
    ${subsection("One possible response", paragraphs(station.answer))}
    ${subsection("Notes for the conversation", paragraphs(station.teachingNote))}
    ${subsection("Evidence to draw on", sources(station.evidence, documentMode))}
    ${subsection("Other possible interpretations", bulletList(station.alternatives))}
    ${subsection("Misconceptions to discuss", bulletList(station.misconceptions))}
    ${subsection("Use in discussion", bulletList(station.discussion))}`;
  return topic(`${index + 1}. ${station.title}`, body, {
    id: `tg-${station.id}`,
    documentMode,
    subtitle: station.minutes ? `${station.minutes} minutes · flexible planning guide` : "",
  });
}

function guideBody(guide, documentMode = false) {
  const final = guide.finalAssessment || {};
  return `<section class="tg-section" id="tg-preparation"><h2 tabindex="-1">Before you begin</h2>${paragraphs(guide.overview)}${guide.overviewNote ? `<p class="tg-note">${esc(guide.overviewNote)}</p>` : ""}${subsection("What students are working towards", bulletList(guide.learningGoals), 3)}${subsection("Set up the lesson", bulletList(guide.preparation), 3)}</section>
    <section class="tg-section" id="tg-unit"><h2 tabindex="-1">Place in the Q2 English unit</h2>${paragraphs(guide.unitAlignment)}${subsection("One 60-minute lesson", bulletList(guide.lessonIntegration), 3)}${subsection("Transfer to the class materials", bulletList(guide.materialConnections), 3)}${subsection("English language and feedback", bulletList(guide.languageFeedback), 3)}</section>
    <section class="tg-section" id="tg-route"><h2 tabindex="-1">The 45-minute route</h2><p class="tg-section-intro">Allow time for the final written judgement. Students can revisit the atlas and their sources throughout.</p>${routeMarkup(guide, documentMode)}</section>
    <section class="tg-section" id="tg-background"><h2 tabindex="-1">Background for the conversation</h2><p class="tg-section-intro">Read these notes before the lesson; use the examples and prompts to support the conversation.</p>${list(
      guide.background,
    )
      .map((section) =>
        topic(
          section.title,
          paragraphs(section.paragraphs) +
            sources(section.evidence, documentMode),
          { documentMode },
        ),
      )
      .join(
        "",
      )}${list(guide.misconceptions).length ? topic("Common misconceptions", bulletList(guide.misconceptions), { documentMode }) : ""}</section>
    <section class="tg-section" id="tg-stations"><h2 tabindex="-1">Station discussion notes</h2><p class="tg-section-intro">These examples open up possible lines of reasoning. Invite students to compare them with their own ideas and explore different conclusions.</p>${list(
      guide.stations,
    )
      .map((station, index) => stationMarkup(station, index, documentMode))
      .join("")}</section>
    <section class="tg-section" id="tg-final"><h2 tabindex="-1">The final comment</h2>${final.title ? `<h3>${esc(final.title)}</h3>` : ""}${final.minutes ? `<p class="tg-meta">${final.minutes} minutes · flexible planning guide</p>` : ""}${subsection("The student scenario", paragraphs(final.context))}${final.prompt ? `<div class="tg-question"><h4>Student task</h4><p>${esc(final.prompt)}</p>${final.operator || final.product ? `<p class="tg-meta">${esc([final.operator, final.product].filter(Boolean).join(" · "))}</p>` : ""}${bulletList(final.requirements)}</div>` : ""}${subsection("One possible synthesis", paragraphs(final.answer))}${subsection("Notes for the conversation", paragraphs(final.teachingNote))}${subsection("Other possible judgements", bulletList(final.alternatives))}${subsection("Misconceptions to discuss", bulletList(final.misconceptions))}${subsection("Use in discussion", bulletList(final.discussion))}${subsection("Optional supportive feedback", bulletList(final.feedback))}${subsection("Supporting evidence", sources(final.evidence, documentMode))}</section>
    <section class="tg-section" id="tg-discussion"><h2 tabindex="-1">Bring the class back together</h2>${bulletList(guide.discussion)}${subsection("Support without supplying the answer", bulletList(guide.differentiatedPrompts?.support), 3)}${subsection("Extend the enquiry", bulletList(guide.differentiatedPrompts?.extension), 3)}</section>
    <section class="tg-section" id="tg-reading"><h2 tabindex="-1">Sources & further reading</h2>${subsection(
      "Essential pre-reading",
      sources(
        list(guide.furtherReading).filter(
          (source) => source.level === "essential",
        ),
        documentMode,
      ),
      3,
    )}${subsection(
      "Extend your reading",
      sources(
        list(guide.furtherReading).filter(
          (source) => source.level !== "essential",
        ),
        documentMode,
      ),
      3,
    )}${subsection("Source directory", sources(guide.sources, documentMode), 3)}</section>`;
}

const documentCSS = `
*{box-sizing:border-box}html{color:#202332;background:#fff}body{font:16px/1.6 Arial,Helvetica,sans-serif;max-width:850px;margin:0 auto;padding:52px 44px}h1,h2,h3{font-family:Georgia,serif;font-weight:normal;line-height:1.2;color:#18233b;letter-spacing:-.02em}h1{font-size:40px;margin:10px 0 18px}h2{font-size:28px;margin:0 0 20px}h3{font-size:22px;margin:24px 0 14px}h4,.tg-subheading{font:600 16px/1.4 Arial,Helvetica,sans-serif;margin:22px 0 8px}p{margin:0 0 14px;orphans:3;widows:3;overflow-wrap:anywhere}li{margin:0 0 8px}a{color:#b44421;text-decoration:underline;overflow-wrap:anywhere}header{border-bottom:2px solid #b44421;padding-bottom:28px;margin-bottom:30px}.tg-document-label{font-size:14px;color:#474e61}.tg-section{margin:0 0 38px;padding-top:24px;border-top:1px solid #c8cdd8}.tg-section:first-child{border-top:0}.tg-section-intro,.tg-meta{color:#474e61}.tg-meta{font-size:14px}.tg-note,.tg-question{padding:18px;background:#fae8df;margin:20px 0}.tg-question h4{margin-top:0}.tg-question p:last-child{margin-bottom:0}.tg-topic{margin-top:30px}.tg-route{padding:0;list-style:none}.tg-route li{display:flex;gap:20px;padding:14px 0;border-bottom:1px solid #d5d9e1}.tg-route-time{width:55px;flex-shrink:0;font-weight:bold}.tg-route-time span{font-size:13px;font-weight:normal}.tg-route p{margin:4px 0 0}.tg-sources{padding-left:20px}.tg-sources li{margin-bottom:14px}.tg-sources p{font-size:14px;margin:3px 0}.tg-source-url{display:block;font-size:11px;line-height:1.4;overflow-wrap:anywhere;color:#474e61;margin:4px 0 6px}.tg-map-reference{font-size:14px;color:#474e61}.tg-document-footer{font-size:12px;border-top:1px solid #c8cdd8;padding-top:18px}button{display:none}@page{size:A4;margin:17mm 18mm 18mm}@media print{body{padding:0;max-width:none;font-size:10pt;line-height:1.45}h1{font-size:25pt}h2{font-size:18pt}h3{font-size:15pt}h4,.tg-subheading{font-size:10.5pt;margin:16px 0 6px}h2,h3,h4{break-after:avoid-page}.tg-topic-heading{break-inside:avoid;break-after:avoid-page}#tg-route{break-inside:avoid-page}p,li{orphans:3;widows:3}.tg-section{margin-bottom:22pt;padding-top:16pt}.tg-topic{margin-top:20pt}.tg-question,.tg-route li,.tg-sources li{break-inside:avoid}.tg-source-url{font-size:8pt}.tg-section-intro,.tg-meta,.tg-map-reference{font-size:9pt}#tg-stations,#tg-final{break-before:page}.tg-note,.tg-question{-webkit-print-color-adjust:exact;print-color-adjust:exact}a{color:#202332}.tg-document-footer{font-size:8pt}}@media(max-width:600px){body{padding:28px 20px}h1{font-size:32px}}
`;

/** A complete standalone handout: no JavaScript, login or network needed to read it. */
export function renderTeacherDocument(guide = teacherGuide) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(guide.title || "Empire / Echoes — Teacher guide")}</title><style>${documentCSS}</style></head><body><header><p class="tg-document-label">Empire / Echoes · Teacher guide · 45-minute enquiry</p><h1>${esc(guide.title || "Teacher guide")}</h1>${guide.subtitle ? `<p>${esc(guide.subtitle)}</p>` : ""}<p>This handout includes the complete background, station discussion notes and optional support for the final comment. Examples illustrate possible reasoning. Students may develop a different view and revise their work throughout.</p></header>${guideBody(guide, true)}<footer class="tg-document-footer">Empire / Echoes · Teacher handout · A learning enquiry: read, discuss, write and revise.</footer></body></html>`;
}

export function teacherGuideText(guide = teacherGuide) {
  const output = [];
  const add = (...values) =>
    values
      .flat(Infinity)
      .filter(Boolean)
      .forEach((value) => output.push(String(value)));
  const heading = (title) =>
    add("\n" + title.toUpperCase(), "-".repeat(Math.min(title.length, 68)));
  const addSources = (items) =>
    list(items).forEach((source) =>
      add(
        source.label || source.title,
        safeURL(source.url),
        source.level ? `Reading level: ${source.level}` : "",
        source.note,
      ),
    );
  heading(guide.title || "Empire / Echoes — Teacher guide");
  add(guide.subtitle, "Teacher handout · 45-minute enquiry");
  heading("Before you begin");
  add(guide.overview, guide.overviewNote);
  heading("Learning goals");
  add(guide.learningGoals);
  heading("Preparation");
  add(guide.preparation);
  heading("Place in the Q2 English unit");
  add(guide.unitAlignment);
  heading("One 60-minute lesson");
  add(guide.lessonIntegration);
  heading("Transfer to the class materials");
  add(guide.materialConnections);
  heading("English language and feedback");
  add(guide.languageFeedback);
  heading("The 45-minute route");
  list(guide.route).forEach((step) =>
    add(`${step.minutes} minutes — ${step.title}`, step.focus),
  );
  heading("Background for the conversation");
  list(guide.background).forEach((section) => {
    heading(section.title);
    add(section.paragraphs);
    addSources(section.evidence);
  });
  heading("Common misconceptions");
  add(guide.misconceptions);
  heading("Station discussion notes");
  list(guide.stations).forEach((station, index) => {
    heading(`${index + 1}. ${station.title}`);
    add(
      `${station.minutes} minutes`,
      station.context,
      station.operator,
      station.product,
      "Student task:",
      station.prompt,
      station.requirements,
    );
    if (station.map)
      add(
        `Map reference: ${station.map.territoryId || "world map"}, ${station.map.year}.`,
      );
    add("One possible response:", station.answer, "Notes for the conversation:", station.teachingNote);
    heading("Evidence");
    addSources(station.evidence);
    if (list(station.alternatives).length) {
      heading("Other possible interpretations");
      add(station.alternatives);
    }
    if (list(station.misconceptions).length) {
      heading("Misconceptions to discuss");
      add(station.misconceptions);
    }
    if (list(station.discussion).length) {
      heading("Discussion");
      add(station.discussion);
    }
  });
  const final = guide.finalAssessment || {};
  heading("The final comment");
  add(
    final.title,
    final.minutes && `${final.minutes} minutes`,
    final.context,
    final.operator,
    final.product,
    "Student task:",
    final.prompt,
    final.requirements,
    "One possible synthesis:",
    final.answer,
    "Notes for the conversation:",
    final.teachingNote,
  );
  heading("Other possible judgements");
  add(final.alternatives);
  heading("Misconceptions to discuss");
  add(final.misconceptions);
  heading("Use in discussion");
  add(final.discussion);
  heading("Optional supportive feedback");
  add(final.feedback);
  addSources(final.evidence);
  heading("Bring the class back together");
  add(guide.discussion);
  heading("Support without supplying the answer");
  add(guide.differentiatedPrompts?.support);
  heading("Extend the enquiry");
  add(guide.differentiatedPrompts?.extension);
  heading("Sources and further reading");
  addSources(guide.sources);
  addSources(guide.furtherReading);
  add("\nA learning enquiry: read, discuss, write and revise.");
  return output.join("\n\n") + "\n";
}

export function createTeacher(host, { data, onExplore } = {}) {
  let destroyed = false;
  let printState = null;
  let statusTimer = null;
  let downloadTimer = null;
  let downloadURL = null;
  const headings = [
    ["preparation", "Before you begin"],
    ["unit", "Q2 English & lesson plan"],
    ["route", "45-minute route"],
    ["background", "Background notes"],
    ["stations", "Station discussion notes"],
    ["final", "Final comment"],
    ["discussion", "Class discussion"],
    ["reading", "Sources & reading"],
  ];
  host.classList.add("teacher-guide");
  host.innerHTML = `<div class="tg-header"><div><p class="tg-label">Teacher guide</p><h1 data-tg-heading tabindex="-1">${esc(teacherGuide.title || "Before the lesson.")}</h1><p class="tg-deck">${esc(teacherGuide.subtitle || "The context, evidence and questions behind the journey.")}</p></div><div class="tg-actions"><button type="button" class="tg-button tg-button-primary" data-tg-action="print">Print handout <span aria-hidden="true">↗</span></button><a class="tg-button" href="assets/teacher-handout.pdf" download="empire-echoes-teacher-handout.pdf">Download PDF</a><button type="button" class="tg-button tg-button-quiet" data-tg-download="html">HTML</button><button type="button" class="tg-button tg-button-quiet" data-tg-download="txt">Plain text</button></div></div>
    <p class="tg-export-note">Print the complete guide, or keep a copy to read offline. Background notes, discussion examples and optional support are included.</p>
    <div class="tg-layout"><aside class="tg-contents" aria-label="Teacher guide contents"><p>In this handout</p><nav aria-label="Jump to teacher guide section">${headings.map(([id, label]) => `<button type="button" data-tg-jump="tg-${id}">${label}</button>`).join("")}</nav><button class="tg-expand" type="button" data-tg-action="expand" aria-expanded="false">Expand all notes <span aria-hidden="true">+</span></button><p class="tg-reader-note">Use the examples to explore evidence and reasoning together; students may revise their ideas throughout.</p></aside><article class="tg-reading">${guideBody(teacherGuide)}</article></div><p class="tg-status" role="status" aria-live="polite"></p>`;

  const notify = (message) => {
    const status = host.querySelector(".tg-status");
    status.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      if (!destroyed) status.textContent = "";
    }, 5000);
  };
  const details = () => [...host.querySelectorAll("details.tg-topic")];
  const syncExpand = () => {
    const allOpen = details().every((detail) => detail.open);
    const button = host.querySelector('[data-tg-action="expand"]');
    button.setAttribute("aria-expanded", String(allOpen));
    button.innerHTML = `${allOpen ? "Collapse" : "Expand"} all notes <span aria-hidden="true">${allOpen ? "−" : "+"}</span>`;
  };
  const beforePrint = () => {
    if (destroyed || host.hidden || !host.getClientRects().length) return;
    if (!printState) printState = details().map((detail) => detail.open);
    details().forEach((detail) => {
      detail.open = true;
    });
    if (!host.querySelector(".tg-print-document")) {
      const printDocument = document.createElement("div");
      printDocument.className = "tg-print-document";
      printDocument.innerHTML = `<div class="tg-header"><div><p class="tg-label">Empire / Echoes · Teacher guide</p><h1>${esc(teacherGuide.title)}</h1><p class="tg-deck">${esc(teacherGuide.subtitle)}</p></div></div><article class="tg-reading">${guideBody(teacherGuide, true)}</article>`;
      host.append(printDocument);
    }
    document.body.classList.add("printing-teacher-guide");
  };
  const afterPrint = () => {
    if (printState)
      details().forEach((detail, index) => {
        detail.open = printState[index];
      });
    printState = null;
    host.querySelector(".tg-print-document")?.remove();
    document.body.classList.remove("printing-teacher-guide");
    if (!destroyed) syncExpand();
  };
  const download = (format) => {
    if (downloadURL) URL.revokeObjectURL(downloadURL);
    clearTimeout(downloadTimer);
    const html = format === "html";
    const blob = new Blob(
      [html ? renderTeacherDocument() : teacherGuideText()],
      { type: html ? "text/html;charset=utf-8" : "text/plain;charset=utf-8" },
    );
    downloadURL = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadURL;
    anchor.download = `empire-echoes-teacher-guide.${html ? "html" : "txt"}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    downloadTimer = setTimeout(() => {
      if (downloadURL) URL.revokeObjectURL(downloadURL);
      downloadURL = null;
    }, 1000);
    notify(
      `${html ? "HTML handout" : "Plain-text handout"} prepared for download.`,
    );
  };
  const click = (event) => {
    const button = event.target.closest("button");
    if (!button || !host.contains(button)) return;
    if (button.dataset.tgJump) {
      const target =
        host.querySelector(`#${CSS.escape(button.dataset.tgJump)}`) ||
        host.querySelector("#tg-final");
      if (target.matches("details")) target.open = true;
      const focusTarget = target.matches("details")
        ? target.querySelector("summary")
        : target.querySelector("h2,h3");
      focusTarget?.focus({ preventScroll: true });
      target.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    } else if (button.dataset.tgMap !== undefined) {
      const station = teacherGuide.stations[Number(button.dataset.tgMap)];
      if (station?.map)
        onExplore?.({
          year: station.map.year,
          territoryId: station.map.territoryId,
        });
    } else if (button.dataset.tgDownload) download(button.dataset.tgDownload);
    else if (button.dataset.tgAction === "expand") {
      const open = !details().every((detail) => detail.open);
      details().forEach((detail) => {
        detail.open = open;
      });
      syncExpand();
    } else if (button.dataset.tgAction === "print") window.print();
  };
  host.addEventListener("click", click);
  host.addEventListener("toggle", syncExpand, true);
  window.addEventListener("beforeprint", beforePrint);
  window.addEventListener("afterprint", afterPrint);
  return {
    show() {
      if (!destroyed) host.hidden = false;
    },
    hide() {
      if (!destroyed) host.hidden = true;
    },
    destroy() {
      destroyed = true;
      afterPrint();
      clearTimeout(statusTimer);
      clearTimeout(downloadTimer);
      if (downloadURL) URL.revokeObjectURL(downloadURL);
      host.removeEventListener("click", click);
      host.removeEventListener("toggle", syncExpand, true);
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
      host.innerHTML = "";
      host.classList.remove("teacher-guide");
    },
  };
}
