#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const moduleURL = (source) =>
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const stamp = "2026-10-01T12:00:00.000Z";
let passes = 0;
async function check(name, run) {
  await run();
  passes += 1;
  console.log(`PASS ${name}`);
}

(async () => {
  const dir = path.join(ROOT, "app/journey/js");
  const files = await Promise.all(
    [
      "rallye-content.js",
      "rallye-legacy-prompts.js",
      "rallye-q2-prompts.js",
      "rallye-state.js",
    ].map((file) => fs.readFile(path.join(dir, file), "utf8")),
  );
  const [contentSource, legacySource, q2Source, stateSource] = files;
  const { rallye } = await import(moduleURL(contentSource));
  const stages = [...rallye.stations, rallye.finalAssessment];
  const engineSource = stateSource
    .replace('"./rallye-content.js"', JSON.stringify(moduleURL(contentSource)))
    .replace(
      '"./rallye-legacy-prompts.js"',
      JSON.stringify(moduleURL(legacySource)),
    )
    .replace('"./rallye-q2-prompts.js"', JSON.stringify(moduleURL(q2Source)));
  const engine = await import(moduleURL(engineSource));
  const { LEGACY_PROMPT_SNAPSHOT } = await import(moduleURL(legacySource));
  const { Q2_CONTENT_REVISION, Q2_PROMPT_SNAPSHOT } = await import(
    moduleURL(q2Source)
  );
  const legacy = {
    version: 3,
    rallyeId: rallye.id,
    student: { name: "Earlier learner", className: "Q2" },
    answers: {
      [stages[0].id]: "This answer belongs to the original question.",
      "removed-old-task": "Do not discard this answer.",
    },
    notebooks: {
      [stages[0].id]: {
        note: "Original notes",
        citations: [
          { title: "Original source", url: "https://example.org/original" },
        ],
      },
    },
    checkpoints: { "removed-old-task": "original-selection" },
    submittedAt: stamp,
    updatedAt: stamp,
    startedAt: stamp,
    currentIndex: 3,
    originalUnknownMetadata: { preserved: true },
  };

  await check(
    "current and historical storage identities are different; helper never writes storage",
    () => {
      assert.equal(engine.RALLYE_STORAGE_KEY, "empire-echoes-enquiry-v4");
      assert.equal(engine.LEGACY_STORAGE_KEY, "empire-echoes-rallye-v3");
      assert.equal(engine.VERSION, 4);
      assert.notEqual(rallye.contentRevision, Q2_CONTENT_REVISION);
      assert.doesNotMatch(stateSource, /localStorage\.|sessionStorage\./);
      const state = engine.emptyState();
      assert.deepEqual(state.answers, {});
      assert.deepEqual(state.completedStages, {});
      assert.equal(state.contentRevision, rallye.contentRevision);
    },
  );

  await check(
    "q2 recovery questions exactly match the frozen snapshot engine's prompt format",
    async () => {
      const frozenSource = await fs.readFile(
        path.join(
          ROOT,
          "snapshots/2026-10-01-before-simplification/app/journey/js/rallye-content.js",
        ),
        "utf8",
      );
      const { rallye: frozen } = await import(moduleURL(frozenSource));
      const array = (value) =>
        Array.isArray(value) ? value : value ? [value] : [];
      const expected = [...frozen.stations, frozen.finalAssessment].map(
        (stage) => {
          const task = stage.investigation || stage.question || stage;
          return {
            id: stage.id,
            title: stage.title,
            prompt: task.prompt,
            operator: task.operator || "",
            responsePurpose: task.responsePurpose || "",
            expectedWords: task.expectedWords || "",
            instructions: array(task.instructions),
            minWords: task.minWords,
            maxWords: task.maxWords,
            minSources: Number(task.minSources || stage.minSources || 0),
            points: task.points,
            rubric: array(task.rubric),
          };
        },
      );
      assert.equal(Q2_CONTENT_REVISION, frozen.contentRevision);
      assert.deepEqual(Q2_PROMPT_SNAPSHOT, expected);
    },
  );

  await check(
    "legacy v3 answers stay separate with original identities and prompts",
    () => {
      const before = JSON.stringify(legacy);
      const state = engine.recoverSavedState(null, legacy, {
        archivedAt: stamp,
      });
      assert.equal(JSON.stringify(legacy), before);
      assert.deepEqual(state.answers, {});
      assert.deepEqual(state.notebooks, {});
      assert.deepEqual(state.completedStages, {});
      assert.equal(state.startedAt, null);
      assert.equal(state.finishedAt, null);
      assert.equal(state.student.name, legacy.student.name);
      assert.equal(state.previousAttempts.length, 1);
      const entry = state.previousAttempts[0];
      assert.equal(entry.contentRevision, "legacy-v1");
      assert.equal(entry.sourceStorageKey, engine.LEGACY_STORAGE_KEY);
      assert.deepEqual(entry.promptSnapshot, LEGACY_PROMPT_SNAPSHOT);
      assert.deepEqual(entry.attempt, legacy);
      entry.attempt.answers[stages[0].id] = "Mutate only the detached copy";
      assert.equal(JSON.stringify(legacy), before);
    },
  );

  await check(
    "q2 without a saved question snapshot recovers the actual q2 questions",
    () => {
      const saved = { ...legacy, contentRevision: Q2_CONTENT_REVISION };
      const state = engine.recoverSavedState(null, saved, {
        archivedAt: stamp,
      });
      assert.deepEqual(
        state.previousAttempts[0].promptSnapshot,
        Q2_PROMPT_SNAPSHOT,
      );
      assert.notDeepEqual(Q2_PROMPT_SNAPSHOT, LEGACY_PROMPT_SNAPSHOT);
      assert.deepEqual(state.previousAttempts[0].attempt, saved);
      assert.deepEqual(state.answers, {});
    },
  );

  await check(
    "saved original prompts take precedence; unknown revisions never borrow current questions",
    () => {
      const promptSnapshot = [
        {
          id: "old",
          title: "Original",
          prompt: "The exact saved question.",
          custom: "retained",
        },
      ];
      const saved = {
        ...legacy,
        contentRevision: "unknown-version",
        promptSnapshot,
      };
      const preserved = engine.preserveEarlierAttempt(saved, {
        archivedAt: stamp,
      });
      assert.deepEqual(preserved.promptSnapshot, promptSnapshot);
      const unknown = engine.preserveEarlierAttempt({
        ...legacy,
        contentRevision: "unknown-version",
      });
      assert.deepEqual(unknown.promptSnapshot, []);
      assert.match(
        engine.recoveredAttemptText(unknown),
        /Original question: Unavailable/,
      );
      const unrelated = engine.preserveEarlierAttempt({
        ...legacy,
        rallyeId: "another-activity",
      });
      assert.equal(unrelated.contentRevision, "unknown");
      assert.deepEqual(unrelated.promptSnapshot, []);
    },
  );

  await check(
    "inherited previous attempts and the full original record survive migration",
    () => {
      const earlier = engine.preserveEarlierAttempt(legacy, {
        archivedAt: stamp,
      });
      const saved = {
        ...legacy,
        contentRevision: Q2_CONTENT_REVISION,
        previousAttempts: [earlier],
      };
      const before = JSON.stringify(saved);
      const state = engine.recoverSavedState(null, saved, {
        archivedAt: stamp,
      });
      assert.equal(state.previousAttempts.length, 2);
      assert.deepEqual(state.previousAttempts[0], earlier);
      assert.deepEqual(state.previousAttempts[1].attempt, saved);
      assert.equal(JSON.stringify(saved), before);
      assert.equal(engine.normaliseSaved(state).previousAttempts.length, 2);
    },
  );

  await check(
    "current saved work wins on reload without repeatedly importing historical work",
    () => {
      const state = engine.recoverSavedState(null, legacy, {
        archivedAt: stamp,
      });
      state.answers[stages[1].id] = "Current response";
      state.startedAt = stamp;
      state.finishedAt = stamp;
      const resumed = engine.recoverSavedState(state, legacy);
      assert.equal(resumed.answers[stages[1].id], "Current response");
      assert.equal(resumed.previousAttempts.length, 1);
      assert.equal(resumed.finishedAt, stamp);
      assert.equal(resumed.student.name, state.student.name);
    },
  );

  await check(
    "current revision changes start fresh and preserve the preceding attempt",
    () => {
      const state = engine.emptyState();
      state.contentRevision = "a-different-revision";
      state.answers[stages[0].id] = "Belongs to a different question.";
      state.completedStages[stages[0].id] = true;
      const migrated = engine.normaliseSaved(state, { archivedAt: stamp });
      assert.deepEqual(migrated.answers, {});
      assert.deepEqual(migrated.completedStages, {});
      assert.deepEqual(
        migrated.previousAttempts[0].promptSnapshot,
        state.promptSnapshot,
      );
      assert.deepEqual(migrated.previousAttempts[0].attempt, state);
    },
  );


  await check(
    "published v4 work retains its exact old prompts and downloadable answers after the analysis revision",
    () => {
      // Captured from the published ungraded content before its prompts changed.
      // Keep this fixture literal: deriving it from current content would conceal relabelling.
      const saved = {
        "version": 4,
        "rallyeId": "empire-echoes-rallye-v1",
        "contentRevision": "ungraded-2026-10-01",
        "promptSnapshot": [
          {
            "id": "profit-and-power",
            "title": "When trade becomes rule",
            "prompt": "Explain how the East India Company gained more power in Bengal between 1600 and 1765. Use the source to connect its new right to collect taxes with its ability to govern.",
            "operator": "Explain",
            "responsePurpose": "Your explanation",
            "instructions": []
          },
          {
            "id": "freedom-and-memory",
            "title": "Who made freedom happen?",
            "prompt": "A museum label says: “Britain gave enslaved people their freedom.” Rewrite the label for visitors your age. Show that enslaved people resisted slavery, and use one detail from the sources about how slavery ended.",
            "operator": "Rewrite",
            "responsePurpose": "Your museum label",
            "instructions": [
              "Write the replacement label itself. You can choose a detail about abolition, compulsory apprenticeship or compensation."
            ]
          },
          {
            "id": "rule-and-resistance",
            "title": "One colour, unequal power",
            "prompt": "Choose a word or phrase from Queen Victoria’s proclamation and quote it in your response. Explain what image of British rule it creates and why the Queen might want to create that image after the uprising. What would you need to find out before deciding whether the promise matched people’s lives?",
            "operator": "Analyse wording",
            "responsePurpose": "Your reading of the proclamation",
            "instructions": []
          },
          {
            "id": "departure-and-division",
            "title": "Independence is more than a border",
            "prompt": "Describe the political change in 1947: name the two new independent countries and say whose rule ended. Then use one detail from the source to show how people’s homes or concerns about their future were affected in the period around partition.",
            "operator": "Outline",
            "responsePurpose": "Your account of the change",
            "instructions": [
              "Keep the timing of your example clear. The letter was written in 1946, and the family testimony recalls displacement before partition."
            ]
          },
          {
            "id": "migration-and-belonging",
            "title": "Who gets to belong?",
            "prompt": "Use a detail from the Windrush sources to explain how someone could have a legal right to live in Britain yet be treated as if they did not belong. Connect this example to Britain’s colonial relationship with the Caribbean.",
            "operator": "Explain",
            "responsePurpose": "Your explanation of belonging",
            "instructions": []
          },
          {
            "id": "remembering-empire",
            "title": "When does an empire end?",
            "prompt": "Compare the words expressing regret with the words denying legal responsibility in the 2013 Kenya statement. Explain what the government acknowledges and what it refuses to accept. Then explain why this statement shows that the consequences of colonial rule continued after Kenya became independent.",
            "operator": "Analyse wording",
            "responsePurpose": "Your reading of the statement",
            "instructions": [
              "Use a word or phrase from the quotation to explain your reading."
            ]
          },
          {
            "id": "whose-britain",
            "title": "The past inside the present",
            "prompt": "Write a comment for your school magazine answering: “How far does Britain’s imperial past help explain British identities today?” Choose two cases from your journey and explain how each helps you understand belonging, public memory or ideas about Britain today. Give your view, and discuss another influence on identity or something your sources cannot tell you.",
            "operator": "Comment",
            "responsePurpose": "Your school-magazine comment",
            "instructions": [
              "Refer to the source or person when you use their evidence, so readers can follow your thinking."
            ]
          }
        ],
        "previousAttempts": [],
        "student": {
          "name": "Returning learner",
          "className": "Q2"
        },
        "answers": {
          "departure-and-division": "India and Pakistan became independent when British rule ended. The letter shows uncertainty about the future."
        },
        "notebooks": {
          "departure-and-division": {
            "note": "My note about the 1946 letter.",
            "citations": [
              {
                "title": "Letter source",
                "url": "https://example.org/partition-letter"
              }
            ]
          }
        },
        "completedStages": {
          "departure-and-division": true
        },
        "startedAt": "2026-10-01T12:00:00.000Z",
        "finishedAt": "2026-10-01T12:00:00.000Z",
        "updatedAt": "2026-10-01T12:00:00.000Z",
        "currentIndex": 3
      };
      const before = JSON.stringify(saved);
      assert.notEqual(saved.contentRevision, engine.RALLYE_CONTENT_REVISION);
      const oldPartition = saved.promptSnapshot.find(
        (stage) => stage.id === "departure-and-division",
      );
      const newPartition = engine.promptSnapshot().find(
        (stage) => stage.id === "departure-and-division",
      );
      assert.notEqual(oldPartition.prompt, newPartition.prompt);
      const migrated = engine.recoverSavedState(saved, legacy, {
        archivedAt: stamp,
      });
      assert.equal(JSON.stringify(saved), before, "Migration does not mutate the saved record");
      assert.deepEqual(migrated.student, saved.student);
      assert.deepEqual(migrated.answers, {});
      assert.deepEqual(migrated.notebooks, {});
      assert.deepEqual(migrated.completedStages, {});
      assert.equal(migrated.startedAt, null);
      assert.equal(migrated.finishedAt, null);
      assert.equal(migrated.previousAttempts.length, 1);
      const archived = migrated.previousAttempts[0];
      assert.deepEqual(archived.promptSnapshot, saved.promptSnapshot);
      assert.deepEqual(archived.attempt, saved);
      const recovered = engine.recoveredStages(archived).find(
        (stage) => stage.id === "departure-and-division",
      );
      assert.deepEqual(recovered.original, oldPartition);
      assert.equal(recovered.response, saved.answers[oldPartition.id]);
      const recoveryDownload = engine.recoveredAttemptText(archived);
      for (const stage of saved.promptSnapshot) {
        assert.ok(recoveryDownload.includes(stage.prompt));
        for (const instruction of stage.instructions)
          assert.ok(recoveryDownload.includes(instruction));
      }
      assert.ok(recoveryDownload.includes(saved.answers[oldPartition.id]));
      assert.ok(recoveryDownload.includes(saved.notebooks[oldPartition.id].note));
      assert.ok(recoveryDownload.includes(saved.notebooks[oldPartition.id].citations[0].url));
      assert.ok(!recoveryDownload.includes(newPartition.prompt));
      migrated.answers[oldPartition.id] = "My separate answer to the revised task.";
      const resumed = engine.recoverSavedState(
        JSON.parse(JSON.stringify(migrated)),
        legacy,
      );
      assert.equal(resumed.previousAttempts.length, 1, "Reload does not duplicate the archive");
      assert.deepEqual(resumed.previousAttempts[0], archived);
      assert.equal(resumed.answers[oldPartition.id], migrated.answers[oldPartition.id]);
      assert.deepEqual(JSON.parse(JSON.stringify(archived)).attempt, saved);
    },
  );

  await check(
    "the previously published analysis revision keeps all seven original prompts, responses and notes",
    async () => {
      const fixture = JSON.parse(await fs.readFile(path.join(ROOT, "tools/qa/fixtures/enquiry-analysis-v4.json"), "utf8"));
      const saved = fixture.notebook;
      assert.equal(saved.contentRevision, "enquiry-analysis-2026-10-01");
      assert.equal(saved.promptSnapshot.length, 7);
      const before = JSON.stringify(saved);
      const recovered = engine.recoverSavedState(saved, null, { archivedAt: stamp });
      assert.equal(JSON.stringify(saved), before);
      assert.deepEqual(recovered.answers, {});
      assert.deepEqual(recovered.notebooks, {});
      assert.deepEqual(recovered.completedStages, {});
      assert.equal(recovered.previousAttempts.length, 1);
      const archive = recovered.previousAttempts[0];
      assert.deepEqual(archive.attempt, saved);
      assert.deepEqual(archive.promptSnapshot, saved.promptSnapshot);
      const text = engine.recoveredAttemptText(archive);
      for (const prompt of saved.promptSnapshot) {
        assert.ok(text.includes(prompt.prompt), `${prompt.id} retains its exact published question`);
        assert.ok(text.includes(saved.answers[prompt.id]));
        assert.ok(text.includes(saved.notebooks[prompt.id].note));
        assert.notEqual(prompt.prompt, engine.promptSnapshot().find((item) => item.id === prompt.id).prompt);
      }
      assert.deepEqual(engine.normaliseSaved(recovered).previousAttempts, recovered.previousAttempts);
    },
  );

  await check(
    "empty, short and lengthy answers have no completion, name or source gate",
    () => {
      const state = engine.emptyState();
      for (const response of ["", " ", "Yes.", "evidence ".repeat(10000)]) {
        for (const stage of stages)
          assert.equal(engine.validateStage(stage, response, {}), "");
        state.answers[stages[0].id] = response;
        assert.deepEqual(engine.validateRallye(state), []);
      }
      assert.match(engine.responseNotice(""), /keep exploring/);
      assert.equal(engine.responseNotice("A thought"), "");
    },
  );

  await check(
    "completion is a reversible learner choice, independent of response or final status",
    () => {
      const original = engine.emptyState();
      original.answers[stages[0].id] = "I wrote something.";
      assert.equal(engine.progressFor(original).completed, 0);
      const marked = engine.markStageDone(original, stages[1].id);
      assert.equal(engine.progressFor(marked).completed, 1);
      assert.equal(marked.answers[stages[1].id], undefined);
      assert.deepEqual(original.completedStages, {});
      marked.finishedAt = stamp;
      const unmarked = engine.markStageDone(marked, stages[1].id, false);
      assert.equal(engine.progressFor(unmarked).completed, 0);
      unmarked.answers[stages[0].id] = "Still editable after finishing.";
      assert.equal(
        engine.normaliseSaved(unmarked).answers[stages[0].id],
        "Still editable after finishing.",
      );
      assert.equal(engine.markStageDone(original, "unknown-task"), original);
    },
  );

  await check("current work resumes without answer or note truncation", () => {
    const state = engine.emptyState();
    state.answers[stages[0].id] = "Unabridged answer. ".repeat(2000);
    state.notebooks[stages[0].id] = {
      note: "Unabridged notes. ".repeat(2000),
      citations: [],
    };
    state.finishedAt = stamp;
    const resumed = engine.normaliseSaved(state);
    assert.equal(resumed.answers[stages[0].id], state.answers[stages[0].id]);
    assert.equal(
      resumed.notebooks[stages[0].id].note,
      state.notebooks[stages[0].id].note,
    );
    assert.equal(resumed.finishedAt, stamp);
  });

  await check(
    "current prompt and progress shapes contain no assessment or length metadata",
    () => {
      const banned =
        /^(points|rubric|minWords|maxWords|expectedWords|wordCount|grades|score|earned|possible|pendingMarks|maxObjective|minSources)$/;
      const visit = (value) => {
        if (!value || typeof value !== "object") return;
        for (const [key, item] of Object.entries(value)) {
          assert.doesNotMatch(key, banned);
          visit(item);
        }
      };
      visit(engine.emptyState());
      visit(engine.progressFor(engine.emptyState()));
      assert.equal(engine.wordCount, undefined);
      assert.equal(engine.gradeRallye, undefined);
    },
  );

  await check(
    "recovery includes unknown old tasks, source addresses and original notes",
    () => {
      const preserved = engine.preserveEarlierAttempt(legacy);
      const text = engine.recoveredAttemptText(preserved);
      assert.match(text, /Do not discard this answer/);
      assert.match(text, /original-selection/);
      assert.match(text, /Original notes/);
      assert.match(text, /https:\/\/example.org\/original/);
      assert.ok(text.includes(LEGACY_PROMPT_SNAPSHOT[0].prompt));
      assert.ok(
        engine
          .recoveredStages(preserved)
          .some((stage) => stage.id === "removed-old-task"),
      );
    },
  );

  await check(
    "optional references reject unsafe links without changing answer completion",
    () => {
      const references = {
        citations: [
          { title: "Good", url: "https://example.org/source" },
          { title: "Duplicate", url: "https://example.org/source" },
          { title: "Unsafe", url: "javascript:alert(1)" },
          { title: "", url: "https://example.org/untitled" },
        ],
      };
      assert.equal(engine.validCitations(references).length, 1);
      assert.equal(engine.validateStage(stages[0], "", references), "");
      assert.equal(engine.safeURL("javascript:alert(1)"), "");
    },
  );

  console.log(`\n${passes} ungraded state and migration checks passed.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
