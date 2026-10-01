/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const walk = (e, d, out) => {
      const b = e.getBoundingClientRect();
      out.push(' '.repeat(d) + e.tagName + '#' + e.id + '.' + (typeof e.className==='string'?e.className:'') + ' top=' + Math.round(b.top) + ' h=' + Math.round(b.height));
      if (d < 3) for (const c of e.children) walk(c, d + 1, out);
    };
    const out = [];
    walk(document.querySelector('main'), 0, out);
    return out.join('\n');
  });
  log(info);
};
