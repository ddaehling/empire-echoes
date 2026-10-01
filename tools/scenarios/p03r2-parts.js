/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && document.querySelector('.tl'), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  log(JSON.stringify(await page.evaluate(async () => {
    const out = {};
    const h = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().height) : 0; };
    for (const y of [1600, 1820, 1858, 1948]) {
      window.BEA.store.dispatch('setYear', y);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      out[y] = { tl: h('.tl'), deck: h('.tl__deck'), now: h('.tl__now'), changes: h('.tl__changes'), head: h('.tl__changehead'), track: h('.tl__track'), spine: h('.tl-spine'), cap: h('.tl-spine__caption'), warn: h('.tl__warn') };
    }
    return out;
  })));
};
