/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.__map, null, { timeout: 25000 });
  await page.waitForTimeout(2500);
  const o = await page.evaluate(() => {
    const out = [];
    let n = document.querySelector('.map');
    while (n && n !== document.documentElement) {
      const b = n.getBoundingClientRect();
      const cs = getComputedStyle(n);
      out.push([n.tagName + (n.id ? '#' + n.id : '') + '.' + String(n.className||'').split(' ').slice(0,2).join('.'),
        Math.round(b.width) + 'x' + Math.round(b.height), cs.display, cs.gridTemplateRows ? cs.gridTemplateRows.slice(0,60) : '', cs.height]);
      n = n.parentElement;
    }
    return out;
  });
  for (const r of o) log(JSON.stringify(r));
};
