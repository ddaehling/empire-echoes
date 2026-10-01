/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1000);
  log(await page.evaluate(() => {
    const t = document.querySelector('.tl'); const cs = getComputedStyle(t);
    const r = s => { const e = document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); const c=getComputedStyle(e); return {y:Math.round(b.y),h:Math.round(b.height),pos:c.position,ov:c.overflow,mh:c.maxHeight,bs:c.blockSize}; };
    return JSON.stringify({rows:cs.gridTemplateRows, tl:r('.tl'), deck:r('.tl__deck'), changes:r('.tl__changes'), track:r('.tl__track'), row:r('.tl__changerow'), body:r('.tl__body'), ax:r('.tl-ax'), card:r('.tl-chg')}, null, 1);
  }));
};
