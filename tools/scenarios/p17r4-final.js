/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 4 — the final sweep: fold, filter, layers, scrub, frame cost. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const ev = (f, a) => page.evaluate(f, a);

  /* fold and reopen */
  await ev(() => window.BEA.store.dispatch('setPanel', { legend: false }));
  await page.waitForTimeout(500);
  log('folded:', await ev(() => (document.querySelector('.legend__reopen')||{}).textContent || 'MISSING'));
  await page.click('.legend__reopen');
  await page.waitForTimeout(500);
  log('reopened:', await ev(() => !!document.querySelector('.legend__head, .legend--stub')));

  /* the filter path from the corner key (full mode) and from the plate */
  await ev(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(700);
  await ev(() => { window.__f = []; window.BEA.bus.on('legend:filter', p => window.__f.push(p));
    window.__p = []; window.BEA.bus.on('ask:paintUnits', p => window.__p.push({ n: (p.unitIds||[]).length, r: p.reason })); });
  await ev(() => { const b = [...document.querySelectorAll('.lplate__col--a .legend__entry')].find(x => /Protectorate/.test(x.innerText)); b.click(); });
  await page.waitForTimeout(700);
  log('filter events:', JSON.stringify(await ev(() => ({ f: window.__f, p: window.__p,
    state: window.BEA.store.getState().filters }))));
  log('roll open:', await ev(() => !!document.querySelector('.lplate__col--a .legend__roll')));
  await ev(() => { const b = [...document.querySelectorAll('.lplate__col--a .legend__entry')].find(x => /Protectorate/.test(x.innerText)); b.click(); });
  await page.waitForTimeout(500);
  log('after second click, filter:', await ev(() => window.BEA.store.getState().filters.status || null));

  /* layers */
  for (const l of ['tenure', 'mechanism', 'exit', 'informal', 'system']) {
    await ev((ll) => window.BEA.store.dispatch('setLayer', ll), l);
    await page.waitForTimeout(450);
    const r = await ev(() => {
      const b = document.querySelector('#legend-byline [data-field="colour"]');
      return { colour: b && b.textContent.trim().slice(0, 60), defect: !!document.querySelector('.byline__value--defect') };
    });
    log('layer', l, JSON.stringify(r));
  }
  await ev(() => window.BEA.store.dispatch('setLayer', 'status'));
  await page.waitForTimeout(400);

  /* frame cost of this module's own re-render during a scrub */
  const t = await ev(async () => {
    const store = window.BEA.store;
    const start = performance.now();
    const samples = [];
    for (let y = 1700; y <= 1980; y += 4) {
      const a = performance.now();
      store.dispatch('setYear', y);
      store.flush();
      await new Promise(r => requestAnimationFrame(r));
      samples.push(performance.now() - a);
    }
    samples.sort((x, y2) => x - y2);
    return { frames: samples.length, total: Math.round(performance.now() - start),
      median: +samples[Math.floor(samples.length/2)].toFixed(2),
      p95: +samples[Math.floor(samples.length*0.95)].toFixed(2), max: +samples[samples.length-1].toFixed(2) };
  });
  log('SCRUB with the plate open:', JSON.stringify(t));
  await shot('final');
  log('final totals:', await ev(() => document.querySelector('.lplate__rule').innerText.replace(/\s+/g,' ')));
};
