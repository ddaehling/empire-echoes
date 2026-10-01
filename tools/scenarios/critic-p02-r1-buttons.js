/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const st = async () => page.evaluate(()=>({proj:document.querySelector('.map').dataset.projection, def:document.querySelector('.map').dataset.definition, hash:location.hash}));
  const btns = await page.evaluate(()=>[...document.querySelectorAll('.map button, .map [role=button]')].map(b=>({cls:b.className, txt:(b.innerText||'').trim().slice(0,24), al:b.getAttribute('aria-label')})));
  log('BUTTONS IN .map:', JSON.stringify(btns));
  log('start', JSON.stringify(await st()));
  // zoom in button
  for (const sel of ['.map__zoom-in', '.map__zoomin', 'button[aria-label*="Zoom in" i]']) {
    const n = await page.$$(sel); if (n.length) { log('using', sel); await page.locator(sel).first().click(); break; }
  }
  await page.waitForTimeout(900);
  log('after zoom-in click', JSON.stringify(await st()));
  await shot('after-zoom-click');
  // definition tile click
  const tile = await page.$$('button[aria-label*="administered" i], .map__def button, .mapdef__btn');
  log('def tiles found', tile.length);
  const t2 = page.locator('text=administered').first();
  if (await t2.count()) { await t2.click({force:false}).catch(e=>log('tile click err', e.message)); }
  await page.waitForTimeout(900);
  log('after def tile click', JSON.stringify(await st()));
  await shot('after-def-tile');
};
