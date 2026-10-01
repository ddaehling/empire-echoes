/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2600);
  await shot('key');
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(800);
  await shot('plate');
  const bad = await page.evaluate(() => {
    const out = [];
    for (const n of document.querySelectorAll('#legend-plate *, .legend *, #legend-byline *')) {
      const cs = getComputedStyle(n);
      const c = cs.color, b = cs.backgroundColor;
      if (c === 'rgb(0, 0, 0)' || c === 'rgb(255, 255, 255)') out.push('color ' + (n.className||n.tagName));
      if (b === 'rgb(0, 0, 0)' || b === 'rgb(255, 255, 255)') out.push('bg ' + (n.className||n.tagName));
    }
    return [...new Set(out)].slice(0, 12);
  });
  log('pure black/white: ' + JSON.stringify(bad));
  log('ERRORS ' + JSON.stringify(errs));
};
