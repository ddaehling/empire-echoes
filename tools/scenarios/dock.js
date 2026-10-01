/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `dock`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: RESPONSIVE_LAW: what stands ON the map — the band, its controls and their targets. */
/**
 * dock.js — the executable form of docs/RESPONSIVE_LAW.md.
 *
 * WHY IT EXISTS. `budget.js` asserts LAYOUT_BUDGET B5 — "nothing stands on the
 * plate" — and then exempts `.stage__map`, `.stage__over` and `.app__overlay`,
 * because those are the three layers B5 names. Every floating control in this
 * application lives in the third one. So B5 has never once been able to see
 * the transport, the map's zoom cluster, the map's definition dial or the
 * pinned colour ribbon, and all four of them were standing on the map at every
 * viewport under 62rem. Measured on the build immediately before this pass,
 * inside a mounted lesson beat:
 *
 *   390x844 beat 9   map band 390x150   zooms 5,712 + transport 8,240
 *                                       + ribbon 10,920  =  42.5 % COVERED
 *   900x700 beat 1   plate 596x394      dial 57,792 + zooms 5,704
 *                                       + transport 8,240 =  30.5 % COVERED
 *   768x1024 beat 1  map band 768x174   zooms 5,712 + transport 8,240
 *                                                        =  10.4 % COVERED
 *
 * This file measures the DRAWN MAP — the canvas, not the rectangle reserved
 * for it — and sums the area of everything positioned that overlaps it, with
 * no exemptions at all except the pointer-transparent layers themselves and
 * the map's own hover card. Below 62rem the answer must be 0.
 *
 * It cold-loads into a beat, because every defect it exists to catch survives
 * a resize and appears only on first paint, and then walks the path.
 *
 *   node tools/inspect.js tools/scenarios/dock.js --out /tmp/d390  --mobile
 *   node tools/inspect.js tools/scenarios/dock.js --out /tmp/d768  --w 768  --h 1024
 *   node tools/inspect.js tools/scenarios/dock.js --out /tmp/d900  --w 900  --h 700
 *   node tools/inspect.js tools/scenarios/dock.js --out /tmp/d1024 --w 1024 --h 640
 *   node tools/inspect.js tools/scenarios/dock.js --out /tmp/d1366 --w 1366 --h 768
 *   node tools/inspect.js tools/scenarios/dock.js --out /tmp/d1440 --w 1440 --h 900
 *   node tools/inspect.js tools/scenarios/dock.js --out /tmp/d1920 --w 1920 --h 1080
 *
 * It prints PASS/FAIL per rule and `>>> the dock law holds` / `>>> DOCK LAW BROKEN`.
 */

/* vw x vh : the clean, contiguous map band the law promises inside a beat.
   These are floors on the DRAWN canvas, with a teaching panel open, with
   nothing on top of it. Measured on the build this file ships with:
   390 -> 390x192, 768 -> 768x240, 900 -> 596x354. */
const BAND = {
  '390x844':  [360, 176],
  '768x1024': [700, 220],
  '900x700':  [560, 330],
};

/* WAVE 9 — ROUTE-AWARE. This was `const STEPS = [1, 4, 9, 14, 23]` walked at
   `#tour=thirty`, and `thirty` has not been the default since wave 8. Step 23
   does not exist on three of the five published routes and lands on a different
   surface on each of the others, so `step 23 D2 Next is reachable` was a rule
   about one page number on one path nobody is given. The routes and their steps
   come from the payload the app publishes; the sample is taken by KIND through
   `lib/routes.sample()`, so it means the same thing on a five-step route and a
   twenty-five-step one. `--route <id>` / `--route default` narrows it. */
const routes = require('./lib/routes.js');

module.exports = async ({ page, shot, log, url }) => {
  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');

  const read = () => page.evaluate(() => {
    const app = document.getElementById('app');
    const cs = getComputedStyle(app);
    const vis = (e) => {
      if (!e) return false;
      const c = getComputedStyle(e);
      if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false;
      const r = e.getBoundingClientRect();
      return r.width > 2 && r.height > 2;
    };
    const box = (s) => { const e = document.querySelector(s); if (!vis(e)) return null; const r = e.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(r.right), b: Math.round(r.bottom) }; };

    /* THE DRAWN MAP, not the rectangle it was given. The two are different
       numbers — at 390x844 the map letterboxes 192px of world into a 472px
       rectangle — and the one a student looks at is this one. */
    let drawn = null;
    const clipBox = document.querySelector('.stage__map');
    const clip = clipBox ? clipBox.getBoundingClientRect() : null;
    for (const sel of ['.map.is-enlarged canvas', '.stage__map canvas', '.stage__map svg', '.stage__map']) {
      const n = document.querySelector(sel);
      if (!vis(n)) continue;
      const r = n.getBoundingClientRect();
      if (r.width <= 40 || r.height <= 40) continue;
      /* THE VISIBLE MAP, not the canvas. `.stage__map` clips in the sheet
         band, so a canvas that overflows its own rectangle is not on screen
         where it overflows and must not be measured as if it were. */
      let x = r.left, y = r.top, rr = r.right, bb = r.bottom;
      if (clip && !n.classList.contains('is-enlarged') && !n.closest('.map.is-enlarged')) {
        x = Math.max(x, clip.left); y = Math.max(y, clip.top);
        rr = Math.min(rr, clip.right); bb = Math.min(bb, clip.bottom);
      }
      drawn = { x, y, r: rr, b: bb, w: Math.round(rr - x), h: Math.round(bb - y), node: n,
                enlarged: !!n.closest('.map.is-enlarged') };
      break;
    }

    const over = [];
    if (drawn) {
      for (const e of document.querySelectorAll('body *')) {
        if (!vis(e)) continue;
        const c = getComputedStyle(e);
        if (c.position !== 'fixed' && c.position !== 'absolute') continue;
        /* The three things that are the map, or are transparent to it. A layer
           that takes no pointer and paints nothing is not standing on anything;
           its CHILDREN are still measured, one at a time, below. */
        if (e.closest('.stage__map')) continue;
        /* AN ANCESTOR OF THE MAP IS THE MAP. At phone width P02 lifts the
           plate out of the stage into a fixed block (`.map.is-enlarged`) so a
           bottom sheet cannot bury it; that block CONTAINS the canvas being
           measured, so without this it reported itself as standing on itself,
           64,350 px2 of it, under reduced motion at 390x844. */
        if (drawn.node && (e.contains(drawn.node) || e === drawn.node)) continue;
        if (e.classList.contains('stage__over') || e.classList.contains('app__overlay')
          || e.classList.contains('map__furniture') || e.classList.contains('map__targets')
          || e.classList.contains('map__tiplayer')) continue;
        /* The hover card is the map speaking, not furniture standing on it: it
           takes no pointer, it follows the pointer, and it exists only while
           the pointer is over the map. */
        if (e.closest('.map__tiplayer')) continue;
        if (c.pointerEvents === 'none' && !e.querySelector('*')) continue;
        /* A BOX THAT PAINTS NOTHING CANNOT COVER ANYTHING. `.stage__over` is
           the map's own overlay slot and B5 names it: the data layers drawn in
           it (`.ly-layer` and the like) are congruent with the plate, have no
           ground of their own, and are the map speaking rather than furniture
           standing on it. Their children are still scanned one at a time, so
           an opaque card parked in that layer is still caught. */
        const paints = (c.backgroundColor && c.backgroundColor !== 'rgba(0, 0, 0, 0)' && c.backgroundColor !== 'transparent')
          || (c.borderTopWidth !== '0px' || c.borderBottomWidth !== '0px' || c.borderLeftWidth !== '0px' || c.borderRightWidth !== '0px')
          || (c.boxShadow && c.boxShadow !== 'none')
          || (c.backgroundImage && c.backgroundImage !== 'none');
        if (!paints) continue;
        const r = e.getBoundingClientRect();
        const ox = Math.max(0, Math.min(r.right, drawn.r) - Math.max(r.left, drawn.x));
        const oy = Math.max(0, Math.min(r.bottom, drawn.b) - Math.max(r.top, drawn.y));
        const a = Math.round(ox * oy);
        if (a < 400) continue;
        /* Report the topmost box only: a strip inside a card is the card. */
        if (e.parentElement && over.some(o => o.el === e.parentElement)) continue;
        over.push({ el: e, sel: e.tagName.toLowerCase() + '.' + String(e.className).trim().split(/\s+/).slice(0, 2).join('.'),
                    x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
                    area: a, pos: c.position, z: c.zIndex });
      }
    }

    /* The two controls that move the lesson: rendered, in the viewport, and
       the topmost thing at their own centre. */
    const ctl = (sel) => {
      const e = document.querySelector(sel);
      if (!vis(e)) return { ok: false, why: 'not rendered' };
      const r = e.getBoundingClientRect();
      const inside = r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1;
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return { ok: inside && !!top && (e.contains(top) || top.contains(e)),
               why: !inside ? ('outside ' + Math.round(r.x) + ',' + Math.round(r.y)) : 'covered',
               x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };

    const V = (n) => cs.getPropertyValue(n).trim();
    return {
      vw: innerWidth, vh: innerHeight,
      dock: app.dataset.dock, dockfoot: app.dataset.dockfoot, path: app.dataset.path,
      read: app.dataset.read || 'off', work: app.dataset.beatwork || '',
      rail: app.dataset.rail, bar: app.dataset.bar, foot: app.dataset.foot, stage: app.dataset.stage,
      drawn: drawn ? { x: Math.round(drawn.x), y: Math.round(drawn.y), w: drawn.w, h: drawn.h, enlarged: drawn.enlarged } : null,
      over: over.map(({ el, ...o }) => o),
      overArea: over.reduce((s, o) => s + o.area, 0),
      next: ctl('.tr-bar__next'), back: ctl('.tr-bar__back'),
      sheet: box('.app__sheet'), key: box('.stage__key') || box('.legend__pin'), footDock: box('.stage__dock'),
      slots: { step: !!document.querySelector('#dock-step[data-mount="dock-step"]'),
               foot: !!document.querySelector('#dock-foot[data-mount="dock-foot"]') },
      vars: { step: [V('--dock-step-x'), V('--dock-step-y'), V('--dock-step-w'), V('--dock-step-h')].join(' '),
              foot: [V('--dock-foot-x'), V('--dock-foot-y'), V('--dock-foot-w'), V('--dock-foot-h')].join(' '),
              key:  [V('--dock-key-x'), V('--dock-key-y'), V('--dock-key-w'), V('--dock-key-h')].join(' '),
              dockH: V('--dock-h'), mapMin: V('--map-min'), railTopMin: V('--rail-top-min') },
      /* THE MASTHEAD'S OWN CONTROLS — the entrances to the app's other
         surfaces — and NOT the lesson's. Beats legitimately add a control of
         their own ("Count it", "Move 3 · Comparing") and those live in
         `toolbar`, which LAYOUT_BUDGET SS5A says is never collapsed. What may
         not change under a student is everything else. */
      barControls: [...document.querySelectorAll('.app__bar button, .app__bar a[href]')]
        .filter(vis).filter(e => !e.closest('.bar__slot--main') && !e.closest('.bar__dock')).length,
      scroll: document.documentElement.scrollHeight <= innerHeight + 1,
    };
  });

  let firstBar = null, sawStack = null;

  await page.goto(String(url).split('#')[0], { waitUntil: 'load' });
  const walk = await routes.chosen(page);
  const pay = await routes.payload(page);
  log('routes published: ' + pay.routes.map((r) => r.id + (r.isDefault ? '*' : '')).join(' ') + '   default=' + pay.default);
  const plan = [];
  for (const id of walk) for (const st of routes.sample(await routes.stepsOf(page, id))) plan.push({ id, st });
  log('plan: ' + plan.map((x) => x.id + '#' + x.st.step + ':' + x.st.kind).join('  '));

  for (const { id, st } of plan) {
    const step = st.step;
    await page.goto(routes.href(url, id, step), { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(2200);
    const m = await read();
    const key = m.vw + 'x' + m.vh;
    const docked = m.dock === 'docked';
    const p = id + ' step ' + String(step).padStart(2) + ' ';

    log(p + 'dock=' + m.dock + ' dockfoot=' + m.dockfoot + ' path=' + m.path + ' rail=' + m.rail
      + ' bar=' + m.bar + ' foot=' + m.foot
      + '  drawn ' + (m.drawn ? m.drawn.w + 'x' + m.drawn.h + ' @' + m.drawn.x + ',' + m.drawn.y : 'none')
      + '  read=' + m.read
      + '  on it: ' + m.overArea + 'px2');
    m.over.forEach(o => log('        OVER  ' + JSON.stringify(o)));

    /* D1 — the law itself. Below 62rem nothing floats inside the map. */
    if (docked) t(p + 'D1 nothing on the drawn map', m.overArea === 0,
      m.overArea + 'px2 ' + m.over.map(o => o.sel).join(','), '0');

    /* D2 — the lesson can be advanced. */
    t(p + 'D2 Next is reachable', m.next.ok, m.next.ok ? 'yes' : m.next.why, 'rendered, in view, topmost');
    t(p + 'D2 Back is reachable', m.back.ok, m.back.ok ? 'yes' : m.back.why, 'rendered, in view, topmost');
    if (docked) t(p + 'D2 the transport is in the masthead', !!m.next.y && m.next.y < 60,
      'y=' + m.next.y, 'inside the bar');

    /* D3 — the dock slots exist and publish a rectangle. */
    t(p + 'D3 slots in the DOM', m.slots.step && m.slots.foot,
      'step=' + m.slots.step + ' foot=' + m.slots.foot, 'both');
    if (docked) t(p + 'D3 the step dock publishes a rect', /\d+px \d+px [1-9]\d*px [1-9]\d*px/.test(m.vars.step),
      m.vars.step, 'non-zero w and h');
    /* AMENDED BY READING MODE — docs/RESPONSIVE_LAW.md §11. In reading mode the
       colour ribbon stands down WITH the map it keys: a key to eight colours
       over a 44px strip of coastline is a key to nothing, and `0 0 0 0` is the
       honest published answer to "where is the ribbon" when there is not one.
       It comes back in the same press that brings the map back, which is what
       R11 of `tools/scenarios/read.js` asserts. Outside reading mode this rule
       is exactly what it was. */
    if (m.read === 'on') {
      t(p + 'D3 the ribbon publishes 0 0 0 0 in reading mode', /^0px 0px 0px 0px$/.test(m.vars.key.trim()),
        m.vars.key, '0px 0px 0px 0px (it stands down with the map)');
    } else {
      t(p + 'D3 the ribbon publishes a rect', /[1-9]\d*px [1-9]\d*px/.test(m.vars.key.split(' ').slice(2).join(' ')),
        m.vars.key, 'non-zero w and h');
    }

    /* D4 — the map keeps a band worth looking at, and the panel keeps B8.

       AMENDED BY READING MODE — docs/RESPONSIVE_LAW.md §11. On a step whose
       work is textual, below 62rem in the sheet band, the plate is a PEEK
       STRIP: 44px, the full width of the window, and the whole of it is the
       control that brings the band back in one press. The band floor below is
       what it always was and applies the instant that press happens; what is
       amended is that a 44px strip on a reading step is the right answer and
       not a defect. Measured at 390x844 on step 18 before the amendment: the
       band floor was met at 390x192 while the beat's own 2,154px of prose was
       read through 226 pixels — a rule that passed and a student who could
       not read the lesson. `read.js` R1 is the other half of this rule and
       neither is sufficient alone. */
    if (m.read === 'on' && m.drawn) {
      t(p + 'D4 the peek strip', m.drawn.w >= m.vw - 8 && m.drawn.h >= 40 && m.drawn.h <= 72,
        m.drawn.w + 'x' + m.drawn.h, m.vw + 'x40-72 (reading mode)');
    } else if (BAND[key] && m.drawn) {
      /* THE ENLARGED PLATE IS P02's OWN GEOMETRY, and a shallower promise.
         At phone width, with a territory selected, the map lifts itself into a
         fixed strip so a bottom sheet cannot bury it — 390x165 measured, under
         reduced motion, where the docked band gives it 192. That device was
         designed when the docked band was 122px and it is now the SMALLER of
         the two; see the instruction to P02 in docs/RESPONSIVE_LAW.md SS7. The
         law is still absolute about what may stand on it (D1); the floor it is
         held to is the one the strip actually promises. */
      const [w, h] = BAND[key];
      const hh = m.drawn.enlarged ? Math.min(h, 160) : h;
      t(p + 'D4 the map band' + (m.drawn.enlarged ? ' (enlarged plate)' : ''),
        m.drawn.w >= w && m.drawn.h >= hh, m.drawn.w + 'x' + m.drawn.h, '>= ' + w + 'x' + hh);
    }
    if (m.sheet) t(p + 'D5 the panel keeps 280', m.sheet.h >= 280, m.sheet.h + 'px', '>= 280 (B8)');

    /* D6 — the two foot strips are below the map, not on it. */
    if (docked && m.drawn && m.key) t(p + 'D6 the ribbon is below the map', m.key.y >= m.drawn.y + m.drawn.h - 1,
      'ribbon y=' + m.key.y + ' map bottom=' + (m.drawn.y + m.drawn.h), 'ribbon starts at or after the map ends');
    if (docked && m.drawn && m.footDock) t(p + 'D6 the control dock is below the map', m.footDock.y >= m.drawn.y + m.drawn.h - 1,
      'dock y=' + m.footDock.y + ' map bottom=' + (m.drawn.y + m.drawn.h), 'dock starts at or after the map ends');

    /* D7 — no document scroll, at any beat. */
    t(p + 'D7 no document scroll', m.scroll, m.scroll ? 'none' : 'scrolls', 'none');

    /* D8 — the masthead is the SAME masthead at every beat of one lesson. */
    if (firstBar === null) { firstBar = m.barControls; sawStack = m.bar; }
    t(p + 'D8 the masthead does not change under the student',
      m.barControls === firstBar && m.bar === sawStack,
      m.barControls + ' controls, data-bar=' + m.bar, firstBar + ' controls, data-bar=' + sawStack);

    await shot('step' + step);
  }

  /* D9 — THE KEYBOARD FINDS IT WHERE THE EYE DOES.
     A control drawn in the masthead and reached fortieth is worse than the
     floating bar it replaced. Measured at 390x844 with the transport pinned
     into the bar by CSS alone but still parented into `.app__overlay` — which
     is the last element in the document, because that is what a full-screen
     layer has to be — Back and Next were past tab stop 40, after the whole
     dossier (WCAG 2.4.3). The shell moves the node into the slot instead.
     It is asserted as DOCUMENT ORDER rather than as a tab count, because a
     beat legitimately moves focus into its own panel when it mounts, so a
     count of Tab presses measures where the beat put the caret and not where
     the transport is. Document order is the thing that decides the sequential
     focus order, it is stable, and it is the property that was actually
     broken: the transport was the last element in the document and drawn
     third from the left in the masthead. */
  {
    /* A mounted beat on the default route, discovered — not step 9 of `thirty`. */
    const dsteps = await routes.stepsOf(page, walk[0]);
    const dbeat = (dsteps.filter((x) => x.kind === 'beat')[1] || dsteps[0]).step;
    await page.goto(routes.href(url, walk[0], dbeat), { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(2200);
    const m = await page.evaluate(() => {
      const app = document.getElementById('app');
      const next = document.querySelector('.tr-bar__next'), back = document.querySelector('.tr-bar__back');
      const stage = document.querySelector('.app__stage'), sheet = document.querySelector('.app__sheet');
      const before = (a, b) => !!(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
      const bar = document.querySelector('.app__bar');
      return { dock: app.dataset.dock,
               inBar: !!(next && bar && bar.contains(next) && back && bar.contains(back)),
               beforeStage: before(next, stage), beforeSheet: before(next, sheet),
               tail: next ? String((next.closest('[data-mount]') || {}).dataset ? next.closest('[data-mount]').dataset.mount : '?') : 'none' };
    });
    if (m.dock === 'docked') {
      t('D9 the transport precedes the plate and the panel in the document',
        m.inBar && m.beforeStage && m.beforeSheet,
        'in the bar: ' + m.inBar + ', before the stage: ' + m.beforeStage
          + ', before the panel: ' + m.beforeSheet + ', slot: ' + m.tail,
        'a control drawn in the masthead is reached from the masthead');
    }
  }

  log('');
  R.forEach(r => log(r));
  const bad = R.filter(r => r.startsWith('FAIL')).length;
  log('');
  log(bad ? '>>> DOCK LAW BROKEN — ' + bad + ' of ' + R.length : '>>> the dock law holds — ' + R.length + ' rules');
  /* AND IT EXITS NON-ZERO WHEN IT IS BROKEN — see read.js's tail for why. */
  if (bad) {
    const e = new Error('DOCK LAW BROKEN — ' + bad + ' of ' + R.length + '\n'
      + R.filter((r) => r.startsWith('FAIL')).join('\n'));
    e.acceptance = true;
    throw e;
  }
};
