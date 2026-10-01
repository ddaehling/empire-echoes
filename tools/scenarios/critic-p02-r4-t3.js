/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',1913)); await page.waitForTimeout(900);
  const ids=['gibraltar','malta','ascension','barbados','aden','singapore','hong-kong-island','hk-hong-kong-island'];
  for (const id of ids) {
    const t = await page.evaluate(id=>{const e=document.querySelector(`.map__target[data-unit="${id}"]`); if(!e)return null; const r=e.getBoundingClientRect(); return {cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2),w:Math.round(r.width),h:Math.round(r.height),tab:e.tabIndex, aria:e.getAttribute('aria-label')};},id);
    if(!t){ log(id,'NOT DRAWN'); continue; }
    await page.mouse.click(t.cx,t.cy); await page.waitForTimeout(700);
    const sel = await page.evaluate(()=>window.BEA.store.getState().selectedTerritoryId);
    log(id, 'box', t.w+'x'+t.h, '-> selected:', sel, '| aria:', (t.aria||'').slice(0,70));
  }
  // projection preserves selection & colour
  const before = await page.evaluate(()=>window.BEA.store.getState().selectedTerritoryId);
  await page.keyboard.press('p'); await page.waitForTimeout(2500);
  log('sel before/after P:', before, await page.evaluate(()=>window.BEA.store.getState().selectedTerritoryId));
  await shot('t3-1000');
};
