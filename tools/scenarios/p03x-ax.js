/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  log(JSON.stringify(await page.evaluate(() => {
    const svg = document.querySelector('.tl-ax__svg');
    const majors = [...svg.querySelectorAll('.tl-ax__major')].slice(0, 3).map(l => ({ x: l.getAttribute('x1'), y1: l.getAttribute('y1'), y2: l.getAttribute('y2'), r: l.getBoundingClientRect().top + '-' + l.getBoundingClientRect().bottom }));
    const yrs = [...svg.querySelectorAll('.tl-ax__yr')].slice(0, 3).map(t => { const b = t.getBoundingClientRect(); return { t: t.textContent, y: t.getAttribute('y'), top: Math.round(b.top), bot: Math.round(b.bottom), fs: getComputedStyle(t).fontSize }; });
    const sr = svg.getBoundingClientRect();
    const axr = document.querySelector('.tl-ax__axis').getBoundingClientRect();
    return { majors, yrs, svg: { top: Math.round(sr.top), h: Math.round(sr.height) }, axis: { top: Math.round(axr.top), h: Math.round(axr.height) }, vb: svg.getAttribute('viewBox'), attrH: svg.getAttribute('height') };
  })));
};
