/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Reproduces the critic's round-4 defect list, step for step. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2800);
  const st = () => page.evaluate(() => {
    const leg = document.querySelector('.legend');
    return { h: leg ? Math.round(leg.getBoundingClientRect().height) : null,
      hasColours: !!(leg && leg.querySelector('.legend__colours .sym')),
      text: leg ? leg.innerText.replace(/\s+/g,' ').slice(0,260) : null };
  });
  log('D1 start ' + JSON.stringify(await st()));
  for (const k of ['2','1','3','1','4','1']) { await page.keyboard.press(k); await page.waitForTimeout(500);
    log("D1 after '" + k + "' " + JSON.stringify(await st())); }

  // D3/D4: stale counts
  await page.keyboard.press('w'); await page.waitForTimeout(700);
  await page.evaluate(() => { location.hash = '#year=1620'; }); await page.waitForTimeout(1400);
  const d3 = await page.evaluate(() => {
    const by = document.getElementById('legend-byline');
    let c=0,m=0; for (const r of window.__map.plate.paint.values()) { if (r.lost||r.mode==='hole'||r.mode==='informal') continue;
      if (r.mode==='absence') m++; else c++; }
    return { byline: by.innerText.replace(/\s+/g,' ').slice(-140), truth: c+'/'+m }; });
  log('D3 weight@1620 ' + JSON.stringify(d3));
  await page.keyboard.press('s'); await page.waitForTimeout(800);
  const d4 = await page.evaluate(() => {
    const by = document.getElementById('legend-byline');
    let t=0; for (const [u,r] of window.__map.plate.paint) if (window.__map.plate.isTiny(u) && !r.lost) t++;
    return { byline: by.innerText.replace(/\s+/g,' ').slice(-120), truth: t }; });
  log('D4 stitch@1620 ' + JSON.stringify(d4));

  // D8/D9: truncation of our own strings and P02's while the plate is open
  await page.evaluate(() => { location.hash = '#year=1900'; }); await page.waitForTimeout(900);
  await page.evaluate(() => window.BEA.legend.openPlate('colour')); await page.waitForTimeout(900);
  const d8 = await page.evaluate(() => ({
    fullKeyHeader: (document.querySelector('#plate-status-h')||{}).innerText,
    ourTruncated: [...document.querySelectorAll('#legend-plate *, .legend *, #legend-byline *')]
      .filter(n => n.children.length === 0 && n.scrollWidth > n.clientWidth + 2)
      .map(n => n.className + ' :: ' + n.textContent.slice(0,40)).slice(0,8),
    p02modes: [...document.querySelectorAll('.map__mode')].map(n => n.innerText.replace(/\s+/g,' ')),
  }));
  log('D8 ' + JSON.stringify(d8, null, 1));
  await shot('plate-1366');
  log('ERRORS ' + JSON.stringify(errs));
};
