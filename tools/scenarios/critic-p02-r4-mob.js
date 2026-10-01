/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — touchscreen.tap: hasTouch must be enabled on the browser context before using the touchscr.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await shot('mob-boot');
  const g = await page.evaluate(()=>{const m=document.querySelector('.map').getBoundingClientRect(); return {w:Math.round(m.width),h:Math.round(m.height),vh:innerHeight};});
  log('MAP:', JSON.stringify(g));
  // tap a tiny unit
  const t = await page.evaluate(()=>{const e=document.querySelector('.map__target[data-unit="gibraltar"]'); if(!e) return null; const r=e.getBoundingClientRect(); return {cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2),w:Math.round(r.width)};});
  log('gib target:', JSON.stringify(t));
  if (t) { await page.touchscreen.tap(t.cx,t.cy); await page.waitForTimeout(1200); await shot('mob-tap'); log('sel:', await page.evaluate(()=>window.BEA.store.getState().selectedTerritoryId)); }
  await shot('mob-after');
};
