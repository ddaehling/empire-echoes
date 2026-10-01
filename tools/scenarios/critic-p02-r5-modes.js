/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const S = '.map__plate';
  const readout = () => page.evaluate(() => {
    const el = document.querySelector('.map__howto, .legend, .map__readout');
    return (document.body.innerText.match(/How to read this map[\s\S]{0,600}/)||[''])[0];
  });
  await shot('def1-claimed', S);
  log('DEF1:', await readout());
  for (const k of ['2','3','4']) {
    await page.keyboard.press(k); await page.waitForTimeout(1200);
    await shot('def'+k, S);
    log('DEF'+k+':', await readout());
  }
  await page.keyboard.press('1'); await page.waitForTimeout(800);
  // projection
  await page.keyboard.press('p'); await page.waitForTimeout(1800);
  await shot('projection-equalarea', S);
  log('after P:', (await page.evaluate(()=>document.body.innerText)).match(/Equal Earth[\s\S]{0,200}|Mercator[\s\S]{0,120}/g));
  await page.keyboard.press('p'); await page.waitForTimeout(1500);
  // weight
  await page.keyboard.press('w'); await page.waitForTimeout(1800);
  await shot('weight', S);
  log('WEIGHT text:', (await page.evaluate(()=>document.body.innerText)).slice(0,1800));
};
