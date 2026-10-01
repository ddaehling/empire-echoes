/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  const g = await page.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return {t: Math.round(b.top), h: Math.round(b.height)}; };
    return { vw: innerWidth, vh: innerHeight, docH: document.documentElement.scrollHeight, stage: r('#stage'), tl: r('.tl'), spine: r('.tl-spine, [class*="spine"]') };
  });
  log('GEOM:', JSON.stringify(g));
  await shot('small');
  log('TL TEXT:', (await page.evaluate(() => document.querySelector('.tl')?.innerText || '')).slice(0, 1600));
};
