/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P18 r3 — the year on screen is single-valued, and one teaching panel at a time. */
module.exports = async ({ page, log, shot }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  const boot = async (hash) => {
    await page.goto('http://localhost:8777/app/' + (hash || ''), { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
    await page.waitForTimeout(1700);
  };
  const st = () => page.evaluate(() => {
    const s = window.BEA.store.getState();
    const app = document.getElementById('app');
    return {
      year: s.year, compareYear: s.compareYear, layer: s.activeLayer, hash: location.hash,
      sheet: app.dataset.sheet, cmpOpen: !!document.querySelector('.cmp:not([hidden])'),
      labs: [...document.querySelectorAll('.cmp__year')].map(e => e.textContent),
      lede: (document.querySelector('.cx-lede') || {}).textContent && document.querySelector('.cx-lede').textContent.replace(/\s+/g, ' ').trim().slice(0, 130),
      verdict: (document.querySelector('.cmp__verdict') || {}).textContent,
      tlYear: (document.querySelector('.tl__year, .tl__now, [class*="tl__yr"]') || {}).textContent,
    };
  });

  // 1. a tour/timeline year move under an open comparison
  await boot('');
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { a: 1914, b: 1922, reveal: true }));
  await page.waitForTimeout(900);
  const a = await st();
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1655));
  await page.waitForTimeout(900);
  const b = await st();
  t('D1 an outside year move closes the comparison', a.cmpOpen && !b.cmpOpen && b.compareYear === null && b.year === 1655,
    `open at ${a.labs.join('/')} → setYear(1655) → open=${b.cmpOpen}, compareYear=${b.compareYear}, plates=${JSON.stringify(b.labs)}`);
  t('D1 and it says why', /One map again/.test(b.lede || ''), (b.lede || '').slice(0, 110));
  await shot('d1-single-year');

  // 2. compare's own year change does NOT close it
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'america' }));
  await page.waitForTimeout(900);
  const c = await st();
  t('D2 compare may set its own years', c.cmpOpen && c.year === 1770 && c.compareYear === 1820, JSON.stringify([c.year, c.compareYear, c.cmpOpen]));

  // 3. a deep link is not an "outside" move
  await boot('#year=1820&compare=1770&filter=cmp:america,cmpr:1,stage:working');
  const d = await st();
  t('D3 a deep link survives hydration', d.cmpOpen && d.labs.join('/') === '1770/1820' && d.year === 1820,
    `hash ${d.hash} → plates ${d.labs.join('/')}, store year ${d.year}, compareYear ${d.compareYear}`);

  // 4. Back after opening a comparison
  await boot('');
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'peak', reveal: true }));
  await page.waitForTimeout(900);
  await page.goBack();
  await page.waitForTimeout(1200);
  const e = await st();
  t('D4 Back leaves the comparison', !e.cmpOpen && e.compareYear === null, `hash ${e.hash}, open=${e.cmpOpen}`);

  // 5. one teaching panel: open the layers sheet, then compare
  await boot('');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.BEA.bus.emit('ask:layerKey', { open: true }));
  await page.waitForTimeout(900);
  const f = await st();
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'peak', reveal: true }));
  await page.waitForTimeout(1000);
  const g = await st();
  t('D5 opening the comparison closes the open sheet', f.sheet === 'open' && g.sheet === 'closed' && g.cmpOpen,
    `sheet ${f.sheet} → ${g.sheet}, compare open=${g.cmpOpen}`);
  // and the other way round
  await page.evaluate(() => window.BEA.bus.emit('ask:layerKey', { open: true }));
  await page.waitForTimeout(1000);
  const h = await st();
  t('D5 opening a sheet closes the comparison', h.sheet === 'open' && !h.cmpOpen, `sheet ${h.sheet}, compare open=${h.cmpOpen}`);
  await shot('d5-one-panel');

  // 6. a scripted verdict is never printed over a pair it was not written for
  await boot('#year=1900&compare=1930&filter=cmp:peak,cmpr:1,stage:working');
  const i = await st();
  t('D6 a mismatched preset is dropped, not printed', i.labs.join('/') === '1900/1930' && !/mandates: Palestine/.test(i.verdict || ''),
    `plates ${i.labs.join('/')}, verdict "${(i.verdict || '(computed, no scripted verdict)').slice(0, 80)}"`);

  // 7. the displaced sheet comes back when the comparison closes (shell handshake)
  await boot('');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.BEA.bus.emit('ask:layerKey', { open: true }));
  await page.waitForTimeout(900);
  const j0 = await st();
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'peak', reveal: true }));
  await page.waitForTimeout(1000);
  const j1 = await st();
  await page.evaluate(() => window.BEA.bus.emit('compare:close', {}));
  await page.waitForTimeout(1100);
  const j2 = await st();
  t('D7 the sheet the comparison displaced is put back', j0.sheet === 'open' && j1.sheet === 'closed' && !j1.cmpOpen === false && j2.sheet === 'open' && !j2.cmpOpen,
    `sheet ${j0.sheet} → compare opens → ${j1.sheet} → compare closes → ${j2.sheet}`);

  // 8. the same-year comparison (two definitions of "British") on a phone
  await page.setViewportSize({ width: 390, height: 844 });
  await boot('#year=1860&compare=1860&filter=cmp:informal,cmpr:1,stage:working');
  const k = await page.evaluate(() => ({
    labs: [...document.querySelectorAll('.cmp__lab')].map(e => e.textContent.replace(/\s+/g, ' ').trim()),
    same: document.querySelector('.cmp').dataset.same,
    head: (document.querySelector('.cmp__head .cx-panel__head') || {}).textContent,
    caution: (document.querySelector('.cmp__caution') || {}).textContent,
    empties: [...document.querySelectorAll('.cmp__empty')].map(e => e.textContent),
    rows: document.querySelectorAll('.cmp__row').length,
  }));
  t('D8 same year, two definitions, on a phone', k.labs.length === 2 && /claimed/.test(k.labs[0]) && /influenced/.test(k.labs[1]) && k.same === 'year' && k.rows > 0,
    `${k.labs.join(' | ')} · ${k.rows} rows · head "${k.head}"`);
  t('D8 the argument is labelled as an argument', /argument, not a measurement/.test(k.caution || ''), (k.caution || '').slice(0, 90));
  await shot('d8-informal-phone');

  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> P18 SINGLE-VALUE BROKEN' : '>>> single-value holds');
};
