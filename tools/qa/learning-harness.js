"use strict";
const fs = require("node:fs/promises");
const path = require("node:path");
const http = require("node:http");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "../..");
const prohibitedKeys =
  /^(?:points|grades?|grading|rubrics?|scores?|minWords|maxWords|expectedWords|wordCount|wordGuidance|minSources)$/i;
const prohibitedGuidance =
  /\b(?:rubrics?|grading|grades?|graded|marks? awaiting|teacher[’']s mark|\d+\s+(?:written |practice )?marks?|word[ -]?(?:count|limit|target|guidance)|(?:minimum|maximum|at least|up to|aim for)\s+\d+\s+words?|\d+\s*[–—-]\s*\d+\s+words?)\b/i;
function noAssessment(value, label = "current learning work") {
  if (Array.isArray(value))
    return value.forEach((item, i) => noAssessment(item, `${label}[${i}]`));
  if (value && typeof value === "object")
    for (const [key, item] of Object.entries(value)) {
      assert.doesNotMatch(key, prohibitedKeys, `${label}.${key}`);
      noAssessment(item, `${label}.${key}`);
    }
  else if (typeof value === "string")
    assert.doesNotMatch(value, prohibitedGuidance, label);
}
async function startServer() {
  const types = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".geojson": "application/json",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
  };
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      if (pathname === "/favicon.ico") return response.writeHead(204).end();
      let filename = path.resolve(ROOT, `.${pathname}`);
      if (!filename.startsWith(ROOT + path.sep))
        return response.writeHead(403).end();
      if ((await fs.stat(filename)).isDirectory())
        filename = path.join(filename, "index.html");
      response
        .writeHead(200, {
          "content-type":
            types[path.extname(filename)] || "application/octet-stream",
          "cache-control": "no-store",
        })
        .end(await fs.readFile(filename));
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}
async function ready(page, url) {
  await page.goto(url);
  await page.locator("html[data-ready=true]").waitFor({ timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
}
async function download(page, selector) {
  const button = page.locator(`${selector}:not([hidden])`).first();
  await button.evaluate((node) => {
    let parent = node.parentElement;
    while (parent) {
      if (parent.tagName === "DETAILS") parent.open = true;
      parent = parent.parentElement;
    }
  });
  const pending = page.waitForEvent("download");
  await button.click();
  return fs.readFile(await (await pending).path(), "utf8");
}
// Teacher material remains an editable local artifact; never fetch it through
// the student page just to exercise its document export.
async function localTeacherDocument() {
  const moduleURL = (source) =>
    `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  const source = (file) => fs.readFile(path.join(ROOT, "app/journey/js", file), "utf8");
  const rallyeURL = moduleURL(await source("rallye-content.js"));
  const contentURL = moduleURL((await source("teacher-content.js")).replace('"./rallye-content.js"', JSON.stringify(rallyeURL)));
  const documentURL = moduleURL((await source("teacher.js")).replace('"./teacher-content.js"', JSON.stringify(contentURL)));
  const { renderTeacherDocument, teacherGuideText } = await import(documentURL);
  return { html: renderTeacherDocument(), text: teacherGuideText() };
}
module.exports = {
  ROOT,
  noAssessment,
  prohibitedGuidance,
  startServer,
  ready,
  download,
  localTeacherDocument,
};
