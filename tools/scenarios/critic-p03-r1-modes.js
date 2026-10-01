/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const FIX = () => { const s=document.createElement('style'); s.textContent='.dsr__prose,.dsr__name{font-size:1rem !important;line-height:1.35 !important}'; document.head.append(s); };
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate(FIX);
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(700);
  const b = await page.evaluate(() => { const e=document.querySelector('.tl'); if(!e) return null; const r=e.getBoundingClientRect(); return {top:Math.round(r.top),h:Math.round(r.height),w:Math.round(r.width)}; });
  log('tl box', JSON.stringify(b));
  await shot('tl', '.tl');
  log('tl text', await page.evaluate(() => document.querySelector('.tl').innerText.replace(/\n+/g,' | ')));
  // reduced motion: does play step?
  const y0 = await page.evaluate(() => window.BEA.store.getState().year);
  await page.click('.tl-btn--play');
  await page.waitForTimeout(1500);
  log('after clicking play: year', await page.evaluate(() => window.BEA.store.getState().year), 'from', y0, 'playing', await page.evaluate(() => window.BEA.store.getState().playing));
  await shot('after-play', '.tl');
};
