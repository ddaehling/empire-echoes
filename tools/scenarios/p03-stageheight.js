/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(900);
  log(await page.evaluate(() => {
    const out = [];
    const walk = (n, d) => {
      const r = n.getBoundingClientRect();
      if (r.height > 1000 && d < 6) { out.push('  '.repeat(d) + (n.tagName + '.' + (n.className.baseVal || n.className || '')).slice(0, 70) + ' h=' + Math.round(r.height)); }
      for (const c of n.children) walk(c, d + 1);
    };
    walk(document.getElementById('app'), 0);
    return JSON.stringify(out, null, 1);
  }));
};
