/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const g = await page.evaluate(() => {
    const q = (s) => { const e = document.querySelector(s); if (!e) return 'MISSING'; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height), disp:cs.display, vis:cs.visibility, op:cs.opacity, z:cs.zIndex, ov:cs.overflow}; };
    return {
      legendSlot: q('[data-mount="legend"]'),
      legendRoot: q('[data-mount="legend"] > *'),
      noteSlot: q('[data-mount="stage-note"]'),
      byline: q('#legend-byline'),
      mapCard: q('.stage__over > *'),
      vh: window.innerHeight, vw: window.innerWidth,
      legendHTMLstart: (document.querySelector('[data-mount="legend"]')||{}).outerHTML?.slice(0,300),
    };
  });
  log(JSON.stringify(g, null, 1));
  await shot('full');
  const has = await page.locator('[data-mount="legend"]').count();
  if (has) { await page.locator('[data-mount="legend"]').first().scrollIntoViewIfNeeded().catch(()=>{}); await shot('legend-el', '[data-mount="legend"]'); }
  await shot('byline-el', '[data-mount="stage-note"]');
};
