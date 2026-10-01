/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => { location.hash = '#tour=thirty&step=3'; });
  await page.waitForTimeout(2000);
  const r = await page.evaluate(() => {
    const n = [...document.querySelectorAll('.app__foot .cx-more, .app__foot > .cx-more')][0];
    if (!n) return { none: true };
    const b = n.getBoundingClientRect();
    const foot = n.closest('.app__foot').getBoundingClientRect();
    return {
      matchesLegendRule: n.matches('.legend .cx-more, .lsheet > .cx-more'),
      inLegend: !!n.closest('.legend'),
      box: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
      foot: { x: Math.round(foot.x), y: Math.round(foot.y), w: Math.round(foot.width), h: Math.round(foot.height) },
      cs: { display: getComputedStyle(n).display, minH: getComputedStyle(n).minBlockSize, align: getComputedStyle(n).alignItems },
      text: n.textContent.trim(),
    };
  });
  log(JSON.stringify(r));
};
