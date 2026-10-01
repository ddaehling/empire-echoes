/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.locator('button', { hasText: 'Open the full key' }).first().click();
  await page.waitForTimeout(1400);
  const rows = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.legend__entry, [class*="lplate"] [class*="sw"], .legend__fam').forEach(e => {
      const sw = e.querySelector('[class*="sw"], [class*="chip"], i, span[style*="background"]');
      const label = (e.innerText||'').split('\n')[0];
      const c = sw ? getComputedStyle(sw) : null;
      out.push({ label, bg: c && c.backgroundColor, bgImage: c && (c.backgroundImage||'').slice(0,60),
        hasSvg: !!(sw && sw.querySelector('svg,canvas')), cls: sw && sw.className });
    });
    return out;
  });
  log(JSON.stringify(rows, null, 1).slice(0, 5000));
  await shot('key-swatches', '.lplate, .app__overlay');
};
