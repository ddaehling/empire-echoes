/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.waitForTimeout(3000);
  const byline = async (tag) => {
    const t = await page.evaluate(() => {
      const el = document.querySelector('.legend__byline, [class*="byline"]');
      return el ? el.innerText.replace(/\s+/g,' ').slice(0,400) : 'NO BYLINE EL';
    });
    log(tag + ' BYLINE: ' + t);
  };
  const head = async (tag) => {
    const t = await page.evaluate(() => {
      const el = document.querySelector('.legend, #legend, [data-module="legend"]');
      return el ? el.innerText.replace(/\s+/g,' ').slice(0,700) : 'NO LEGEND';
    });
    log(tag + ' LEGENDHEAD: ' + t);
  };
  await byline('def1'); await head('def1');
  for (const k of ['2','3','4','1']) {
    await page.keyboard.press(k); await page.waitForTimeout(900);
    await byline('def'+k); await head('def'+k);
  }
  await shot('02-def1-back');
  await page.keyboard.press('p'); await page.waitForTimeout(1400);
  await byline('proj-equal'); await shot('03-equalearth');
  await page.keyboard.press('w'); await page.waitForTimeout(1400);
  await byline('weight'); await head('weight'); await shot('04-weight');
  await page.keyboard.press('w'); await page.waitForTimeout(800);
  await page.keyboard.press('h'); await page.waitForTimeout(1200);
  await byline('silence'); await head('silence'); await shot('05-silences');
  await page.keyboard.press('h'); await page.waitForTimeout(600);
  await page.keyboard.press('s'); await page.waitForTimeout(1400);
  await byline('stitch'); await head('stitch'); await shot('06-stitch');
  log('ERRORS: ' + JSON.stringify(errs.slice(0,15)));
};
