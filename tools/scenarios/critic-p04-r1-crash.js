/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const bad = [];
  page.on('pageerror', e => bad.push(e.message + ' || ' + (e.stack||'').split('\n').slice(0,4).join(' | ')));
  await page.waitForTimeout(2500);
  const ids = await page.evaluate(() => window.BEA.data.territories.map(t=>t.id));
  const failing = [];
  for (const id of ids) {
    const before = bad.length;
    await page.evaluate((i) => {
      const d = window.BEA.data, store = window.BEA.store, t = d.get(i);
      const spans = t.spans||[];
      const y = spans.length ? Math.round((spans[0].start + (spans[spans.length-1].end || 1997))/2) : 1900;
      store.batch(dis => { dis('setYear', y); dis('select', i); });
    }, id);
    await page.waitForTimeout(12);
    if (bad.length > before) failing.push(id + ' -> ' + bad[bad.length-1].slice(0,220));
  }
  log('FAILING TERRITORIES (' + failing.length + '):\n' + failing.join('\n'));
};
