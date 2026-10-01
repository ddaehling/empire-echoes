/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — touchscreen.tap: hasTouch must be enabled on the browser context before using the touchscr.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3200);
  const info = await page.evaluate(()=>{
    const p=document.querySelector('.map__plate').getBoundingClientRect();
    const ts=[...document.querySelectorAll('.map__target')];
    const free=ts.filter(t=>{const r=t.getBoundingClientRect();const el=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return el&&el.closest('.map')});
    return {plate:{x:p.x,y:p.y,w:p.width,h:p.height}, total:ts.length, reachable:free.length, sample:free.slice(0,10).map(t=>t.dataset.unit)};
  });
  log('MOBILE reachability:', JSON.stringify(info));
  if(info.reachable){
    const c = await page.evaluate(id=>{const t=document.querySelector(`.map__target[data-unit="${id}"]`);const r=t.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}}, info.sample[0]);
    await page.touchscreen.tap(c.x,c.y); await page.waitForTimeout(1600);
    log('tapped', info.sample[0], 'hash', await page.evaluate(()=>location.hash));
    await shot('mob-tapped');
  }
};
