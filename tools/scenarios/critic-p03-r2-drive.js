/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  // close the legend/intro overlay if any
  const dump = async (tag) => {
    const o = await page.evaluate(() => {
      const t = document.querySelector('.time__slot');
      return t ? t.innerText : '(no .time__slot)';
    });
    log('--- ' + tag + ' ---\n' + o);
  };
  await dump('initial');
  // 1820
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(900);
  await dump('year=1820');
  await shot('y1820');
  // 1830
  await page.evaluate(() => { location.hash = '#year=1830'; });
  await page.waitForTimeout(800);
  await dump('year=1830');
  // 1500 (before phases)
  await page.evaluate(() => { location.hash = '#year=1500'; });
  await page.waitForTimeout(800);
  await dump('year=1500');
  await shot('y1500');
  // 2020 after
  await page.evaluate(() => { location.hash = '#year=2020'; });
  await page.waitForTimeout(800);
  await dump('year=2020');
  await shot('y2020');
};
