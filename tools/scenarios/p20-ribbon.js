/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  const out = await page.evaluate(() => {
    const host = document.querySelector('[data-mount="legend"]');
    if (!host) return 'no legend mount';
    const bits = [];
    host.querySelectorAll('*').forEach(n => {
      const cs = getComputedStyle(n);
      const bg = cs.backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && n.getBoundingClientRect().width < 40) {
        bits.push({ cls: n.className.toString().slice(0, 60), bg, ds: JSON.stringify(n.dataset), parentText: (n.parentElement.textContent || '').trim().slice(0, 40) });
      }
    });
    return { html: host.innerHTML.slice(0, 900), swatches: bits.slice(0, 8) };
  });
  log(JSON.stringify(out, null, 1));
};
