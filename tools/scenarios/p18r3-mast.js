/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  const boot = async (hash) => {
    await page.goto('http://localhost:8777/app/' + (hash || ''), { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
    await page.waitForTimeout(1600);
  };
  await page.setViewportSize({ width: 390, height: 844 });
  await boot('');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1914));
  await page.waitForTimeout(600);
  log('MASTHEAD 390: ' + JSON.stringify(await page.evaluate(() => {
    const bar = document.querySelector('.app__bar, header, .mx');
    const walk = (n, d) => { const out = []; for (const c of n.children) { const r = c.getBoundingClientRect(); if (r.width) out.push({ cls: c.className.toString().slice(0, 40), x: Math.round(r.x), r: Math.round(r.right), w: Math.round(r.width), t: c.textContent.replace(/\s+/g, ' ').trim().slice(0, 24) }); if (d > 0) out.push(...walk(c, d - 1)); } return out; };
    return { bar: bar && bar.className, vw: window.innerWidth, kids: walk(bar, 1) };
  }), null, 1));
  // dossier + compare at 390
  await page.evaluate(() => window.BEA.store.dispatch('select', 'bengal'));
  await page.waitForTimeout(800);
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'peak', reveal: true }));
  await page.waitForTimeout(1000);
  log('DOSSIER+COMPARE 390: ' + JSON.stringify(await page.evaluate(() => {
    const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), getComputedStyle(e).zIndex, getComputedStyle(e).position]; };
    return { app: document.getElementById('app').dataset.dossier, rail: document.getElementById('app').dataset.rail, cmp: b('.cmp'), doss: b('.app__dossier'), sideA: b('.cmp__side[data-side=a]'), delta: b('.cmp__delta') };
  })));
  await shot('doss-cmp-390');
  // 900x700
  await page.setViewportSize({ width: 900, height: 700 });
  await boot('#year=1914&compare=1922&filter=cmp:peak,cmpr:1,stage:working');
  await shot('900-cmp');
  log('900x700: ' + JSON.stringify(await page.evaluate(() => {
    const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
    const d = document.querySelector('.cmp__delta');
    return { cmp: b('.cmp'), sideA: b('.cmp__side[data-side=a]'), canvasA: b('.cmp__side[data-side=a] canvas'), delta: b('.cmp__delta'), deltaScroll: d && [d.scrollHeight, d.clientHeight], row0: b('.cmp__row'), title: (document.querySelector('.cmp__title')||{}).textContent, picks: [...document.querySelectorAll('.cmp__pick')].map(e=>{const r=e.getBoundingClientRect();return [e.textContent, Math.round(r.x), Math.round(r.right)];}) };
  }), null, 1));
  // 1440x900
  await page.setViewportSize({ width: 1440, height: 900 });
  await boot('#year=1914&compare=1922&filter=cmp:peak,cmpr:1,stage:working');
  await shot('1440-cmp');
  log('1440x900: ' + JSON.stringify(await page.evaluate(() => {
    const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
    const d = document.querySelector('.cmp__delta');
    return { canvasA: b('.cmp__side[data-side=a] canvas'), delta: b('.cmp__delta'), deltaScroll: d && [d.scrollHeight, d.clientHeight], row0: b('.cmp__row') };
  })));
};
