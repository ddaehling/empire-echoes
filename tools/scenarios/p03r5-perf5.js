/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const sweep = (mode) => page.evaluate(async (mode) => {
    const p = document.querySelector('.tl').__p03;
    if (!p.__o) p.__o = p.draw;
    p.draw = mode === 'off' ? function(){} : p.__o;
    const t = [];
    for (let y = 1600; y < 1900; y++) { const a = performance.now(); location.hash = '#year=' + y; await new Promise(r => requestAnimationFrame(r)); t.push(performance.now() - a); }
    t.sort((a,b)=>a-b);
    return { mean:+(t.reduce((s,x)=>s+x,0)/t.length).toFixed(2), p50:+t[150].toFixed(2), p95:+t[285].toFixed(2), max:+t[299].toFixed(2), over25:t.filter(x=>x>25).length };
  }, mode);
  log('hash sweep, P03 ON :', JSON.stringify(await sweep('on')));
  log('hash sweep, P03 OFF:', JSON.stringify(await sweep('off')));
  log('hash sweep, P03 ON :', JSON.stringify(await sweep('on')));
};
