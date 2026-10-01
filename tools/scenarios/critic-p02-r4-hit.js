/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const units = ['gibraltar','malta','bh-bahrain','bahrain','barbados','sg-singapore','singapore','hk-hong-kong-island','ascension','aden'];
  const list = await page.evaluate(()=>[...document.querySelectorAll('.map__target')].map(t=>t.dataset.unit));
  log('has:', JSON.stringify(units.map(u=>[u,list.includes(u)])));
  const targets = await page.evaluate(()=> {
    const want = ['gibraltar','malta','barbados','ascension'];
    return [...document.querySelectorAll('.map__target')].filter(t=>want.some(w=>t.dataset.unit.includes(w))).map(t=>{const r=t.getBoundingClientRect();return{id:t.dataset.unit,cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2)};});
  });
  log('T:', JSON.stringify(targets));
  for (const t of targets) {
    await page.mouse.move(t.cx, t.cy); await page.waitForTimeout(500);
    const tip = await page.evaluate(()=>{const e=document.querySelector('.map__tip, .maptip, [class*="tip"]'); return e? e.innerText.slice(0,120).replace(/\n/g,' | '):null;});
    const hov = await page.evaluate(()=>window.BEA.store.getState().hoveredUnitId);
    log('hover', t.id, '=> hovered:', hov, '| tip:', tip);
  }
};
