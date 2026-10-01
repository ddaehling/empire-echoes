/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P06 round-3 diagnostic. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  log('viewport', JSON.stringify(page.viewportSize()));

  const geom = async (tag) => {
    const r = await page.evaluate(() => {
      const box = (s) => { const n = document.querySelector(s); if (!n) return null;
        const b = n.getBoundingClientRect();
        const cs = getComputedStyle(n);
        return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), vis: cs.visibility, disp: cs.display }; };
      const app = document.getElementById('app');
      return {
        stage: app && app.dataset.stage, rail: app && app.dataset.rail,
        layer: (window.BEA && window.BEA.store.getState().activeLayer) || null,
        doc: { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth },
        bar: box('.ly-bar'), open: box('.ly-bar__open'), now: box('.ly-bar__now'),
        masthead: box('.app__bar'),
        key: box('.ly-key'), cap: box('.ly-caption'), stack: box('.ly-stack'),
        mapCanvas: box('.stage__map canvas'),
        stageEl: box('.app__stage'),
        trbar: box('.tr-bar'), trpanel: box('.tr-panel'),
        cmp: box('.cmp'), cmpHidden: !!(document.querySelector('.cmp') && document.querySelector('.cmp').hasAttribute('hidden')),
        overSvg: box('.ly-over'),
        sheetId: (document.querySelector('[data-sheet-id]')||{dataset:{}}).dataset.sheetId,
      };
    });
    log(tag, JSON.stringify(r));
    return r;
  };

  await geom('COLD');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1860));
  await page.waitForTimeout(700);
  await geom('AFTER-YEAR');
  await shot('working');

  await page.evaluate(() => window.BEA.bus.emit('ask:layer', { id: 'mechanism', predict: false }));
  await page.waitForTimeout(1000);
  await geom('MECHANISM');
  await shot('mechanism');

  await page.evaluate(() => window.BEA.bus.emit('ask:layer', { id: 'system', predict: false }));
  await page.waitForTimeout(1000);
  await geom('SYSTEM');
  await shot('system');

  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { a: 1914, b: 1922 }));
  await page.waitForTimeout(1400);
  await geom('COMPARE+SYSTEM');
  await shot('compare-plus-layers');

  // now open our sheet while compare is open
  await page.evaluate(() => window.BEA.bus.emit('ask:layerKey', { open: true }));
  await page.waitForTimeout(900);
  await geom('COMPARE+SHEET');
  await shot('compare-plus-sheet');
  log('YEARS-ON-SCREEN', await page.evaluate(() => {
    const t = document.body.innerText;
    return JSON.stringify({ lede: (document.querySelector('.cx-lede__say')||{}).textContent, cmpLabs: [...document.querySelectorAll('.cmp__lab')].map(e=>e.textContent.replace(/\s+/g,' ')) });
  }));
};
