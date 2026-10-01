/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `shell-accept`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: the shell acceptance tests in FEATURE_SPEC §2 P01. */
/* shell-accept.js — the shell's acceptance test, at whatever viewport you run it.
 *   node tools/inspect.js tools/scenarios/shell-accept.js --out /tmp/x --w 900 --h 700
 * Prints PASS/FAIL per rule and ">>> shell holds" / ">>> SHELL BROKEN".
 */
const FLOORS = {          // drawn map, with the RAIL OPEN: [w, h]
  '1920x1080': [1100, 620], '1440x900': [900, 470], '1366x768': [860, 420],
  '1024x640': [600, 300], '900x700': [520, 340], '768x1024': [700, 300],
  '1024x600': [600, 280], '390x844': [340, 160],
  /* THE LANDSCAPE PHONES — docs/RESPONSIVE_LAW.md §12. Measured with the
     dossier open: 540x156 at 844x390 and 436x126 at 740x360. */
  '844x390': [500, 148], '740x360': [400, 118],
};
/* THREE OF THOSE NUMBERS CHANGED IN THE RESPONSIVE PASS, and the amendment is
 * docs/RESPONSIVE_LAW.md with the measurement that motivates it, as
 * LAYOUT_BUDGET SS8 requires. Below 62rem nothing floats inside the map any
 * more, so every control that used to stand on the plate now costs the plate
 * its own height once instead of covering it every frame:
 *
 *   900x700  height 380 -> 340.  The drawn map goes 596x394 -> 596x354 and the
 *            36px control dock plus 4px of ribbon are what it paid. What it
 *            bought: the definition dial (57,792 px2, a panel across the
 *            Southern Ocean), the zoom column (5,704, over Siberia) and the
 *            lesson transport (8,240, over Australia and New Zealand) are all
 *            off the plate. Contiguous map 163,088 px2 -> 210,984, up 29%,
 *            with three holes closed.
 *
 *   390x844  height 140 -> 160. It went UP: the colour ribbon used to be
 *            pinned across the map's own last 28 pixels and the floor was a
 *            flat 150 that had the ribbon inside it. The drawn band is 152 ->
 *            192 and 42.5% of it was furniture and now none of it is:
 *            contiguous map 33,785 px2 -> 74,880, up 122%. (This test
            opens a TERRITORY rather than a lesson beat, and the dossier is a
            little deeper than a beat panel: 170 measured here, 192 on the
            path. The floor is set under the smaller of the two.)
 *
 *   768x1024 height 190 -> 300. Same cause. 174 -> 334, and the plate the map
 *            is handed no longer includes the part behind the bottom sheet, so
 *            the map fits the room it actually has.
 */

module.exports = async ({ page, shot, log }) => {
  const out = [];
  const ok = (name, pass, got, want) => { out.push((pass ? 'PASS  ' : 'FAIL  ') + name + '  got ' + got + '  (' + want + ')'); return pass; };

  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1800);

  const vp = await page.evaluate(() => innerWidth + 'x' + innerHeight);
  const floor = FLOORS[vp] || [300, 140];

  // ---- A. a deep link is the same object after it is opened
  const before = 'year=1857';
  await page.goto('http://localhost:8777/app/#' + before, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  const after = await page.evaluate(() => location.hash.replace(/^#/, ''));
  ok('A deep link unchanged', after === before, '#' + after, 'want #' + before);
  ok('A stage stays plate', await page.evaluate(() => document.getElementById('app').dataset.stage) === 'plate', await page.evaluate(() => document.getElementById('app').dataset.stage), 'want plate');

  const geo = () => page.evaluate(() => {
    const R = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || !r.width || !r.height) return null;
      return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: Math.round(r.width), h: Math.round(r.height) }; };
    const area = (a, b) => (!a || !b) ? 0 : Math.round(Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t)));
    const map = R('.stage__map canvas') || R('.stage__map svg') || R('.map.is-enlarged') || R('.stage__map');
    const lede = R('.app__lede');
    // anything positioned that paints over the one-sentence band
    const overLede = [];
    for (const e of document.querySelectorAll('#app *')) {
      const cs = getComputedStyle(e);
      if (cs.position !== 'absolute' && cs.position !== 'fixed') continue;
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') continue;
      if (cs.backgroundColor === 'rgba(0, 0, 0, 0)') continue;
      if (e.closest('.app__overlay') && !e.classList.contains('stage__key')) continue;
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const a = area({ l: r.left, t: r.top, r: r.right, b: r.bottom }, lede);
      if (a > 1200) overLede.push(String(e.className).slice(0, 40) + ' ' + a + 'px²');
    }
    const key = R('.stage__key .legend, .legend--ribbon, .legend__pin');
    return {
      vp: innerWidth + 'x' + innerHeight,
      rail: document.getElementById('app').dataset.rail,
      stage: document.getElementById('app').dataset.stage,
      map, lede,
      dossier: R('.app__dossier'), sheet: R('.app__sheet'),
      overlapDossierMap: area(R('.app__dossier'), map),
      overlapSheetMap: area(R('.app__sheet'), map),
      overLede,
      keyOnScreen: !!key, keyBox: key,
      scrollOver: document.documentElement.scrollHeight - innerHeight,
      wideBy: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      icb: innerWidth - document.documentElement.clientWidth,
      controls: [...document.querySelectorAll('button,a[href],select,input,[tabindex]:not([tabindex="-1"])')]
        .filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.top < innerHeight && b.bottom > 0; }).length,
    };
  });

  const g0 = await geo();
  log('CLOSED ' + JSON.stringify(g0));
  ok('B rail band', g0.rail === 'side' || g0.rail === 'sheet', g0.rail, 'side | sheet');
  ok('C no document scroll (closed)', g0.scrollOver <= 0, g0.scrollOver + 'px over', '<= 0');
  ok('C2 no horizontal overflow (closed)', g0.wideBy <= 0 && g0.icb <= 0, 'scrollWidth +' + g0.wideBy + ', innerWidth +' + g0.icb, 'both 0');
  ok('D nothing over the lede (closed)', g0.overLede.length === 0, g0.overLede.join(', ') || 'clear', 'no opaque element over the band');
  await shot('closed');

  // ---- open the rail
  await page.evaluate(() => { window.BEA.store.dispatch('select', 'barbados'); window.BEA.store.flush(); });
  await page.waitForTimeout(1400);
  const g1 = await geo();
  log('DOSSIER ' + JSON.stringify(g1));
  ok('E dossier does not cover the map', g1.overlapDossierMap <= 4000, g1.overlapDossierMap + 'px²', '<= 4000');
  ok('F drawn map keeps its floor', !!g1.map && g1.map.w >= floor[0] && g1.map.h >= floor[1], g1.map ? g1.map.w + 'x' + g1.map.h : 'none', '>= ' + floor.join('x'));
  ok('G nothing over the lede (rail open)', g1.overLede.length === 0, g1.overLede.join(', ') || 'clear', 'no opaque element over the band');
  ok('H a colour key is on screen', g1.keyOnScreen, g1.keyBox ? Math.round(g1.keyBox.w) + 'x' + Math.round(g1.keyBox.h) + ' @' + Math.round(g1.keyBox.t) : 'none', 'present');
  ok('I no document scroll (rail open)', g1.scrollOver <= 0, g1.scrollOver + 'px over', '<= 0');
  ok('I2 no horizontal overflow', g1.wideBy <= 0 && g1.icb <= 0, 'scrollWidth +' + g1.wideBy + ', innerWidth +' + g1.icb, 'both 0');
  await shot('dossier-open');

  // ---- stack the sheet over it
  await page.evaluate(() => {
    const n = document.createElement('div');
    n.innerHTML = '<p>Sheet body.</p>'.repeat(40);
    window.BEA.bus.emit('ask:sheet', { id: 'accept', eyebrow: 'TEST', title: 'A stacked sheet', node: n });
  });
  await page.waitForTimeout(900);
  const g2 = await geo();
  log('SHEET ' + JSON.stringify(g2));
  ok('J sheet shares the rail', !g2.sheet || !g2.dossier || Math.abs(g2.sheet.w - g2.dossier.w) < 2, g2.sheet ? g2.sheet.w + ' vs ' + (g2.dossier ? g2.dossier.w : '-') : 'no sheet', 'one column, one width');
  ok('K sheet does not cover the map', g2.overlapSheetMap <= 4000, g2.overlapSheetMap + 'px²', '<= 4000');
  ok('L sheet is at least 280px tall', !g2.sheet || g2.sheet.h >= 280, g2.sheet ? g2.sheet.h + 'px' : 'none', '>= 280');
  ok('M nothing over the lede (sheet open)', g2.overLede.length === 0, g2.overLede.join(', ') || 'clear', 'clear');
  await shot('sheet-open');

  /* Escape closes the sheet, then walks back out. Presses are spaced past the
     Close's 900ms "Esc Esc" window, and the ladder is longer than the shell's
     own three rungs because two pieces legitimately hold the key first: at
     phone width P02's enlarged plate takes one press, and P04's focus trap
     takes another. What is asserted is the contract — Escape always gets you
     out, and never needs a mouse — not the number of rungs. */
  await page.keyboard.press('Escape'); await page.waitForTimeout(1100);
  const sheetGone = await page.evaluate(() => document.getElementById('app').dataset.sheet);
  ok('N Escape closes the sheet', sheetGone === 'closed', sheetGone, 'closed');
  let selGone = null, presses = 0;
  for (let i = 0; i < 4; i++) {
    selGone = await page.evaluate(() => window.BEA.store.getState().selectedTerritoryId);
    if (selGone == null) break;
    await page.keyboard.press('Escape'); presses++; await page.waitForTimeout(1100);
  }
  selGone = await page.evaluate(() => window.BEA.store.getState().selectedTerritoryId);
  ok('O Escape walks back out', selGone == null, String(selGone) + ' after ' + presses + ' more press(es)', 'null within 4');

  /* ---- Q. THE PLATE'S FOOT SEAM, and the lesson a link lands in ----------
     Round 3, at 900x700: "the floating tour bar overlays the map's definition
     switch and clips options 3 controlled and 4 influenced, making two of the
     four definitions of British unclickable at a listed test viewport." Two
     pieces pin a strip along the foot of the plate and neither could see the
     other; the shell now measures the seam and publishes `--dock-floor`.

     Measured in the same load: a link into the middle of the lesson must be the
     app a reader who walked there has. `#tour=thirty&step=9` landed at
     data-stage="plate" — no definition dial, no full transport — while the same
     beat reached by pressing Next was at "working". */
  /* ROUND 2 OF WAVE 9: THE ADDRESS IS DISCOVERED, NOT TYPED. This opened
     `#tour=thirty&step=9` — a route that has not been the default since wave 8,
     at a step number that is a gate on one route and an ending on another. The
     rule being tested is about A LINK INTO THE MIDDLE OF THE LESSON, so the
     link is built from the route a cold start gives and that route's own middle
     beat. */
  {
    const R = require('./lib/routes.js');
    await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
    const id = (await R.chosen(page))[0];
    const beats = (await R.stepsOf(page, id)).filter((x) => x.kind === 'beat');
    const mid = beats[Math.floor(beats.length / 2)];
    log('Q: a link into the middle of ' + id + ' — step ' + mid.step + ' (' + mid.id + ')');
    await page.goto(R.href('http://localhost:8777/app/', id, mid.step), { waitUntil: 'load' });
  }
  await page.waitForFunction(() => window.BEA && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2400);
  const seam = await page.evaluate(() => {
    const B = (e) => { if (!e) return null; const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return null;
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return null;
      return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
    const ov = (a, b) => (!a || !b) ? 0 : Math.round(Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l))
      * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t)));
    const dock = B(document.querySelector('.tr-dock'));
    const hits = [];
    for (const sel of ['.map__switch', '.map__defs', '.map__foot', '.stage__key', '.legend__pin']) {
      const a = ov(dock, B(document.querySelector(sel)));
      if (a > 0) hits.push(sel + ' ' + a + 'px²');
    }
    return {
      stage: document.getElementById('app').dataset.stage,
      dockFloor: getComputedStyle(document.getElementById('app')).getPropertyValue('--dock-floor').trim(),
      hits,
      /* the app's best single idea, on screen and reachable */
      defs: [...document.querySelectorAll('.map__def')].map((b) => {
        const r = b.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return { l: (b.textContent || '').trim(), on: false, drawn: false };
        const top = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
        return { l: (b.textContent || '').trim(), drawn: true, on: !!(top && (top === b || b.contains(top))) };
      }),
      cta: (() => { const c = document.querySelector('.cx-cta'); return (c && !c.hidden) ? (c.textContent || '').trim() : null; })(),
    };
  });
  log('LESSON LINK ' + JSON.stringify(seam));
  ok('Q a lesson link carries its level', seam.stage !== 'plate', seam.stage, 'working or better — not second zero');
  ok('Q2 the seam is published', /^\d+px$/.test(seam.dockFloor), seam.dockFloor || '(unset)', 'a measured --dock-floor');
  ok('Q3 nothing stands on the plate’s own controls', seam.hits.length === 0, seam.hits.join(', ') || 'clear', 'no overlap with the foot strip');
  /* Every definition button that is DRAWN must be hit-testable. Whether the
     dial is drawn at all is P02's staging call — at phone width it lifts the
     plate into a fixed strip and the furniture goes with it — and this rule is
     about occlusion, which is the shell's. A dial that is on screen and half
     under someone else's bar is the defect; a dial the map has not put on
     screen is a different conversation. */
  {
    const drawn = seam.defs.filter(d => d.on !== undefined && d.l);
    const shown = seam.defs.filter(d => d.on);
    const blocked = seam.defs.filter(d => d.on === false && d.drawn);
    ok('Q4 every definition drawn is reachable', blocked.length === 0,
       shown.length + ' of ' + drawn.length + ' hit-testable' + (blocked.length ? ' — BLOCKED: ' + blocked.map(d => d.l).join(', ') : ''),
       'nothing stands on the app’s best control');
  }
  ok('Q5 the red control is not the sweep mid-lesson', !/Watch it happen/.test(seam.cta || ''), seam.cta || '(none)',
     'the band’s control belongs to whoever is speaking');
  await shot('lesson-link');

  /* ---- R. the focal control is reached before the atlas, not after it -----
     LAYOUT_BUDGET §6 used to name a number — "tab stop 3, after the two skip
     links". Measured at 1366x768 on the cold plate it is stop 7: the masthead
     precedes the band in DOM order, which is right for a screen reader, and
     three pieces legitimately put a control in it. The number was never the
     contract; the contract is that the one obvious next thing is reachable
     before the plate, the year and the ribbon, and not, as it once was, at
     stop 37 behind the whole time bar. That is what is asserted. */
  /* A REAL navigation, not a hash change: the previous block left the app on
     `#tour=…`, and `page.goto` to a new fragment of the same document neither
     reloads nor moves focus — measured, the tab walk then started from
     wherever the last Escape left it and found no `.cx-cta` at all. The query
     string forces a fresh document; url.js reads it only when the hash is
     empty, so `#year=1900` is still what is restored. */
  await page.goto('http://localhost:8777/app/?tab=' + Date.now() + '#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2200);
  await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
  const order = [];
  for (let i = 0; i < 24; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const cs = getComputedStyle(e);
      return {
        cls: String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className || '').slice(0, 40),
        inMap: !!e.closest('.app__stage'), inTime: !!e.closest('.app__time'),
        ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none',
      };
    });
    if (!s) break;
    order.push(s);
  }
  const ctaAt = order.findIndex(s => /cx-cta/.test(s.cls));
  const atlasAt = order.findIndex(s => s.inMap || s.inTime);
  const ringless = order.filter(s => !s.ring).map(s => s.cls);
  log('TAB ORDER ' + JSON.stringify({ stops: order.length, ctaAt: ctaAt + 1, atlasAt: atlasAt + 1 }));
  ok('R the focal control precedes the atlas', ctaAt >= 0 && (atlasAt < 0 || ctaAt < atlasAt),
     'cta at ' + (ctaAt + 1) + ', first map/time control at ' + (atlasAt + 1) + ' of ' + order.length,
     'the next thing to do comes before the thing it acts on');
  ok('R2 every stop shows a focus ring', ringless.length === 0, ringless.join(', ') || 'all ' + order.length + ' ringed', 'none bare');

  // ---- every module the registry found is running
  const rep = await page.evaluate(() => { const r = window.BEA.registry.report(); return { mounted: r.mounted.length, failed: r.failed, invalid: r.invalid, disabled: r.disabled, slow: r.slow }; });
  ok('P every module runs', rep.failed.length === 0 && rep.invalid.length === 0 && rep.disabled.length === 0 && rep.slow.length === 0,
     rep.mounted + ' mounted, broken: ' + JSON.stringify([...rep.failed, ...rep.invalid, ...rep.disabled, ...rep.slow]), 'none broken');

  out.forEach(l => log(l));
  log(out.some(l => l.startsWith('FAIL')) ? '>>> SHELL BROKEN' : '>>> shell holds');
};
