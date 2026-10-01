/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const crit = async (label) => {
    const t = await page.evaluate(() => {
      const b = document.querySelector('.byline, [class*="byline"]');
      return b ? b.innerText : '(no byline)';
    });
    log('--- ' + label + ' BYLINE ---\n' + t);
  };
  await crit('default');
  // open the "three things wrong" link
  const link = page.locator('text=Three things wrong with this rendering').first();
  log('crit link count', await page.locator('text=Three things wrong').count());
  await link.click();
  await page.waitForTimeout(600);
  await shot('crit-open');
  await crit('crit-open');
  // change projection
  await page.keyboard.press('p');
  await page.waitForTimeout(1400);
  await shot('crit-equal-earth');
  await crit('after-P');
  // weight mode
  await page.keyboard.press('w');
  await page.waitForTimeout(1400);
  await shot('crit-weight');
  await crit('after-W');
  await page.keyboard.press('w');
  await page.waitForTimeout(900);
  // definition 3 = controlled
  await page.keyboard.press('3');
  await page.waitForTimeout(1200);
  await shot('crit-controlled');
  await crit('after-3');
  await page.keyboard.press('4');
  await page.waitForTimeout(1200);
  await shot('crit-influenced');
  await crit('after-4');
  // stitching
  await page.keyboard.press('1');
  await page.waitForTimeout(800);
  await page.keyboard.press('s');
  await page.waitForTimeout(1500);
  await shot('crit-stitch');
  await crit('after-S');
  await page.keyboard.press('s');
  await page.waitForTimeout(800);
  await page.keyboard.press('h');
  await page.waitForTimeout(1500);
  await shot('crit-silence');
  await crit('after-H');
};
