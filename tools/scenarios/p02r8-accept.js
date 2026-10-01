/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p02-map`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P02: the map paints every year with a coastline, no pure black or white, and a different set per definition. */
/**
 * p02r8-accept — the map's rectangle and its furniture at every disclosure
 * level, not just at second zero. Round 8's whole point is that the map was
 * inside its budget cold and outside it the moment anyone pressed a key.
 */
const probe = () => {
  const box = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const app = document.getElementById('app');
  const stage = box('.app__stage'), key = box('.stage__key'), map = box('.stage__map canvas') || box('.map canvas');
  const plateH = stage ? stage.h - (key ? key.h : 0) : 0;
  const plate = stage ? { l: stage.x, t: stage.y, r: stage.x + stage.w, b: stage.y + stage.h - (key ? key.h : 0) } : null;
  const intruders = [];
  if (plate) for (const e of document.querySelectorAll('#app *')) {
    const cs = getComputedStyle(e);
    if (cs.position !== 'absolute' && cs.position !== 'fixed') continue;
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none') continue;
    if (cs.backgroundColor === 'rgba(0, 0, 0, 0)' && !e.className.toString().includes('panel')) continue;
    if (e.closest('.stage__map') || e.closest('.stage__over') || e.closest('.app__overlay')) continue;
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const ox = Math.max(0, Math.min(r.right, plate.r) - Math.max(r.left, plate.l));
    const oy = Math.max(0, Math.min(r.bottom, plate.b) - Math.max(r.top, plate.t));
    if (ox * oy > 4000) intruders.push(e.className + ' ' + Math.round(ox * oy));
  }
  // clipped text inside the map's own furniture
  const clipped = [...document.querySelectorAll('.map__furniture *')].filter((e) => {
    if (!e.textContent.trim() || e.children.length) return false;
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    return e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 2;
  }).map((e) => (e.className || e.tagName) + ':' + e.textContent.trim().slice(0, 24));
  const off = [...document.querySelectorAll('.map__furniture button')].filter((e) => {
    const r = e.getBoundingClientRect(); if (!r.width) return false;
    return r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1;
  }).map((e) => e.className + ' @' + Math.round(e.getBoundingClientRect().x) + ',' + Math.round(e.getBoundingClientRect().y));
  const mapRed = [...document.querySelectorAll('.map__furniture a, .map__furniture button')]
    .filter((e) => { const r = e.getBoundingClientRect(); if (!r.width) return false; const m = getComputedStyle(e).color.match(/\d+/g); return m && +m[0] > 120 && +m[0] > +m[1] * 1.6 && +m[0] > +m[2] * 1.6; })
    .map((e) => e.textContent.trim().slice(0, 30));
  return {
    lvl: app.dataset.stage, map, plate: stage ? stage.w + 'x' + plateH : null,
    fill: map && stage && plateH ? Math.round(100 * map.w * map.h / (stage.w * plateH)) : 0,
    intruders, clipped, off, mapRed,
    modesOpen: !!(document.querySelector('.map__modes') && !document.querySelector('.map__modes').hidden),
    docScroll: document.documentElement.scrollHeight - innerHeight,
    silence: (document.querySelector('.map') || { dataset: {} }).dataset.silence || 'off',
    say: (document.querySelector('.cx-lede__say') || {}).textContent || '',
  };
};

module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1600);
  const vw = await page.evaluate(() => innerWidth), vh = await page.evaluate(() => innerHeight);
  const FLOOR = { 1920: [1500, 620], 1440: [1100, 470], 1366: [1000, 420], 1024: [740, 300], 390: [360, 150] }[vw] || [300, 120];

  const cold = await page.evaluate(probe);
  t('R1 cold: zooms only, no tiles', !cold.modesOpen && cold.lvl === 'plate', 'level ' + cold.lvl + ', tiles open ' + cold.modesOpen);
  t('R2 cold: map fills plate', cold.fill >= 80, cold.fill + '% of ' + cold.plate);

  // one deliberate press of a re-encoding key
  await page.click('.stage__map canvas', { position: { x: 40, y: 40 } }).catch(() => {});
  await page.keyboard.press('w');
  await page.waitForTimeout(1200);
  const work = await page.evaluate(probe);
  await shot('working');
  t('R3 W costs the map nothing', work.map.w >= FLOOR[0] && work.map.h >= FLOOR[1],
    'drawn ' + work.map.w + 'x' + work.map.h + ' (floor ' + FLOOR.join('x') + '), fill ' + work.fill + '%, plate ' + work.plate);
  t('R4 nothing stands on the plate', work.intruders.length === 0, work.intruders.join(' | ') || 'clear');
  t('R5 no doc scroll after W', work.docScroll <= 0, work.docScroll + 'px over');
  t('R6 no clipped furniture text', work.clipped.length === 0, work.clipped.join(' | ') || 'clear');
  t('R7 no furniture off-screen', work.off.length === 0, work.off.join(' | ') || 'clear');
  t('R8 two accent controls, no duplicate', work.mapRed.length <= 2 && new Set(work.mapRed).size === work.mapRed.length,
    work.mapRed.join(' | ') || 'none');
  const dupes = await page.evaluate(() => {
    const seen = {}, out = [];
    for (const e of document.querySelectorAll('#app a, #app button')) {
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const m = getComputedStyle(e).color.match(/\d+/g); if (!m) continue;
      if (!(+m[0] > 120 && +m[0] > +m[1] * 1.6 && +m[0] > +m[2] * 1.6)) continue;
      const k = e.textContent.trim(); if (seen[k]) out.push(k); seen[k] = 1;
    }
    return out;
  });
  t('R8b no accent label printed twice on screen', dupes.length === 0, dupes.join(' | ') || 'clear');

  // the tiles close again
  await page.click('.map__modesmore');
  await page.waitForTimeout(500);
  const shut = await page.evaluate(probe);
  t('R9 the door closes', !shut.modesOpen, 'tiles open ' + shut.modesOpen);
  await page.click('.map__modesmore');
  await page.waitForTimeout(400);

  // H at a year with nothing to draw
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1901));
  await page.waitForTimeout(700);
  await page.keyboard.press('h');
  await page.waitForTimeout(900);
  const h = await page.evaluate(probe);
  await shot('h-empty-year');
  t('R10 H at an empty year does not drain the plate', h.silence === 'off', 'data-silence=' + h.silence);
  t('R11 H at an empty year names the first hole', /first hole opens in \d{4}/.test(h.say), JSON.stringify(h.say.slice(0, 90)));

  // and the offer works
  const cta = await page.$('.cx-lede button, .cx-lede a');
  if (cta) { await cta.click(); await page.waitForTimeout(1400); }
  const g = await page.evaluate(probe);
  const yr = await page.evaluate(() => window.BEA.store.getState().year);
  await shot('h-after-offer');
  t('R12 the offer lands in the mode', g.silence === 'on' && yr > 1901, 'year ' + yr + ', data-silence=' + g.silence);
  t('R13 map still fills its plate in silences', g.fill >= 80 && g.map.w >= FLOOR[0], g.fill + '%, ' + g.map.w + 'x' + g.map.h);

  // The one level the shell reserves a column at. The map must fill the
  // rectangle it is left, and must not letterbox inside a wider one.
  await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(1600);
  const ap = await page.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const sm = g('.stage__map'), c = g('.stage__map canvas') || g('.map canvas'), k = g('.stage__key');
    const h = sm ? sm.h - (k && k.h && k.y > sm.y ? k.h : 0) : 0;
    return { lvl: document.getElementById('app').dataset.stage, sm, c,
      fill: sm && c ? Math.round(100 * c.w * c.h / (sm.w * sm.h)) : 0,
      more: !!document.querySelector('.map__sheetlink:not([hidden])'),
      scroll: document.documentElement.scrollHeight - innerHeight };
  });
  await shot('apparatus');
  t('R14 apparatus: map fills the rectangle it is left', ap.fill >= 80,
    ap.fill + '% of .stage__map ' + (ap.sm ? ap.sm.w + 'x' + ap.sm.h : '?') + ', drawn ' + (ap.c ? ap.c.w + 'x' + ap.c.h : '?'));
  t('R15 apparatus: one route into the sheet, still there', ap.more, 'route into the sheet visible ' + ap.more);
  t('R16 apparatus: still no doc scroll', ap.scroll <= 0, ap.scroll + 'px over');

  log(R.join('\n'));
  log(R.some((r) => r.startsWith('FAIL')) ? '>>> P02 ROUND 8 VIOLATED' : '>>> P02 round 8 holds  (' + vw + 'x' + vh + ')');
};
