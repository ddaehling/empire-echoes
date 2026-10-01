/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2800);
  const r = await page.evaluate(() => {
    const leg = document.querySelector('.legend');
    const m = (n) => { const cs = getComputedStyle(n); const b=n.getBoundingClientRect();
      return { c: n.className||n.tagName, h: Math.round(b.height),
        mt: cs.marginBlockStart, mb: cs.marginBlockEnd, pt: cs.paddingBlockStart, pb: cs.paddingBlockEnd,
        fs: cs.fontSize, lh: cs.lineHeight }; };
    const walk = (n, d) => d<=0 ? m(n) : Object.assign(m(n), { kids: [...n.children].map(k=>walk(k,d-1)) });
    return { legMax: leg.style.getPropertyValue('--legend-max'), tree: walk(leg, 2) };
  });
  log(JSON.stringify(r));
};
