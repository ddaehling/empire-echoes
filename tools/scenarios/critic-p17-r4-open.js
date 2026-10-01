/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0,300)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0,300)));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(3000);
  await shot('01-landing');
  // dismiss onboarding if any
  const dom = await page.evaluate(() => {
    const out = {};
    out.title = document.title;
    out.bodyText = document.body.innerText.slice(0, 2500);
    const el = document.querySelector('[class*="legend"], #legend, [data-module="legend"]');
    out.legendFound = !!el;
    out.legendSel = el ? (el.id || el.className) : null;
    // enumerate all top-level regions
    out.regions = [...document.querySelectorAll('[class*="app__"]')].map(n => n.className + ' :: ' + Math.round(n.getBoundingClientRect().width) + 'x' + Math.round(n.getBoundingClientRect().height));
    return out;
  });
  log(JSON.stringify(dom, null, 1).slice(0, 6000));
  log('ERRORS: ' + JSON.stringify(errs, null, 1));
};
