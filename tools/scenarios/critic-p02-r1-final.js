/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3200);
  await shot('current');
  // re-confirm button deadness with real mouse
  const st = async () => page.evaluate(()=>({proj:document.querySelector('.map').dataset.projection, def:document.querySelector('.map').dataset.definition}));
  const click = async (sel, idx) => { const p = await page.evaluate(([s,i])=>{const b=[...document.querySelectorAll(s)][i];const r=b.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};},[sel,idx]); await page.mouse.move(p.x,p.y); await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up(); await page.waitForTimeout(900); };
  log('before', JSON.stringify(await st()));
  await click('.map__def',2); log('after mouse-click controlled tile', JSON.stringify(await st()));
  await click('.map__proj',0); log('after mouse-click proj', JSON.stringify(await st()));
  await click('.map__zoom',0); log('after mouse-click zoom-in, hash=', await page.evaluate(()=>location.hash));
  // reduced motion behaviour of projection change
  await page.keyboard.press('p'); await page.waitForTimeout(120); await shot('reduced-mid'); await page.waitForTimeout(1500); await shot('reduced-after');
  log('proj after p', JSON.stringify(await st()));
  // caveats
  const c = await page.$('text=Three things wrong with this rendering');
  if (c) { await c.click().catch(e=>log('caveat click err', e.message)); await page.waitForTimeout(800); await shot('caveats'); log('caveat text', await page.evaluate(()=>document.body.innerText.match(/Three things wrong[\s\S]{0,700}/)?.[0])); }
};
