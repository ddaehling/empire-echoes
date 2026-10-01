/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const geom = async (tag) => {
    const g = await page.evaluate(() => {
      const m = document.querySelector('.map'); const c = document.querySelector('.map__plate');
      const r = m.getBoundingClientRect();
      const st = window.BEA.store.getState();
      return {mapW:Math.round(r.width), mapH:Math.round(r.height), view: st.mapView, vh: window.innerHeight};
    });
    log(tag, JSON.stringify(g));
    return g;
  };
  await geom('initial');
  await shot('a-initial');
  // fold the legend
  const fold = await page.$('text=FOLD');
  if (fold) { await fold.click(); await page.waitForTimeout(700); await shot('b-folded'); await geom('folded'); }
  // press + a few times
  for (let i=0;i<3;i++){ await page.keyboard.press('+').catch(()=>{}); await page.waitForTimeout(300); }
  await page.waitForTimeout(600); await shot('c-zoomed'); await geom('zoomed');
  // the square button (fit?)
  const btns = await page.evaluate(()=>[...document.querySelectorAll('button')].map(b=>({t:b.textContent.trim().slice(0,30), a:b.getAttribute('aria-label'), c:b.className})).filter(b=>/zoom|fit|map|\+|−|□/i.test(b.t+b.a+b.c)).slice(0,20));
  log('BTNS:', JSON.stringify(btns));
};
