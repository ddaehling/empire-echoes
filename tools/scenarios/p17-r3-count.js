/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const n = await page.evaluate(() => {
    const panel = document.querySelector('.legend');
    const pr = panel.getBoundingClientRect();
    const vis = (s) => { const r = s.getBoundingClientRect();
      const host = s.closest('#legend-body') || panel; const hr = host.getBoundingClientRect();
      const top = Math.max(hr.top, pr.top), bot = Math.min(hr.bottom, pr.bottom);
      return r.height > 4 && r.top >= top - 2 && r.bottom <= bot + 2 && r.top >= 0 && r.bottom <= innerHeight; };
    const count = (sel) => [...panel.querySelectorAll(sel)].filter(e => vis(e.querySelector('.sym') || e)).length;
    return {
      legalForms: count('#legend-body .legend__row'),
      families: count('#legend-body .legend__family-head'),
      markChips: count('.legend__chip'),
      totalFormsOnPlate: panel.querySelectorAll('#legend-body .legend__row .legend__entry[data-status]').length,
    };
  });
  log('visible:', JSON.stringify(n));
  await shot('01');
};
