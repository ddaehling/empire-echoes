/**
 * lib/verdict.js — THIS PROJECT'S FAILURE CONVENTION, IN ONE PLACE.
 *
 * GUARANTEE THIS FILE PROTECTS: a scenario cannot go green by declining to
 * throw, and the two runners that decide that cannot drift apart.
 *
 * WHY IT EXISTS. Twenty-six of the forty-two scenarios in the acceptance suite
 * print `FAIL` rows and return normally. `tools/acceptance.js` was written
 * around it — it reads a check's OUTPUT for the convention below rather than
 * trusting its exit code — but `tools/inspect.js` still exited 0, so a critic
 * reproducing a finding standalone, or an agent running one file in a loop, got
 * a zero exit and a page full of FAIL. Both runners now import this.
 *
 * THE CONVENTION. A line beginning `FAIL`, a line ending `-> FAIL`, a
 * `>>> … BROKEN` / `FAILED` / `FAILURES` / `VIOLATED`, or an `ERROR` line from
 * one of the node checkers.
 */
'use strict';

const FAIL_LINE = /(^|\n)\s*FAIL\b|->\s*FAIL\s*$|>>>[^\n]*\b(BROKEN|FAILED|FAILURES|VIOLATED)\b|(^|\n)ERROR\s|(^|\n)FAIL —/;

/** The named failure lines in some output, for a summary. */
function reasons(out) {
  const bad = [];
  for (const line of String(out).split('\n')) {
    const s = line.trim();
    if (!s) continue;
    if (/^FAIL\b/.test(s) || /->\s*FAIL$/.test(s) || /^ERROR\b/.test(s) || /^FAIL —/.test(s)
        || /^>>>.*\b(BROKEN|FAILED|FAILURES|VIOLATED)\b/.test(s) || /^!! SCENARIO ERROR/.test(s)) {
      bad.push(s.slice(0, 220));
    }
  }
  return [...new Set(bad)];
}

module.exports = { FAIL_LINE, reasons };
