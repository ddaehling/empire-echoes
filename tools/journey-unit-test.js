#!/usr/bin/env node
"use strict";

// Content contract only. Saved-work and browser behavior are exercised by
// journey-progress-test.js and journey-learning-test.js respectively.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const moduleURL = (source) =>
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
let passes = 0;
async function check(name, run) {
  await run();
  passes++;
  console.log(`PASS ${name}`);
}

const prohibitedKeys =
  /^(?:points|grades?|grading|rubric|score|scores|minWords|maxWords|expectedWords|wordCount|wordGuidance|minSources)$/i;
const prohibitedGuidance =
  /\b(?:rubrics?|grading|grades?|graded|marks? awaiting|teacher[’']s mark|\d+\s+(?:written |practice )?marks?|word[ -]?(?:count|limit|target|guidance)|(?:minimum|maximum|at least|up to|aim for)\s+\d+\s+words?|\d+\s*[–—-]\s*\d+\s+words?)\b/i;
function inspect(value, trail = "content") {
  if (Array.isArray(value))
    return value.forEach((item, i) => inspect(item, `${trail}[${i}]`));
  if (value && typeof value === "object")
    for (const [key, item] of Object.entries(value)) {
      assert.doesNotMatch(
        key,
        prohibitedKeys,
        `${trail}.${key} is obsolete assessment metadata`,
      );
      inspect(item, `${trail}.${key}`);
    }
  else if (typeof value === "string")
    assert.doesNotMatch(
      value,
      prohibitedGuidance,
      `${trail} contains obsolete assessment guidance`,
    );
}
(async () => {
  const source = await fs.readFile(
    path.join(ROOT, "app/journey/js/rallye-content.js"),
    "utf8",
  );
  const { rallye } = await import(moduleURL(source));
  const { RALLYE_RESOURCES } = await import(
    moduleURL(
      await fs.readFile(
        path.join(ROOT, "app/journey/js/rallye-resources.js"),
        "utf8",
      ),
    )
  );
  const stages = [...rallye.stations, rallye.finalAssessment];
  await check(
    "six historical tasks and final contemporary identity comment survive",
    () => {
      assert.equal(stages.length, 7);
      assert.equal(rallye.stations.length, 6);
      assert.equal(new Set(stages.map((s) => s.id)).size, 7);
      assert.equal(rallye.minutes, 45);
      assert.ok(rallye.contentRevision);
      assert.notEqual(rallye.contentRevision, "q2-unit-aligned-v1");
      for (const stage of stages) {
        const task = stage.investigation || stage.question || stage;
        assert.ok(stage.context, `${stage.id} needs historical context`);
        assert.ok(task.prompt, `${stage.id} needs one concrete task`);
        assert.ok(
          task.operator,
          `${stage.id} needs an understandable operation`,
        );
        assert.ok(task.responsePurpose, `${stage.id} needs a purpose`);
      }
      assert.match(stages.at(-1).investigation.prompt, /identit/i);
      assert.match(stages.at(-1).investigation.prompt, /empire|imperial/i);
    },
  );
  await check(
    "current content has no grades, points, rubrics, word guidance or citation quotas",
    () => inspect(rallye),
  );
  await check(
    "prepared sources resolve and distinguish authentic quotations from summaries",
    () => {
      for (const stage of stages) {
        const records = RALLYE_RESOURCES[stage.id] || [];
        const selected = stage.sourceIds?.length
          ? stage.sourceIds.map((id) => records.find((s) => s.id === id))
          : records;
        assert.ok(selected.length, `${stage.id} has evidence`);
        assert.ok(
          selected.every(Boolean),
          `${stage.id} has no broken source IDs`,
        );
        for (const source of selected) {
          assert.ok(
            source.title && source.summary,
            `${stage.id} source is usable offline`,
          );
          assert.match(
            source.url || "",
            /^https?:\/\//,
            `${stage.id} has source attribution`,
          );
          if (source.excerpt)
            assert.equal(
              typeof source.excerpt,
              "string",
              `${stage.id} preserves authentic source text`,
            );
        }
      }
      const wording = stages.filter((s) =>
        /analyse.*word|word.*analys/i.test(s.investigation.operator),
      );
      assert.equal(wording.length, 2);
      for (const stage of wording)
        assert.ok(
          (RALLYE_RESOURCES[stage.id] || []).some((s) => s.excerpt),
          `${stage.id} needs authentic language to analyse`,
        );
    },
  );
  console.log(`\n${passes} current learning-content checks passed.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
