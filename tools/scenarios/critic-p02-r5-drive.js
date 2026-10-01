/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  await page.keyboard.press('e'); // enlarge
  await page.waitForTimeout(900);
  await shot('00-1913-enlarged');

  // Projection toggle
  await page.keyboard.press('p');
  await page.waitForTimeout(300);
  await shot('01-proj-mid');
  await page.waitForTimeout(1600);
  await shot('02-proj-equal');
  log('projection now: ' + await page.evaluate(() => window.__map.projection));
  const rail = await page.evaluate(() => document.querySelector('.map__rail, .map-rail, aside')?.innerText?.slice(0,900));
  log('RAIL: ' + rail);

  // back
  await page.keyboard.press('p');
  await page.waitForTimeout(1800);

  // Weight
  await page.keyboard.press('w');
  await page.waitForTimeout(1600);
  await shot('03-weight');
  log('weight: ' + await page.evaluate(() => JSON.stringify(window.__map.weight)).then(s=>s.slice(0,600)));
  log('BODYTEXT after W:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1800));

  await page.keyboard.press('w');
  await page.waitForTimeout(1200);

  // Stitching
  await page.keyboard.press('s');
  await page.waitForTimeout(1600);
  await shot('04-stitch');
  log('stitch: ' + await page.evaluate(() => JSON.stringify(window.__map.stitch)));
  await page.keyboard.press('s');
  await page.waitForTimeout(1000);

  // Silences
  await page.keyboard.press('h');
  await page.waitForTimeout(1600);
  await shot('05-silences');
  log('silenceMode: ' + await page.evaluate(() => JSON.stringify(window.__map.silenceMode)));
  log('BODYTEXT after H:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1500));
};
