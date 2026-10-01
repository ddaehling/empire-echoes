/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Does the panel settle in the same place on identical loads? */
module.exports = async ({ page, log }) => {
  for (let i = 0; i < 4; i++) {
    if (i) { await page.reload({ waitUntil: 'load' }); }
    await page.waitForTimeout(2600);
    const a = await page.evaluate(() => {
      const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect();
        return [Math.round(b.y), Math.round(b.height)]; };
      return { key: r('.stage__legend'), keyInner: r('.legend'), byline: r('#legend-byline'),
        mode: document.querySelector('.stage__legend').dataset.mode, stage: document.querySelector('.app__stage').clientHeight };
    });
    await page.waitForTimeout(2500);
    const b = await page.evaluate(() => {
      const r = (s) => { const e = document.querySelector(s); if (!e) return null; const bb = e.getBoundingClientRect();
        return [Math.round(bb.y), Math.round(bb.height)]; };
      return { key: r('.stage__legend'), keyInner: r('.legend'), mode: document.querySelector('.stage__legend').dataset.mode,
        stage: document.querySelector('.app__stage').clientHeight };
    });
    log('load', i, 'at2.6s', JSON.stringify(a), 'at5.1s', JSON.stringify(b));
  }
};
