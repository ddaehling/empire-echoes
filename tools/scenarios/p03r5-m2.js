/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  log(JSON.stringify(await page.evaluate(() => {
    const R = (sel) => { const n=document.querySelector(sel); if(!n) return null; const r=n.getBoundingClientRect(); return [Math.round(r.top),Math.round(r.bottom),Math.round(r.height)]; };
    return { track:R('.tl__track'), chg0:R('.tl-chg'), head:R('.tl__changehead'), rhead:R('.tl-rate__head'),
      strack:R('.tl-spine__track'), sfoot:R('.tl-spine__foot'), scap:R('.tl-spine__caption'), sseen:R('.tl-spine__seen'),
      marks:R('.tl-ax__marks'), axis:R('.tl-ax__axis') };
  })));
};
