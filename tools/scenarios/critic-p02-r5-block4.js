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
  const probe = async (tag) => {
    const r = await page.evaluate(() => {
      const by = document.querySelector('.byline').getBoundingClientRect();
      const p = document.querySelector('.map__plate').getBoundingClientRect();
      const e = document.querySelector('[data-unit="gb-england"]');
      const b = e && e.getBoundingClientRect();
      const el = b && document.elementFromPoint(b.x+b.width/2, b.y+b.height/2);
      return { plate: {w:Math.round(p.width),h:Math.round(p.height)}, bylineW: Math.round(by.width), gbTop: el && (el.className||el.tagName) };
    });
    log(tag + ': ' + JSON.stringify(r));
  };
  await probe('default-nomode');
  await page.keyboard.press('w'); await page.waitForTimeout(2000); await probe('W-small');
  await shot('w-small');
  await page.keyboard.press('e'); await page.waitForTimeout(2000); await probe('W-big');
  await shot('w-big');
};
