/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const tip = async (id) => {
    const t = await page.evaluate(id=>{const e=document.querySelector(`.map__target[data-unit="${id}"]`); if(!e) return null; const r=e.getBoundingClientRect(); return {cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2)};}, id);
    if(!t) return '(not drawn)';
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(500);
    return await page.evaluate(()=>{const e=[...document.querySelectorAll('div')].find(x=>/map__tip/.test(x.className)); return e?e.innerText.replace(/\n+/g,' | '):'(no tip)';});
  };
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',1840)); await page.waitForTimeout(900);
  log('NZ 1840:', await tip('new-zealand'));
  log('GIB:', await tip('gibraltar'));
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',1865)); await page.waitForTimeout(900);
  await page.keyboard.press('h'); await page.waitForTimeout(1400);
  await shot('nz-1865-silence');
  log('BODY after H at 1865:', (await page.evaluate(()=>document.body.innerText)).slice(0,2200));
};
