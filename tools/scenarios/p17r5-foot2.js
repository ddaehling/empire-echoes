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
  const read = () => page.evaluate(() => {
    const n = [...document.querySelectorAll('.app__foot .cx-more')][0];
    const b = n.getBoundingClientRect(); const f = n.closest('.app__foot').getBoundingClientRect();
    return { above: Math.round(f.y - b.y), h: Math.round(b.height), footH: Math.round(f.height) };
  });
  log('with legend.css:    ' + JSON.stringify(await read()));
  const killed = await page.evaluate(() => {
    let k = 0;
    for (const l of document.querySelectorAll('link[rel="stylesheet"], style')) {
      const href = l.href || '';
      if (/legend\.css/.test(href)) { l.disabled = true; l.remove(); k++; }
    }
    return k;
  });
  await page.waitForTimeout(500);
  log('legend.css removed (' + killed + '): ' + JSON.stringify(await read()));
};
