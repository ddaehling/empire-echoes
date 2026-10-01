/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p10r3-table — DIDACTIC_SPEC §4 coverage, as one table, read out of the
 * RUNNING app: for each of the eighteen, where it is activated, what
 * disconfirming evidence the student is shown, and what replacement model is
 * stated. Every string is read back from the resolved bank in the browser, so
 * an item the dataset stopped supporting reports as absent, not as covered.
 */
const fs = require('fs');
const path = require('path');
const M18 = Array.from({ length: 18 }, (_, i) => 'M' + (i + 1));
const ROOT = path.resolve(__dirname, '..', '..');

function otherSurfaces() {
  const hits = new Map(M18.map((m) => [m, new Set()]));
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) { walk(f); continue; }
      if (!/\.(js|json)$/.test(e.name)) continue;
      const rel = path.relative(path.join(ROOT, 'app', 'js'), f);
      if (rel.split(path.sep)[0] === 'quiz') continue;
      const text = fs.readFileSync(f, 'utf8');
      for (const m of M18) if (new RegExp('["\'‘“]' + m + '["\'’”]').test(text)) hits.get(m).add(rel);
    }
  };
  walk(path.join(ROOT, 'app', 'js'));
  return hits;
}

const clip = (s, n) => {
  const t = String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : t.slice(0, n - 1).replace(/[ ,;:]+$/, '') + '…';
};

module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(900);
  const rows = await page.evaluate(() => window.BEA.quiz.misconceptions());
  const dropped = await page.evaluate(() => window.BEA.quiz.dropped());
  const elsewhere = otherSurfaces();

  log('DIDACTIC_SPEC §4 — ALL EIGHTEEN, AS THE RUNNING APP HOLDS THEM');
  log('dropped for want of data: ' + (dropped.length ? dropped.join('; ') : 'none'));
  log('');
  for (const r of rows) {
    const primaries = r.items.filter((i) => i.primary);
    const also = r.items.filter((i) => !i.primary);
    log('─'.repeat(112));
    log(r.id + (r.sympathetic ? '  [§4: a SYMPATHETIC oversimplification]' : '') + '   “' + r.belief + '”');
    log('   §4 owner: ' + r.owner);
    const el2 = [...(elsewhere.get(r.id) || [])];
    log('   tagged elsewhere in the app: ' + (el2.length ? el2.join(', ') : 'nowhere else'));
    if (!r.covered) { log('   *** NO TREATMENT ***'); continue; }
    for (const it of r.items) {
      log('   ' + (it.primary ? '● own treatment' : '○ also repairs it') + '  ' + it.id
        + '  [' + it.kind + ', ' + it.t + ', ' + it.lo + ', minute ' + it.minutes
        + ', ' + (it.reachable ? 'a route retrieval can host it' : 'off the route') + ']');
      log('      ACTIVATED BY   ' + clip(it.activation, 150));
      log('      EVIDENCE       ' + clip(it.evidence, 190));
      log('      REPLACEMENT    ' + clip(it.replacement, 190));
    }
    if (!primaries.length) log('   (no item of its own — carried only as a side effect of ' + also.length + ' other item(s))');
  }
  log('─'.repeat(112));
  const uncovered = rows.filter((r) => !r.covered).map((r) => r.id);
  const noPrimary = rows.filter((r) => r.covered && !r.items.some((i) => i.primary)).map((r) => r.id);
  const noEvidence = rows.filter((r) => r.covered && r.items.every((i) => !i.evidence)).map((r) => r.id);
  const noModel = rows.filter((r) => r.covered && r.items.every((i) => !i.replacement)).map((r) => r.id);
  log('');
  log('THE SAME TABLE, ONE ROW PER MISCONCEPTION');
  for (const r of rows) {
    const own = r.items.find((i) => i.primary && i.reachable) || r.items.find((i) => i.primary) || r.items[0];
    if (!own) { log(r.id + ' | — | NO TREATMENT | — | —'); continue; }
    log([
      r.id + (r.sympathetic ? '*' : ''),
      own.id + ' (' + own.kind + ', ' + own.t + (own.reachable ? ', on the route' : ', off the route') + ')',
      clip(own.activation, 96),
      clip(own.evidence, 96),
      clip(own.replacement, 96),
    ].join('  ||  '));
  }
  log('');
  log('covered: ' + (18 - uncovered.length) + '/18   without a treatment of their own: ' + (noPrimary.join(', ') || 'none'));
  log('without disconfirming evidence: ' + (noEvidence.join(', ') || 'none') + '   without a replacement model: ' + (noModel.join(', ') || 'none'));
};
