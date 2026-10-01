/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const snap = async (tag) => {
    const o = await page.evaluate(() => ({
      rule: document.querySelector('.legend__rulebox')?.innerText.replace(/\n+/g,' | ')||'NO RULEBOX',
      byl: [...document.querySelectorAll('.byline__item')].map(e=>e.innerText.replace(/\n+/g,' ')).join(' || '),
      marks: document.querySelector('.legend__marksfix')?.innerText.replace(/\n+/g,' | ')||'NONE',
    }));
    log('### '+tag);
    log('  RULE:', o.rule);
    log('  BYLINE:', o.byl);
    log('  MARKS:', o.marks);
  };
  await snap('default');
  await page.keyboard.press('w'); await page.waitForTimeout(1500); await snap('WEIGHT'); await shot('weight');
  await page.keyboard.press('w'); await page.waitForTimeout(800);
  await page.keyboard.press('s'); await page.waitForTimeout(1500); await snap('STITCH'); await shot('stitch');
  await page.keyboard.press('s'); await page.waitForTimeout(800);
  await page.keyboard.press('h'); await page.waitForTimeout(1500); await snap('SILENCE'); await shot('silence');
};
