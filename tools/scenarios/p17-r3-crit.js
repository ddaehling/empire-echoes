/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.click('.byline__crit');
  await page.waitForTimeout(700);
  const el = await page.$('.stage__note');
  const b = await el.boundingBox();
  await page.screenshot({ path: (process.env.SHOT_DIR || '/tmp') + '/crit.png', clip: b });
  log('state:', await page.evaluate(() => {
    const by = document.querySelector('#legend-byline');
    return { atEnd: by.dataset.atEnd, ch: by.clientHeight, sh: by.scrollHeight,
             items: document.querySelectorAll('#legend-criticism li').length };
  }));
  await shot('01-crit');
};
