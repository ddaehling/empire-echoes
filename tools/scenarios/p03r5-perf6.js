/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'bind').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const r = await page.evaluate(async () => {
    const p = document.querySelector('.tl').__p03;
    const names = ['renderRow','renderWarn','renderDefSwitch','markVisited','announceYear'];
    const acc = {};
    for (const n of names) { const o = p[n].bind(p); acc[n]=0; p[n] = function(...a){ const t=performance.now(); const r=o(...a); acc[n]+=performance.now()-t; return r; }; }
    const rs = p.rate.setYear; acc.rateSetYear=0; p.rate.setYear = (y)=>{const t=performance.now(); rs(y); acc.rateSetYear+=performance.now()-t;};
    const ss = p.spine.setYear; acc.spineSetYear=0; p.spine.setYear = (...a)=>{const t=performance.now(); ss(...a); acc.spineSetYear+=performance.now()-t;};
    const be = p.bus.emit.bind(p.bus); acc.busEmit=0; p.bus.emit = (...a)=>{const t=performance.now(); const r=be(...a); acc.busEmit+=performance.now()-t; return r;};
    const sc = p.scrub.setYear; acc.scrubSetYear=0; p.scrub.setYear=(y)=>{const t=performance.now(); sc(y); acc.scrubSetYear+=performance.now()-t;};
    p.perf.reset();
    for (let y = 1600; y < 1900; y++) { location.hash = '#year=' + y; await new Promise(r => requestAnimationFrame(r)); }
    const out = { totalDraw: +p.perf.ms.toFixed(1), n: p.perf.n };
    for (const k in acc) out[k] = +acc[k].toFixed(1);
    return out;
  });
  log(JSON.stringify(r));
};
