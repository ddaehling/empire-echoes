/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  log('REGISTRY', JSON.stringify(await page.evaluate(() => {
    const r = window.BEA.registry.report();
    return { mounted: r.mounted, failed: r.failed, absent: r.absent, log: (r.log||[]).slice(-6) };
  })));
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'america' }));
  await page.waitForTimeout(1200);
  await shot('ask');
  log('STATE', JSON.stringify(await page.evaluate(() => {
    const s = window.BEA.store.getState();
    const c = document.querySelector('.cmp');
    const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
    return { hash: location.hash, compareYear: s.compareYear, year: s.year, filters: s.filters,
      cmp: !!c, phase: c && c.dataset.phase,
      boxes: { cmp: r('.cmp'), sideA: r('.cmp__side[data-side=a]'), plateA: r('.cmp__plate'), canvasA: r('.cmp__side[data-side=a] canvas'), ask: r('.cmp__ask') } };
  })));
  // commit
  await page.click('.cmp__choice[data-id="a"]');
  await page.waitForTimeout(1200);
  await shot('revealed');
  log('AFTER', JSON.stringify(await page.evaluate(() => {
    const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
    return { hash: location.hash,
      boxes: { sideA: r('.cmp__side[data-side=a]'), sideB: r('.cmp__side[data-side=b]'), cA: r('.cmp__side[data-side=a] canvas'), cB: r('.cmp__side[data-side=b] canvas'), delta: r('.cmp__delta') },
      totals: [...document.querySelectorAll('.cmp__totals')].map(e => e.textContent),
      figs: [...document.querySelectorAll('.cmp__f')].map(e => e.textContent),
      rows: [...document.querySelectorAll('.cmp__row')].slice(0, 8).map(e => e.textContent),
      rowCount: document.querySelectorAll('.cmp__row').length,
      verdict: (document.querySelector('.cmp__verdict')||{}).textContent,
      guess: (document.querySelector('.cmp__guess')||{}).textContent,
    };
  })));
  await shot('revealed-full');
};
