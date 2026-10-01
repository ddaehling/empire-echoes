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
    const walk = (e, d) => {
      const r = e.getBoundingClientRect();
      const cls = String(e.className||'');
      let s = '  '.repeat(d) + e.tagName.toLowerCase() + (e.id?('#'+e.id):'') + (cls?('.'+cls.split(/\s+/).slice(0,3).join('.')):'') + ` [${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}]`;
      const out = [s];
      if (d < 3) for (const c of e.children) out.push(...walk(c, d+1));
      return out;
    };
    return walk(document.body, 0).join('\n');
  });
  log(info);
};
