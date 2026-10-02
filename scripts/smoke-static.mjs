import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
};
const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  let pathname = url.pathname;
  if (pathname.startsWith("/empire-echoes/"))
    pathname = pathname.slice("/empire-echoes".length);
  let file = path.join(root, decodeURIComponent(pathname));
  if (!file.startsWith(`${root}/`)) return response.writeHead(404).end();
  try {
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith("/"))
        return response
          .writeHead(301, { Location: `${url.pathname}/${url.search}` })
          .end();
      file = path.join(file, "index.html");
    }
    const bytes = await readFile(file);
    response
      .writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "text/plain",
      })
      .end(bytes);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

let browser;
try {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
  for (const prefix of ["", "/empire-echoes"]) {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [],
      missing = [],
      external = [],
      teacherRequests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400)
        missing.push(`${response.status()} ${response.url()}`);
    });
    page.on("request", (request) => {
      if (/\/app\/journey\/(?:js\/teacher(?:-content)?\.js|css\/teacher\.css|assets\/teacher-handout\.pdf)$/.test(new URL(request.url()).pathname) &&
          !request.url().includes("/snapshots/"))
        teacherRequests.push(request.url());
      if (
        !request.url().startsWith(origin) &&
        !/^(?:data|blob):/.test(request.url())
      )
        external.push(request.url());
    });
    const go = async (url) => {
      await page.goto(`${origin}${prefix}${url}`);
      await page.locator("html[data-ready=true]").waitFor();
    };
    await go("/#rallye");
    await page.locator("#rallye-view").waitFor({ state: "visible" });
    assert.equal(new URL(page.url()).pathname, `${prefix}/app/journey/`);
    assert.equal(new URL(page.url()).hash, "#rallye");
    await go("/app/journey/#teacher");
    await page.locator("#explore-view").waitFor({ state: "visible" });
    assert.equal(await page.locator('#teacher-view, [data-view="teacher"], a[href="#teacher"]').count(), 0);
    assert.deepEqual(teacherRequests, [], "Student page requested a teacher guide asset");
    await go("/app/journey/#territory?id=british-india&year=1930");
    const photograph = page.locator("#territory-view img").first();
    await photograph.waitFor();
    await photograph.evaluate((image) => image.decode());
    assert(await photograph.evaluate((image) => image.naturalWidth > 0));
    await go("/snapshots/2026-10-01-before-simplification/app/journey/#rallye");
    await page.locator("#rallye-view").waitFor({ state: "visible" });
    const frozenPDF = await page.request.get(
      `${origin}${prefix}/snapshots/2026-10-01-before-simplification/app/journey/assets/teacher-handout.pdf`,
    );
    assert.equal(frozenPDF.status(), 200);
    assert((await frozenPDF.body()).subarray(0, 5).equals(Buffer.from("%PDF-")));
    await go("/app/next/");
    await page.goto(`${origin}${prefix}/app/`);
    await page.waitForLoadState("networkidle");
    await page.goto(`${origin}${prefix}/licenses/`);
    assert(
      await page
        .getByRole("heading", { name: "Sources and licences", exact: true })
        .isVisible(),
    );
    for (const privatePath of [
      "docs/learning-revision/CONTRACT.md",
      "package.json",
      ".env",
      "snapshots/2026-10-01-before-simplification/docs/unit-alignment/SOURCES.md",
      "app/journey/assets/territories/download-metadata.json",
      "app/journey/js/teacher.js",
      "app/journey/js/teacher-content.js",
      "app/journey/css/teacher.css",
      "app/journey/assets/teacher-handout.pdf",
    ]) {
      assert.equal(
        (await page.request.get(`${origin}${prefix}/${privatePath}`)).status(),
        404,
        privatePath,
      );
    }
    assert.deepEqual(errors, [], `Browser errors at ${prefix || "/"}`);
    assert.deepEqual(
      missing,
      [],
      `Missing app dependencies at ${prefix || "/"}`,
    );
    assert.deepEqual(
      external,
      [],
      `Unexpected runtime network at ${prefix || "/"}`,
    );
    console.log(
      `PASS ${prefix || "/"}: root/hash, enquiry, legacy teacher URL fallback, photograph, frozen enquiry and PDF, older apps, licences and current guide exclusions; no browser errors, missing resources or external requests.`,
    );
    await context.close();
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
