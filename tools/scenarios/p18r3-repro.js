/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P18 round 3 — reproduce the critic's compare-related defects. */
module.exports = async ({ page, log, shot }) => {
  const boot = async (hash) => {
    await page.goto('http://localhost:8777/app/' + (hash || ''), { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
    await page.waitForTimeout(1800);
  };
  const probe = () => page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const txt = (s) => { const e = q(s); return e ? e.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) : null; };
    const box = (s) => { const e = q(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
    const app = document.getElementById('app');
    return {
      hash: location.hash,
      year: window.BEA.store.getState().year,
      compareYear: window.BEA.store.getState().compareYear,
      layer: window.BEA.store.getState().activeLayer,
      stage: app && app.dataset.stage,
      sheet: app && app.dataset.sheet,
      dossier: app && app.dataset.dossier,
      cmpOpen: !!q('.cmp:not([hidden])'),
      cmpBox: box('.cmp'),
      cmpBar: box('.cmp__bar'),
      cmpGrid: box('.cmp__grid'),
      sideA: box('.cmp__side[data-side=a]'),
      sideB: box('.cmp__side[data-side=b]'),
      canvasA: box('.cmp__side[data-side=a] canvas'),
      canvasB: box('.cmp__side[data-side=b] canvas'),
      delta: box('.cmp__delta'),
      ask: box('.cmp__ask'),
      lede: txt('.cx-lede'),
      tlYear: txt('.tl__year, .tl__yr, [class*="year"]'),
      launcher: box('.cmp__launch'),
      docScroll: [document.documentElement.scrollHeight, window.innerHeight],
    };
  });

  // ---------- 1. phone, deep link into a comparison ----------
  await page.setViewportSize({ width: 390, height: 844 });
  await boot('#year=1820&compare=1770');
  log('PHONE deep-link compare: ' + JSON.stringify(await probe(), null, 1));
  await shot('phone-deeplink');

  // ---------- 2. phone, launch by hand from working stage ----------
  await boot('');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1914));
  await page.waitForTimeout(500);
  const l = await page.evaluate(() => { const b = document.querySelector('.cmp__launch'); if (!b) return 'no launcher'; const r = b.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), hidden: b.hidden, vis: getComputedStyle(b).visibility, inView: r.x >= 0 && r.right <= window.innerWidth }; });
  log('PHONE launcher: ' + JSON.stringify(l));
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'peak' }));
  await page.waitForTimeout(900);
  log('PHONE preset peak (ask phase): ' + JSON.stringify(await probe(), null, 1));
  await shot('phone-ask');
  const clicked = await page.evaluate(() => { const b = document.querySelector('.cmp__choice'); if (!b) return false; b.click(); return true; });
  await page.waitForTimeout(900);
  log('PHONE committed=' + clicked + ' ' + JSON.stringify(await probe(), null, 1));
  await shot('phone-revealed');
  // can a finger reach the difference list and the close?
  const reach = await page.evaluate(() => {
    const out = {};
    const c = document.querySelector('.cmp__close');
    if (c) { const r = c.getBoundingClientRect(); out.close = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; out.closeTop = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === c || c.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }
    const rows = document.querySelectorAll('.cmp__row');
    out.rows = rows.length;
    if (rows[0]) { const r = rows[0].getBoundingClientRect(); out.row0 = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }
    const d = document.querySelector('.cmp__delta');
    if (d) out.deltaScroll = [d.scrollHeight, d.clientHeight, getComputedStyle(d).overflowY];
    return out;
  });
  log('PHONE reach: ' + JSON.stringify(reach));

  // ---------- 3. desktop: compare + layers at once ----------
  await page.setViewportSize({ width: 1366, height: 768 });
  await boot('');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1914));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'peak', reveal: true }));
  await page.waitForTimeout(900);
  log('DESKTOP compare open: ' + JSON.stringify(await probe(), null, 1));
  // now open the layers sheet
  const layersBtn = await page.evaluate(() => {
    const bs = [...document.querySelectorAll('button, a')];
    const b = bs.find(x => /^\s*Layers?\s*$/i.test(x.textContent) || /layer/i.test(x.className));
    if (!b) return null; b.click(); return b.className + ' | ' + b.textContent.trim().slice(0, 30);
  });
  await page.waitForTimeout(1000);
  log('clicked layers control: ' + layersBtn);
  log('DESKTOP after layers: ' + JSON.stringify(await probe(), null, 1));
  await shot('desktop-both');

  // ---------- 4. compare open, then a tour beat moves the year ----------
  await boot('');
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { a: 1914, b: 1922, reveal: true }));
  await page.waitForTimeout(900);
  const b4 = await probe();
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1655));
  await page.waitForTimeout(800);
  const a4 = await probe();
  log('YEAR HIJACK before: year=' + b4.year + ' cmp=' + b4.compareYear + ' labels=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.cmp__year')].map(e => e.textContent))));
  log('YEAR HIJACK after setYear(1655): year=' + a4.year + ' cmp=' + a4.compareYear + ' labels=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.cmp__year')].map(e => e.textContent))) + ' lede=' + a4.lede);
  await shot('year-hijack');

  // ---------- 5. does compare restore itself on a fresh load? ----------
  await page.evaluate(() => { try { return Object.keys(localStorage).filter(k => /comp/i.test(k)); } catch (e) { return []; } });
  const ls = await page.evaluate(() => Object.keys(localStorage).map(k => k + ' = ' + String(localStorage.getItem(k)).slice(0, 120)));
  log('localStorage:\n' + ls.join('\n'));
  await boot('');
  log('FRESH LOAD (no hash): ' + JSON.stringify(await probe(), null, 1));
};
