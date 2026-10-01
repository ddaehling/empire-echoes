/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForSelector('.tl', { timeout: 15000 });
  await page.evaluate(() => { location.hash = '#year=1901&filter=stage:apparatus'; });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const b = (s) => { const n = document.querySelector(s); if (!n) return null; const x = n.getBoundingClientRect(); return [Math.round(x.top), Math.round(x.bottom), Math.round(x.left), Math.round(x.right)]; };
    const lbl = [...document.querySelectorAll('.tl-ax__yr')].map(n => { const x = n.getBBox ? n.getBoundingClientRect() : null; return n.textContent + ' ' + Math.round(x.top) + '-' + Math.round(x.bottom); });
    return { region: b('.app__time'), tl: b('.tl'), marks: b('.tl-ax__marks'), svg: b('.tl-ax__svg'), spine: b('.tl-spine__track'), trace: b('.tl-spine__trace'), labels: lbl };
  });
  log(JSON.stringify(r, null, 1));
  await shot('mobile-apparatus');
};
