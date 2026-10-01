/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.selectOption: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1600'; });
  await page.waitForTimeout(900);
  const res = await page.evaluate(async () => {
    const store = window.__store || null;
    const times = [];
    // drive via the slider keyboard: measure frame cost by setting year directly through hash is slow.
    // Instead find the timeline module instance perf hook
    return null;
  });
  // measure by pressing ArrowRight 400 times and timing
  await page.evaluate(() => { const s=document.querySelector('[role="slider"]'); s.focus(); });
  const t0 = Date.now();
  const N = 400;
  for (let i=0;i<N;i++) await page.keyboard.press('ArrowRight');
  const t1 = Date.now();
  const y = await page.evaluate(()=>document.querySelector('.time__slot').innerText.split('\n').filter(s=>/^\d{4}$/.test(s.trim()))[0]);
  log('400 ArrowRight presses took ' + (t1-t0) + 'ms  => ' + ((t1-t0)/N).toFixed(1) + ' ms/step (includes CDP roundtrip). landed at ' + y);
  // long-task / raf measure
  const raf = await page.evaluate(() => new Promise(res => {
    const ts=[]; let last=performance.now(); let n=0;
    function tick(){ const t=performance.now(); ts.push(t-last); last=t; n++; if(n<120) requestAnimationFrame(tick); else res(ts); }
    requestAnimationFrame(tick);
  }));
  const sorted=[...raf].sort((a,b)=>a-b);
  log('idle raf p50='+sorted[60].toFixed(1)+' p95='+sorted[113].toFixed(1)+' max='+sorted[119].toFixed(1));
  // now measure during playback at 16x
  await page.evaluate(() => { location.hash='#year=1700'; });
  await page.waitForTimeout(500);
  const sel = await page.$('select.tl-speed'); if (sel) await sel.selectOption('16');
  await page.evaluate(()=>document.body.focus());
  await page.keyboard.press('Space');
  const raf2 = await page.evaluate(() => new Promise(res => {
    const ts=[]; let last=performance.now(); let n=0;
    function tick(){ const t=performance.now(); ts.push(t-last); last=t; n++; if(n<200) requestAnimationFrame(tick); else res(ts); }
    requestAnimationFrame(tick);
  }));
  const s2=[...raf2].sort((a,b)=>a-b);
  log('playback16x raf p50='+s2[100].toFixed(1)+' p95='+s2[189].toFixed(1)+' max='+s2[199].toFixed(1));
  log('year now '+await page.evaluate(()=>document.querySelector('.time__slot').innerText.split('\n').filter(s=>/^\d{4}$/.test(s.trim()))[0]));
  await shot('perf');
};
