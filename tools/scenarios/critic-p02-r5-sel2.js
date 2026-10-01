/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.evaluate(() => { location.hash = '#year=1913'; }); await page.waitForTimeout(1200);
  const ids = await page.evaluate(()=>[...document.querySelectorAll('.map__target')].map(e=>e.dataset.unit));
  log('bengal-ish: ' + JSON.stringify(ids.filter(i=>/beng|west-beng|bihar|ireland/i.test(i))));
  const id = ids.find(i=>/beng/i.test(i)) || ids[40];
  const b = await page.evaluate(id => { const e=document.querySelector(`[data-unit="${id}"]`); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,id}; }, id);
  log('picking ' + JSON.stringify(b));
  await page.mouse.move(b.x, b.y); await page.waitForTimeout(1400); await shot('hover');
  await page.mouse.click(b.x, b.y); await page.waitForTimeout(2000); await shot('click');
  log('hash: ' + await page.evaluate(()=>location.hash));
  log('map text: ' + await page.evaluate(()=>{const m=document.querySelector('.map'); return m?m.innerText.slice(0,1400):'';}));
};
