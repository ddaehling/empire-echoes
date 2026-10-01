/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p03-round2.js — P03's own acceptance test.
 *   node tools/inspect.js tools/scenarios/p03-round2.js --out /tmp/p03 --w 1366 --h 768
 * Prints PASS/FAIL per rule at the viewport given.
 */
const CEIL = { '1920x1080': 170, '1440x900': 158, '1366x768': 146, '1024x640': 130, '390x844': 190 };

module.exports = async ({ page, shot, log }) => {
  const R = [];
  const ok = (id, pass, got, want) => { R.push(`${pass ? 'PASS' : 'FAIL'}  ${id}  got ${got}  (${want})`); return pass; };

  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1500);

  const probe = () => page.evaluate(() => {
    const box = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    const tl = document.querySelector('.tl');
    const time = document.querySelector('.app__time');
    const vis = (root) => [...root.querySelectorAll('button,a[href],select,input,[tabindex]:not([tabindex="-1"])')]
      .filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.bottom > 0 && b.top < innerHeight; });
    const say = document.querySelector('.cx-lede__say');
    const sizes = {};
    if (tl) { const w = document.createTreeWalker(tl, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { if (!n.nodeValue.trim()) continue; const el = n.parentElement; if (!el) continue;
        const b = el.getBoundingClientRect(); if (!b.width || !b.height) continue;
        const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const k = Math.round(parseFloat(cs.fontSize)); sizes[k] = (sizes[k] || 0) + 1; } }
    return {
      vp: innerWidth + 'x' + innerHeight,
      stage: document.getElementById('app').dataset.stage,
      timeBox: box('.app__time'),
      timeH: time ? Math.round(time.getBoundingClientRect().height) : 0,
      tlH: tl ? Math.round(tl.getBoundingClientRect().height) : 0,
      tlScroll: tl ? tl.scrollHeight : 0,
      tlClient: tl ? tl.clientHeight : 0,
      clipped: tl ? tl.scrollHeight - tl.clientHeight : 0,
      controls: tl ? vis(tl).length : 0,
      ctas: tl ? tl.querySelectorAll('.cx-cta').length : 0,
      pills: tl ? tl.querySelectorAll('.chip--warn, .tl__warn.chip, .tl-drawer__toggle').length : 0,
      sizes,
      sayText: say ? say.textContent : null,
      sayEllipsis: say ? /…/.test(say.textContent) : false,
      sayClipped: say ? say.scrollHeight - say.clientHeight : 0,
      sheetOpen: !!document.querySelector('.cx-sheet:not([hidden])'),
      sheetBox: box('.cx-sheet'),
      docScroll: document.documentElement.scrollHeight - innerHeight,
      axisY: box('.tl-ax__rail') ? box('.tl-ax__rail').y : null,
      spineOn: !!document.querySelector('.tl-spine'),
      bands: document.querySelectorAll('.tl-lane').length,
    };
  });

  const p0 = await probe();
  const ceil = CEIL[p0.vp] || 190;
  log('PLATE ' + JSON.stringify(p0));
  ok('P1 time bar height', p0.timeH <= ceil, p0.timeH + 'px', '<= ' + ceil);
  ok('P2 nothing clipped at plate', p0.clipped <= 1, p0.clipped + 'px overflow', '<= 1');
  ok('P3 no cta in the bar', p0.ctas === 0, p0.ctas, '0');
  ok('P4 spine bands at plate', p0.bands >= 4, p0.bands + ' bands', '>= 4');
  ok('P5 type registers in the bar', Object.keys(p0.sizes).length <= 3, JSON.stringify(p0.sizes), '<= 3');
  await shot('plate');

  // ---- working: touch the atlas
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1857));
  await page.waitForTimeout(900);
  const p1 = await probe();
  log('WORKING ' + JSON.stringify(p1));
  ok('P6 working height', p1.timeH <= ceil, p1.timeH + 'px', '<= ' + ceil);
  ok('P7 nothing clipped at working', p1.clipped <= 1, p1.clipped + 'px overflow', '<= 1');
  ok('P8 axis did not move plate->working', p1.axisY === p0.axisY, p1.axisY + ' vs ' + p0.axisY, 'same y');
  ok('P9 no ellipsis in the lede', !p1.sayEllipsis, JSON.stringify((p1.sayText || '').slice(-60)), 'no …');
  await shot('working');

  // ---- apparatus
  await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(700);
  const p2 = await probe();
  log('APPARATUS ' + JSON.stringify(p2));
  ok('P10 apparatus height', p2.timeH <= ceil, p2.timeH + 'px', '<= ' + ceil);
  ok('P11 nothing clipped at apparatus', p2.clipped <= 1, p2.clipped + 'px overflow', '<= 1');
  ok('P12 no doc scroll', p2.docScroll <= 0, p2.docScroll + 'px', '<= 0');
  ok('P12b axis moves at most one row for the uncertainty rail', Math.abs(p2.axisY - p1.axisY) <= 14, p2.axisY + ' vs ' + p1.axisY, 'within 14px');
  await shot('apparatus');

  // ---- the ending
  const end = await page.evaluate(async () => {
    window.BEA.bus.emit('timeline:openClose');
    await new Promise(r => setTimeout(r, 700));
    const sh = document.querySelector('.cx-sheet');
    const body = document.querySelector('.cx-sheet__body');
    const t = document.querySelector('.tl-close');
    return {
      open: !!(sh && !sh.hidden), title: (document.querySelector('.cx-sheet__title') || {}).textContent,
      has: !!t,
      text: t ? t.innerText.slice(0, 2400) : null,
      asks: document.querySelectorAll('.tl-close .cx-ask').length,
      figs: document.querySelectorAll('.tl-close .cx-fig').length,
      blanks: document.querySelectorAll('.tl-close [data-blank]').length,
      h: body ? Math.round(body.getBoundingClientRect().height) : 0,
      w: body ? Math.round(body.getBoundingClientRect().width) : 0,
    };
  });
  log('CLOSE ' + JSON.stringify(end));
  ok('P13 the ending exists', !!end.has, end.has ? 'rendered' : 'missing', 'a close surface');
  ok('P14 the ending is at least 280px', end.h >= 280, end.h + 'px', '>= 280');
  ok('P15 the through-line has blanks', end.blanks >= 4, end.blanks + ' blanks', '>= 4');
  await shot('close');

  log('');
  R.forEach(r => log(r));
  log(R.every(r => r.startsWith('PASS')) ? '>>> P03 holds' : '>>> P03 VIOLATED');
};
