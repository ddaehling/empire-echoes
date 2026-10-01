#!/usr/bin/env node
"use strict";
// Exercise the real browser data loader against an isolated local server.
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");

(async () => {
  const port = Number(process.env.PORT) || 8897;
  const base = process.env.BASE_URL || `http://127.0.0.1:${port}`;
  let server, browser;
  try {
    if (!process.env.BASE_URL) {
      server = spawn(process.execPath, [path.join(__dirname, "serve.js")], {
        env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
        stdio: ["ignore", "pipe", "pipe"],
      });
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Test server startup timeout")),
          10000,
        );
        server.stdout.on("data", (bytes) => {
          if (String(bytes).includes("Classroom atlas:")) {
            clearTimeout(timeout);
            resolve();
          }
        });
        server.on("error", reject);
        server.on("exit", (code) =>
          reject(new Error(`Test server exited: ${code}`)),
        );
      });
    }
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`${base}/app/js/core/data.js`);
    const findings = await page.evaluate(async () => {
      const { loadData } = await import("/app/js/core/data.js");
      const { createYearEndData, diffMapStates } =
        await import("/app/journey/js/map-change-data.js");
      const raw = await loadData();
      const data = createYearEndData(raw);
      const failures = [],
        passed = [];
      const check = (title, condition, detail = "") => {
        (condition ? passed : failures).push(
          `${title}${detail ? ": " + detail : ""}`,
        );
      };
      for (const [id, year] of [
        ["british-india", 1947],
        ["kenya", 1963],
        ["hong-kong", 1997],
      ]) {
        check(
          `${id} is controlled before departure`,
          data.territoryAt(id, year - 1).controlled,
        );
        check(
          `${id} is not controlled at departure year end`,
          !data.territoryAt(id, year).controlled,
        );
        check(
          `${id} original data unchanged`,
          raw.territoryAt(id, year).controlled,
        );
      }
      check(
        "all final-period India units lose British authority by end1947",
        data
          .unitsOf("british-india", 1946)
          .every((id) => !data.statusAt(1947).get(id)?.controlled),
      );
      check(
        "HongKong threeunits clear in1997",
        data
          .unitsOf("hong-kong")
          .every((id) => !data.statusAt(1997).get(id)?.controlled),
      );
      check(
        "Kenya unit clears in1963",
        !data.statusAt(1963).get("kenya")?.controlled,
      );
      check(
        "Scotland absent fromhomestate in1600",
        !data.statusAt(1600).get("gb-scotland")?.controlled,
      );
      check(
        "Scotland joins home state in1707",
        data.statusAt(1707).get("gb-scotland")?.territoryId === "great-britain",
      );
      const canada = data.territoryAt("canada", 1867);
      check(
        "Canada1867 parentrecord survives retiring colonialchildren",
        canada.controlled &&
          canada.units.every((id) => data.statusAt(1867).get(id)?.controlled),
      );
      const transfer = diffMapStates(data, 1857, 1858);
      check(
        "India1858 internal transfer retains Bengal authority",
        data.statusAt(1858).get("in-west-bengal")?.controlled,
      );
      check(
        "India1858 transfer is changed, not removed",
        !transfer.removed.includes("in-west-bengal") &&
          transfer.changed.includes("in-west-bengal"),
      );
      const hk = diffMapStates(data, 1996, 1997);
      check(
        "HongKong1997 departure produces three unique removed units",
        data.unitsOf("hong-kong").every((id) => hk.removed.includes(id)),
      );
      check(
        "HongKong1997 event available beside visualchange",
        hk.events.some((event) => event.territoryIds.includes("hong-kong")),
      );
      const forward = diffMapStates(data, 1922, 1947),
        back = diffMapStates(data, 1947, 1922);
      check(
        "Backward travel reverses additions/removals",
        forward.added.length === back.removed.length &&
          forward.removed.length === back.added.length &&
          forward.added.every((id) => back.removed.includes(id)),
      );
      check(
        "Overlapping records never duplicate units",
        [forward.added, forward.removed, forward.changed].every(
          (ids) => ids.length === new Set(ids).size,
        ),
      );
      check(
        "Changed units exclude added/removed",
        forward.changed.every(
          (id) => !forward.added.includes(id) && !forward.removed.includes(id),
        ),
      );
      check(
        "Same year has no differences or events",
        (() => {
          const d = diffMapStates(data, 1947, 1947);
          return (
            !d.added.length &&
            !d.removed.length &&
            !d.changed.length &&
            !d.events.length
          );
        })(),
      );
      check(
        "Adapter cached and idempotent",
        createYearEndData(raw) === data && createYearEndData(data) === data,
      );
      check(
        "World snapshots cached",
        data.statusAt(1922) === data.statusAt(1922),
      );
      const fixture = await loadData({
        territories: [
          {
            id: "uncertain",
            name: "Uncertain",
            statusPeriods: [
              {
                from: { value: "1800", precision: "circa" },
                to: { value: "1820", precision: "range", end: "1830" },
                status: "crown-colony",
                controlDegree: 5,
              },
            ],
            geoCoverage: [
              {
                from: { value: "1800", precision: "circa" },
                units: ["jamaica"],
              },
            ],
          },
        ],
      });
      const uncertain = createYearEndData(fixture);
      check(
        "Uncertain end range retained to stated latest endpoint",
        uncertain.territoryAt("uncertain", 1825).controlled &&
          !uncertain.territoryAt("uncertain", 1830).controlled,
      );
      check(
        "Uncertainty flags retained",
        uncertain.statusAt(1825).get("jamaica").circa &&
          uncertain.statusAt(1825).get("jamaica").span.circaEnd,
      );
      return {
        passed,
        failures,
        summary: {
          rawCounts: raw.meta.counts,
          yearEndSpanCount: data.spans.length,
          changes1922to1947: {
            added: forward.added.length,
            removed: forward.removed.length,
            changed: forward.changed.length,
          },
          kenya1962: data.territoryAt("kenya", 1962),
          kenya1963: data.territoryAt("kenya", 1963),
        },
      };
    });
    findings.passed.forEach((title) => console.log(`PASS ${title}`));
    findings.failures.forEach((title) => console.error(`FAIL ${title}`));
    console.log(
      `${findings.passed.length} passed; ${findings.failures.length} failed`,
    );
    assert.deepEqual(findings.failures, []);
  } finally {
    await browser?.close();
    server?.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
