/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  await page.keyboard.press('e'); await page.waitForTimeout(1200);
  await page.keyboard.press('p'); await page.waitForTimeout(4000); // triggers full-width byline
  const gb = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('.map__target')].map(e=>e.dataset.unit).filter(i=>/britain|ireland|england/i.test(i));
    const e = document.querySelector('[data-unit="great-britain"]') || [...document.querySelectorAll('.map__target')].find(x=>/britain/i.test(x.dataset.unit));
    const b = e && e.getBoundingClientRect();
    const by = document.querySelector('.byline').getBoundingClientRect();
    return { ids, id: e&&e.dataset.unit, rect: b&&{x:b.x,y:b.y,w:b.width,h:b.height}, byline: {x:by.x,y:by.y,w:by.width,h:by.height},
      topAt: b ? (document.elementFromPoint(b.x+b.width/2, b.y+b.height/2)||{}).className : null };
  });
  log('GB: ' + JSON.stringify(gb));
  if (gb.rect) {
    await page.mouse.click(gb.rect.x + gb.rect.w/2, gb.rect.y + gb.rect.h/2);
    await page.waitForTimeout(1500);
    log('hash after click on GB: ' + await page.evaluate(()=>location.hash));
    await shot('gb-click');
  }
};
