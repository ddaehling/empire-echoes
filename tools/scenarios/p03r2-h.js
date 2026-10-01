/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'dispatch').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && document.querySelector('.tl'), null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1948));
  await page.waitForTimeout(250);
  log(JSON.stringify(await page.evaluate(() => {
    const h = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().height) : null; };
    return { tl: h('.tl'), deck: h('.tl__deck'), body: h('.tl__body'), changes: h('.tl__changes'), track: h('.tl__track'),
      card: h('.tl-chg'), ax: h('.tl-ax'), spine: h('.tl-spine'), spineTrack: h('.tl-spine__track'), foot: h('.tl-spine__foot'), cap: h('.tl-spine__caption') };
  })));
};
