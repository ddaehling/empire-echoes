/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const stage = document.querySelector('.stage') || document.querySelector('.map') || document.querySelector('.map__plate');
    const sb = stage.getBoundingClientRect();
    const area = e => { if (!e) return 0; const b = e.getBoundingClientRect();
      const x = Math.max(0, Math.min(b.right, sb.right) - Math.max(b.left, sb.left));
      const y = Math.max(0, Math.min(b.bottom, sb.bottom) - Math.max(b.top, sb.top));
      return x*y; };
    const lg = document.querySelector('.legend'), by = document.querySelector('.byline');
    const w = document.querySelector('.legend__bodywrap');
    return { stage: { w: Math.round(sb.width), h: Math.round(sb.height), a: Math.round(sb.width*sb.height) },
      legendA: Math.round(area(lg)), bylineA: Math.round(area(by)),
      pct: Math.round((area(lg)+area(by))/(sb.width*sb.height)*100),
      window: w ? { h: Math.round(w.getBoundingClientRect().height), sh: w.scrollHeight, pctVisible: Math.round(w.getBoundingClientRect().height/w.scrollHeight*100) } : null,
      vh: innerHeight };
  });
  log(JSON.stringify(r));
  await shot('occl');
};
