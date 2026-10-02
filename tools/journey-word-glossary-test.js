#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const moduleURL = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
let passed = 0;
function check(name, run) {
  run();
  passed++;
  console.log(`PASS ${name}`);
}

(async () => {
  const source = await fs.readFile(path.join(ROOT, "app/journey/js/word-glossary.js"), "utf8");
  const { lookupGlossary } = await import(moduleURL(source));
  function at(context, word, occurrence = 0) {
    let start = -1;
    for (let i = 0; i <= occurrence; i++) start = context.indexOf(word, start + 1);
    assert.ok(start >= 0, `Missing test word: ${word}`);
    return lookupGlossary({ word, context, start, end: start + word.length });
  }
  function term(context, word, expected, occurrence = 0) {
    const help = at(context, word, occurrence);
    assert.equal(help?.term, expected);
    assert.equal(help.context, context);
    assert.equal(help.source, "glossary");
    assert.match(help.inContext, /^Language note:/);
    assert.ok(help.meaning.length > 10);
    assert.equal(help.examples.length, 2);
    assert.ok(help.examples.every((example) => typeof example === "string" && example.length > 10));
    return help;
  }

  check("gain power expands from either word, including changed verb forms", () => {
    for (const phrase of ["gain power", "gains power", "gained power", "gaining power"]) {
      term(`A group can ${phrase} over decisions.`, phrase.split(" ")[0], phrase);
      term(`A group can ${phrase} over decisions.`, "power", phrase);
    }
    term("The council is GAINING POWER.", "GAINING", "GAINING POWER");
  });
  check("the clicked occurrence determines the chunk, not the first matching word", () => {
    const context = "They gain time, then gain power. They gain confidence later.";
    assert.equal(at(context, "gain", 0), null);
    term(context, "gain", "gain power", 1);
    assert.equal(at(context, "gain", 2), null);
    assert.equal(lookupGlossary({ word: "gain", context }), null);
    assert.equal(lookupGlossary({ word: "power", context })?.term, "gain power");
  });
  check("whole chunks, case, whitespace, hyphens and apostrophes retain the selected surface", () => {
    term("They take control of the club.", "take control", "take control");
    term("The region gained Self‑government.", "government", "Self‑government");
    term("Officials investigated ill treatment.", "treatment", "ill treatment");
    term("They discussed the Company’s rule.", "rule", "Company’s rule");
    term("PUBLIC\nMEMORY changes over time.", "MEMORY", "PUBLIC\nMEMORY");
    term("🎓 The council gained power.", "gained", "gained power");
  });
  check("matching respects full word boundaries and valid UTF-16 offsets", () => {
    assert.equal(at("They regained power.", "regained"), null);
    assert.equal(at("Their impowerful plan failed.", "impowerful"), null);
    assert.equal(lookupGlossary({ word: "gain", context: "gained power", start: 0, end: 4 }), null);
    assert.equal(lookupGlossary({ word: "gain", context: "gain power", start: 1, end: 5 }), null);
    assert.equal(lookupGlossary({ word: "gain", context: "gain power", start: 0, end: 999 }), null);
    assert.equal(lookupGlossary({ word: "gain", context: "gain power", start: 0 }), null);
    assert.equal(at("𐐀gain power", "gain"), null);
  });
  check("ambiguous standalone words do not acquire an unsupported historical sense", () => {
    for (const [context, word] of [
      ["Use a ruler to draw this rule.", "rule"],
      ["The battery has enough power.", "power"],
      ["English is my favourite subject.", "subject"],
      ["Do you want to trade seats?", "trade"],
      ["The motor gained power after repair.", "gained"],
      ["We measured the electrical resistance.", "resistance"],
      ["The ant colony grew.", "colony"],
      ["Create a partition on the disk.", "partition"],
      ["How far must we walk?", "far"],
      ["The charter flight was delayed.", "charter"],
      ["The court recorded a conviction.", "conviction"],
    ]) assert.equal(at(context, word), null, context);
    term("The motor stopped. The party gained power.", "gained", "gained power");
    term("They were British subjects.", "subjects", "British subjects");
    term("How far does the evidence support the claim?", "far", "How far");
  });
  check("common collocations expand when their small words are selected", () => {
    term("The ruler ruled over three islands.", "over", "ruled over");
    term("These objects belong to the museum.", "to", "belong to");
    term("They have a claim to the land.", "claim", "claim to");
    term("The change came at the expense of comfort.", "expense", "at the expense of");
    term("The law took effect last week.", "effect", "took effect");
    term("The region had political authority.", "authority", "political authority");
    term("The report gives a qualified judgement.", "judgement", "qualified judgement");
  });
  const { rallye } = await import(moduleURL(await fs.readFile(path.join(ROOT, "app/journey/js/rallye-content.js"), "utf8")));
  const selections = [
    [rallye.stations[0].investigation.prompt, "memory", "public memory"],
    [rallye.stations[1].context, "emancipation", "emancipation"],
    [rallye.stations[2].context, "Crown", "Crown rule", 1],
    [rallye.stations[3].context, "partition", "partition"],
    [rallye.stations[4].context, "subjects", "British subjects"],
    [rallye.stations[5].context, "liability", "liability"],
    [rallye.finalAssessment.investigation.prompt, "contemporary", "contemporary"],
  ];
  check("each of the seven current tasks has relevant authored vocabulary help", () => {
    for (const [context, word, expected, occurrence] of selections) term(context, word, expected, occurrence);
  });
  check("authored glossary stays bounded and results cannot mutate the shared examples", () => {
    const count = (source.match(/^  entry\(/gm) || []).length;
    assert.ok(count >= 50 && count <= 80, `${count} entries is outside the curated scope`);
    const first = term("We discuss public memory.", "public", "public memory");
    first.examples[0] = "changed";
    assert.notEqual(at("We discuss public memory.", "public").examples[0], "changed");
    assert.equal(lookupGlossary(), null);
    assert.equal(lookupGlossary({ word: "", context: "" }), null);
    assert.equal(lookupGlossary({ word: "unknown", context: "unknown" }), null);
  });
  console.log(`\n${passed} word-glossary checks passed.`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
