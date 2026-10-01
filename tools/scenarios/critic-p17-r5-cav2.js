/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const read = async (tag) => {
    // open the full key if not already open
    const open = await page.evaluate(() => !!document.querySelector('.legend__caveat-line, .lkey, [class*="lkey"]')?.offsetParent);
    if (!open) {
      const b = page.locator('button', { hasText: /Open the full key|Three things wrong/i }).first();
      if (await b.count()) await b.click(); else await page.getByText(/Three things wrong/i).first().click();
      await page.waitForTimeout(1000);
    }
    const txt = await page.evaluate(() => {
      const ls = [...document.querySelectorAll('[class*="caveat"]')].map(e=>e.className+' :: '+(e.innerText||'').replace(/\s*\n\s*/g,' ').slice(0,400));
      return ls.join('\n');
    });
    log('### ' + tag + '\n' + txt + '\n');
  };
  await read('mercator-claimed');
  await shot('a');
  await page.keyboard.press('p'); await page.waitForTimeout(1300); await read('equalearth-claimed');
  await page.keyboard.press('3'); await page.waitForTimeout(1100); await read('equalearth-controlled');
  await page.keyboard.press('w'); await page.waitForTimeout(1300); await read('weight-controlled'); await shot('weightkey');
  await page.keyboard.press('w'); await page.waitForTimeout(600);
  await page.keyboard.press('s'); await page.waitForTimeout(1300); await read('stitch-controlled');
  await page.keyboard.press('s'); await page.waitForTimeout(600);
  await page.keyboard.press('4'); await page.waitForTimeout(1100); await read('equalearth-influenced');
  await page.keyboard.press('p'); await page.waitForTimeout(1300); await read('mercator-influenced');
};
