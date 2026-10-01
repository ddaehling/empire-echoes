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
  const click = async (id) => {
    const t = await page.evaluate(id=>{const e=document.querySelector(`.map__target[data-unit="${id}"]`); if(!e)return null; const r=e.getBoundingClientRect(); const top=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2); return {cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2), top: top? (top.className+'|'+(top.dataset&&top.dataset.unit||'')) : null, vis: r.y>=0 && r.bottom<=innerHeight};},id);
    if(!t){log(id,'not drawn'); return;}
    await page.mouse.click(t.cx,t.cy); await page.waitForTimeout(800);
    log(id, JSON.stringify(t), '-> sel:', await page.evaluate(()=>window.BEA.store.getState().selectedTerritoryId));
  };
  for (const id of ['gibraltar','malta','barbados','singapore']) await click(id);
  await shot('state');
};
