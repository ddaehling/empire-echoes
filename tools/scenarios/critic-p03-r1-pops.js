/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  // phase lane popover
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(500);
  const lanes = await page.$$('.tl-lane');
  log('lanes:', lanes.length);
  await lanes[3].click();
  await page.waitForTimeout(400);
  log('pop hidden?', await page.evaluate(() => document.querySelector('.tl__pop').hidden));
  log('pop text:', await page.evaluate(() => document.querySelector('.tl__pop').innerText));
  await shot('phase-pop', '.tl');

  // uncertainty mark
  await page.evaluate(() => { document.querySelector('.tl__pop').hidden = true; });
  const marks = await page.$$('.tl-mark');
  log('uncertain marks:', marks.length);
  if (marks.length) {
    await marks[Math.floor(marks.length/2)].click();
    await page.waitForTimeout(400);
    log('mark pop:', await page.evaluate(() => document.querySelector('.tl__pop').innerText));
    log('year now', await page.evaluate(() => window.BEA.store.getState().year));
    await shot('mark-pop', '.tl');
  }
  // warn chip
  const warnVisible = await page.evaluate(() => !document.querySelector('.tl__warn').hidden);
  log('warn chip visible at this year?', warnVisible);
  log('warn text', await page.evaluate(() => document.querySelector('.tl__warn').innerText));
  await shot('warn', '.tl');
  // definition switch effect
  for (const def of ['claimed','controlled']) {
    await page.evaluate((d) => { location.hash = '#year=1913&def=' + d; }, def);
    await page.waitForTimeout(700);
    log('def=' + def + ' -> tl count: ' + await page.evaluate(() => document.querySelector('.tl__count').innerText));
  }
};
