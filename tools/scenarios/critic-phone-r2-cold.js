/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1200);
  await shot('cold');
  const m = await page.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; };
    return {
      vw: innerWidth, vh: innerHeight,
      scrollH: document.documentElement.scrollHeight,
      scrollW: document.documentElement.scrollWidth,
      map: r('.stage__map') || r('[data-mount="map"]'),
      svg: r('.stage__map svg') || r('svg.map'),
      stage: r('.app__stage') || r('.stage'),
      time: r('.app__time'),
      key: r('.app__key'),
      foot: r('.app__foot'),
      bar: r('.app__bar'),
      words: document.body.innerText.split(/\s+/).filter(Boolean).length,
      controls: document.querySelectorAll('button,a[href],input,select,[tabindex]:not([tabindex="-1"])').length,
    };
  });
  log('COLD MEASURE', JSON.stringify(m));
  log('TEXT:', (await page.evaluate(()=>document.body.innerText)).slice(0,1500));
};
