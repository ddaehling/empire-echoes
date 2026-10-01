/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const m = await page.evaluate(() => {
    const app = document.querySelector('.app');
    const cs = getComputedStyle(app);
    const kids = [...app.children].map(e => ({cls:e.className.toString(), area:getComputedStyle(e).gridArea, h:Math.round(e.getBoundingClientRect().height), w:Math.round(e.getBoundingClientRect().width)}));
    return { rows: cs.gridTemplateRows, cols: cs.gridTemplateColumns, areas: cs.gridTemplateAreas, kids, appH: app.getBoundingClientRect().height };
  });
  log(JSON.stringify(m,null,1));
};
