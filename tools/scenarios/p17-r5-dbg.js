/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'style').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2800);
  const r = await page.evaluate(() => {
    const b = document.getElementById('legend-byline');
    const slot = document.querySelector('[data-mount="stage-note"]');
    const ovh = document.querySelector('[data-mount="overlay"]');
    const rr = slot.getBoundingClientRect();
    const x = Math.round(rr.left+10), y = Math.round(rr.top+10);
    const was = b.style.pointerEvents; b.style.pointerEvents='none';
    const under = document.elementFromPoint(x,y);
    b.style.pointerEvents = was;
    return { slotRect:[Math.round(rr.x),Math.round(rr.y),Math.round(rr.width),Math.round(rr.height)],
      x, y, under: under ? under.tagName+'.'+under.className : null,
      underInOverlay: !!(under && under.closest('.app__overlay')),
      slotContains: !!(under && (under===slot || slot.contains(under))),
      overlayHost: ovh ? ovh.className : null,
      bylineParent: b.parentElement.className + ' / ' + (b.parentElement.dataset.mount||''),
      float: b.dataset.float,
      hasLegendApi: !!(window.BEA && window.BEA.legend) };
  });
  log(JSON.stringify(r, null, 1));
};
