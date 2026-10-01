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
  await page.waitForTimeout(3500);
  await shot('01-first-run');
  // dismiss onboarding if any
  const txt = await page.evaluate(() => document.body.innerText);
  log('BODY(0-1500):', txt.slice(0,1500));
  log('CONSOLE ERRORS:', JSON.stringify(errs.slice(0,20)));
  // locate legend region
  const legend = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('[class*="legend"],[id*="legend"],[data-module="legend"]').forEach(el => {
      const r = el.getBoundingClientRect();
      out.push({ tag: el.tagName, cls: el.className && el.className.toString().slice(0,90), id: el.id, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
    });
    return out.slice(0, 40);
  });
  log('LEGEND ELS:', JSON.stringify(legend, null, 1));
};
