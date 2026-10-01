/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 6 — measure the legend's footprint against LAYOUT_BUDGET. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(2800);

  const measure = () => page.evaluate(() => {
    const r = (n) => { if (!n) return null; const b = n.getBoundingClientRect();
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const q = (s) => document.querySelector(s);
    const vis = (n) => !!(n && n.getClientRects().length);
    const key = q('.stage__key');
    const leg = q('.stage__key .legend') || q('[data-mount="legend"] .legend');
    const words = (n) => n ? (n.innerText || '').trim().split(/\s+/).filter(Boolean).length : 0;
    const sizes = new Set();
    document.querySelectorAll('body *').forEach(n => {
      if (!n.getClientRects().length) return;
      const t = [...n.childNodes].some(c => c.nodeType === 3 && c.textContent.trim());
      if (t) sizes.add(getComputedStyle(n).fontSize);
    });
    const ctl = [...document.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]
      .filter(n => n.getClientRects().length && !n.closest('.boot') && !n.classList.contains('skip-link'));
    return {
      stage: (document.getElementById('app') || {}).dataset ? document.getElementById('app').dataset.stage : null,
      vw: innerWidth, vh: innerHeight,
      scrollH: document.documentElement.scrollHeight,
      keySlot: r(key), legend: r(leg), legendVisible: vis(leg),
      legendPhone: leg ? leg.dataset.phone : null,
      byline: r(document.getElementById('legend-byline')),
      bylineVisible: vis(document.getElementById('legend-byline')),
      lplate: r(document.getElementById('legend-plate')),
      apparatus: r(q('.stage__apparatus')),
      stageMap: r(q('.stage__map')),
      canvas: r(q('.stage__map canvas')),
      time: r(q('.app__time')),
      lede: r(q('.app__lede')),
      legendWords: words(leg),
      bylineWords: words(document.getElementById('legend-byline')),
      totalWords: words(document.getElementById('app')),
      legendControls: leg ? [...leg.querySelectorAll('button,a[href]')].filter(n=>n.getClientRects().length).length : 0,
      controls: ctl.length,
      fontSizes: [...sizes].sort(),
      chips: leg ? [...leg.querySelectorAll('.legend__rib')].map(c => c.innerText.replace(/\s+/g,' ').trim()) : [],
      legendHTMLHead: leg ? leg.className : null,
    };
  });

  const a = await measure();
  log('PLATE ' + JSON.stringify(a, null, 1));
  await shot('plate');

  // stage: working
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900);
  const b = await measure();
  log('WORKING ' + JSON.stringify({ stage: b.stage, legend: b.legend, byline: b.byline, bylineVisible: b.bylineVisible, controls: b.controls, scrollH: b.scrollH, canvas: b.canvas }, null, 1));
  await shot('working');

  await page.evaluate(() => window.BEA && window.BEA.store && window.BEA.store.dispatch('setFilter', { stage: 'apparatus' }));
  await page.waitForTimeout(900);
  const c = await measure();
  log('APPARATUS ' + JSON.stringify({ stage: c.stage, legend: c.legend, byline: c.byline, bylineVisible: c.bylineVisible, apparatus: c.apparatus, canvas: c.canvas, scrollH: c.scrollH, controls: c.controls }, null, 1));
  await shot('apparatus');

  log('ERRORS ' + JSON.stringify(errs));
};
