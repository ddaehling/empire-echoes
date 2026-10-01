/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  log('layerVerified:', JSON.stringify(await page.evaluate(()=>window.BEA.legend ? window.BEA.legend.layerVerified : 'no debug')));
  log('legend dbg keys:', JSON.stringify(await page.evaluate(()=>window.BEA.legend?Object.keys(window.BEA.legend):[])));
  log('state:', JSON.stringify(await page.evaluate(()=>{const s=window.BEA.store.getState(); return {activeLayer:s.activeLayer, filters:s.filters};})));
  for (const L of ['tenure','mechanism','religion','resistance','population','trade']) {
    await page.evaluate(l=>window.BEA.store.dispatch('setLayer', l), L);
    await page.waitForTimeout(900);
    const o = await page.evaluate(()=>({
      layer: window.BEA.store.getState().activeLayer,
      rule: document.querySelector('.legend__rulebox')?.innerText.replace(/\n+/g,' | ')||'NONE',
      colourHead: document.querySelector('#legend-body .legend__h')?.innerText||'',
      first: document.querySelector('#legend-body')?.innerText.slice(0,220).replace(/\n+/g,' | '),
      byl2: document.querySelectorAll('.byline__item')[1]?.innerText.replace(/\n+/g,' ')||'',
    }));
    log('LAYER '+L+':', JSON.stringify(o));
  }
  await shot('layer-last');
};
