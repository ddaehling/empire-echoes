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
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(3500);
  await shot('landing');
  log('title:', await page.title());
  log('URL:', page.url());
  const t = await page.evaluate(() => document.body.innerText);
  log('BODY:', t.slice(0, 2500));
  log('svgs:', await page.evaluate(() => document.querySelectorAll('svg').length));
  log('map paths:', await page.evaluate(() => document.querySelectorAll('#map svg path, .map svg path, svg path').length));
  log('ERRORS:', JSON.stringify(errs, null, 1));
};
