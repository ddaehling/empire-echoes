/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1000);
  log('units:', await page.evaluate(()=>[...document.querySelectorAll('.map__target')].slice(0,40).map(e=>e.dataset.unit).join(', ')));
  const hit = await page.evaluate(()=>{ const e=[...document.querySelectorAll('.map__target')].find(x=>/bengal/.test(x.dataset.unit)) || document.querySelectorAll('.map__target')[3]; const r=e.getBoundingClientRect(); return {u:e.dataset.unit,x:r.x+r.width/2,y:r.y+r.height/2}; });
  log('hitting', hit.u);
  await page.mouse.move(hit.x, hit.y); await page.waitForTimeout(500); await shot('30-hover');
  await page.mouse.click(hit.x, hit.y);
  await page.waitForTimeout(1500);
  await shot('31-dossier');
  log('sel', await page.evaluate(()=>BEA.store.getState().selectedTerritoryId));
  log('GEOM', await page.evaluate(()=>{const p=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];};return JSON.stringify({stage:p('.app__stage'),dossier:p('.app__dossier'),frame:p('.map__frame'),legend:p('.stage__legend'),note:p('.stage__note'),time:p('.app__time')});}));
  log('DOSSIER:\n'+(await page.evaluate(()=>document.querySelector('[data-mount=dossier]')?.innerText||'NONE')).slice(0,5000));
  log('dossier scroll:', await page.evaluate(()=>{const e=document.querySelector('.dossier__body');return e?e.clientHeight+'/'+e.scrollHeight:'x';}));
  // move year past independence
  await page.evaluate(()=>BEA.store.act.setYear(1975)); await page.waitForTimeout(1400);
  await shot('32-after-independence');
  log('DOSSIER 1975:\n'+(await page.evaluate(()=>document.querySelector('[data-mount=dossier]')?.innerText||'NONE')).slice(0,2500));
  // deselect
  await page.keyboard.press('Escape'); await page.waitForTimeout(900); await shot('33-deselected');
};
