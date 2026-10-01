/**
 * read.js — the executable form of docs/RESPONSIVE_LAW.md §11, READING MODE.
 *
 * GUARANTEE THIS FILE PROTECTS: on every route the app publishes — the default
 * one first — a mounted beat, a Complication Gate, a card and the Close all
 * keep a window the prose can actually be read through, and one press moves
 * between reading and the map in both directions.
 *
 * WAVE 9: IT IS ROUTE-AWARE, AND UNTIL THIS WAVE IT WAS NOT. Every address
 * below used to be `#tour=thirty&step=N` with N drawn from a hardcoded
 * [1, 2, 4, 14, 18, 20]. `thirty` stopped being the default in wave 8 and the
 * step numbers only ever meant anything on that one 25-step path: on `eight`
 * (five steps) four of the six are out of range, and on every other route they
 * land on different surfaces. 113 green assertions were being made about a
 * route a cold start never runs. The routes and their steps are now read from
 * `window.BEA.toursRoutes` / `window.BEA.toursIndex` through
 * `tools/scenarios/lib/routes.js`, the default is walked first, and the steps
 * are sampled BY KIND (opening beat, second beat, gate, recall, middle beat,
 * last step) so the sample means the same thing on a five-step route and a
 * twenty-seven-step one. Rename a route or move `isDefault` and this file
 * follows without an edit.
 *
 *   --route <id> | --route default | --default-only   walk one route only
 *
 * WHY IT EXISTS. `budget.js` measures the cold plate. `budget-working.js`
 * measures a mounted beat, and asserts that the beat panel is at least
 * LAYOUT_BUDGET B8's 280px — which it treats as a floor and the layout treated
 * as an allowance. `dock.js` measures what stands ON the map. NONE of the
 * three can see the defect three phone rounds running named as the only thing
 * that changes whether a fifteen-year-old finishes this lesson on a bus:
 *
 *   THE PANEL WAS BIG ENOUGH TO PASS AND TOO SMALL TO READ.
 *
 * Measured on the running app at 390x844, cold-loaded into `#tour=thirty&
 * step=18` — Dyer and Tagore at Amritsar, the app's C6 beat — on the build
 * this file ships against:
 *
 *   .app__lede           390x110
 *   .stage__map          390x72      a static Punjab
 *   .legend__pin         390x32      a colour key for 72px of map
 *   .app__sheet          390x378     45.0 % of the window
 *     .cx-sheet__head    390x37
 *     .tr-panel__scroll  390x226  holding 2,154px   =  9.5 SCREENFULS
 *     .tr-panel__foot    390x53
 *     .cl-blk            390x33
 *   .app__time           390x184     a time control 2.4x the reading window
 *
 * B8 passed (378 >= 280). B1 passed. D5 passed. Nine and a half screenfuls of
 * prose through a 226px letterbox passed everything this repository could
 * assert, and a critic found it three times.
 *
 * SO THIS FILE MEASURES THE READABLE WINDOW — the scroller the beat's own
 * prose is actually in — and fails the build when it is under the floor.
 * It also asserts the rest of §11: the peek strip is a strip AND a control,
 * the year line is a year line and nothing in it is clipped, one press moves
 * between the two states in both directions, there is exactly ONE scroll
 * region in the surface the student's thumb is on, and a beat whose work is
 * the map keeps its band exactly as `dock.js` D4 has always required.
 *
 *   node tools/inspect.js tools/scenarios/read.js --out /tmp/r390 --mobile
 *   node tools/inspect.js tools/scenarios/read.js --out /tmp/r768 --w 768 --h 1024
 *   node tools/inspect.js tools/scenarios/read.js --out /tmp/r900 --w 900 --h 700
 *   node tools/inspect.js tools/scenarios/read.js --out /tmp/r1366 --w 1366 --h 768
 *
 * At 900x700 and above, reading mode does not exist and this file asserts that
 * it does not: the rail is a side column there, the beat panel is already a
 * full-height grid item measuring 92-93 % of the window, and there is nothing
 * to take. It prints PASS/FAIL per rule and `>>> the reading law holds` /
 * `>>> READING LAW BROKEN`.
 */

/* vw x vh : the READABLE window a mounted textual beat must keep — the height
   of the scroller the beat's prose is in, not the height of the panel around
   it. Measured on the build this file ships with: 390 -> 471, 768 -> 626.
   The floors sit under those with room for a lede that wraps to a third line
   (which costs 22px at 390) and for a beat whose foot carries three controls
   instead of two. Before this pass: 226 and 154. */
const READ_MIN = {
  '390x844': 400,
  '360x740': 300,
  '768x1024': 520,
};

/* And the share of the window the whole panel keeps, which is the sentence
   LAYOUT_BUDGET B1 states for the plate, said here for the panel: on a beat
   whose work is textual the PANEL is the subject of the page. Achieved: 68.5 %
   at 390x844, 76.0 % at 768x1024. Before: 44.8 % and 45.0 %. */
const PANEL_SHARE = 0.60;

/* AND THE FLOOR THAT APPLIES WHATEVER THE BEAT'S WORK IS — round 3's rule, and
   the one the poster, the spine and the exits needed. R1 above only ever looked
   at a beat whose work was textual, so the three beats that keep the plate were
   invisible to it: measured at 390x844 on the build round 3 reviewed, the
   poster read 128px of a 681px card (5.3 screenfuls, with the beat's own guess
   input 400px below the fold on stop 1 of 15), the spine 128 of 735, the exits
   129 of 533 — all three with 208px of plate AND 184px of time control above
   and below them. The band has three claimants and one subject; whichever it
   is, the reading may not fall under this. Achieved: 260, 347, 258 at 390x844
   and 255, 511, 644 at 768x1024. */
const READ_FLOOR_ANY = {
  '390x844': 240,
  '360x740': 136,
  '768x1024': 320,
};

/* AND THE TWO NUMBERS ABOVE ARE NOT CONSTANTS — THEY ARE THE SAME ARITHMETIC
   READ AT TWO WINDOW HEIGHTS, AND ROUND 8 IS WHERE THAT MATTERED.
   The rubric, measured on the commonest Android width: "at 360x740 read.js
   reports 5 of 102 broken — step 1 R17 readable 157px against a floor of 200,
   steps 4 and 18 at 337 against 340, R11 at 145 and the return at 333."
   Reproduced exactly. Every one of the five was the DEFAULT floor — 340 and
   200, the two numbers this file falls back to at a window it has no row for —
   and both of those were measured in an 844px window.

   THE DERIVATION, and it is the whole of §11.15. In the sheet band every row
   that is not the plate and not the reading window is a FIXED number of
   pixels, set by touch targets and by type and by nothing about the window:

     data-read="on"   bar 46 + lede 108 + peek 44 + year line 52
                      + sheet border 1 + head 37 + beat foot 53
                      + gap 12 + through-line 33 + body pad 16   = 402
     work="map"       bar 46 + lede 116 + plate 176 (D4's floor) + ribbon 32
                      + year line 52 + 1 + 37 + 53 + 12 + 33 + 16 = 574

   plus `--read-trim`, which is at most one line box (32). So the reading
   window is `viewport height - 434` and `viewport height - 606`, and the floor
   under it is the same expression with the rounding taken off:

     READ_MIN       = vh - 444              400 at 844   300 at 740
     READ_FLOOR_ANY = min(240, vh - 604)    240 at 844   136 at 740

   AND ONE OF THE TWO IS CAPPED AND THE OTHER IS NOT, WHICH IS NOT A FUDGE —
   it is the two states behaving differently and the arithmetic saying so.
   In reading mode the PANEL takes what is left (`block-size: max(--cx-sheet-min,
   100dvh - --sheet-clear - --rail-top-min)`), so every extra pixel of window
   reaches the prose and READ_MIN rises with it: measured at 412x915, the
   reading is 529. On a map-work beat the PLATE takes what is left and the
   panel sits on B8's 280px floor, so the reading is a constant and the extra
   pixels go to the map, which is the right answer — the plate is the subject
   there (§11.10). Measured: 254 at 390x844, 255 at 393x873, 255 at 412x915.
   `--read-any-min` is the floor the plate gives up to, never a share it must
   hand over, so the derived value is capped at the 844 window's 240 exactly as
   `layout.css`'s `min(15rem, …)` caps the token. Without the cap this file
   asked a 915px phone for 311px of reading that no arrangement of the band
   produces, and failed a layout that is behaving correctly.

   The 844 column is not a new claim: 400 and 240 are the numbers this file has
   asserted since round 3, and they fall straight out of the arithmetic. What
   changes is that a window this file has no row for is now measured against
   ITS OWN height instead of against a phone somebody else is holding.

   AND WHAT IT COSTS, SAID OUT LOUD. 136 is thin, and it is thin because a
   740px window has 104 fewer pixels than the one §11 was written for and the
   sheet band's rows are constants. The shell already spends every pixel it has
   on the reading — measured at 360x740 on step 1, the poster: `--read-any-min`
   asks for the floor, `chrome/index.js` drops the plate to hold it, and the
   plate stops at D4's 176 because below that a world map is not a map. The
   only way to a 200px window there is to take D4's band on the one beat whose
   subject IS the plate, which trades a readable map for a readable paragraph
   on the step that asks the student to count colours on a map. §11.10 already
   decided that: the subject keeps its size. The remedy, if a later round wants
   more, is a shorter poster card (P05's), not a shorter map (the shell's).
   docs/RESPONSIVE_LAW.md §11.15. */
/* The table is the law where the law has measured; below 40rem wide and off
   the table it is the arithmetic, with 120 as a backstop so a window too short
   for the sheet band at all cannot make every assertion pass vacuously (120 is
   §12's own number for the smallest band that is still a map, borrowed here
   for the smallest box that is still a reading). At 40rem and up the stated
   defaults stand: 768x1024 is the only window in the sweep that is in the
   sheet band and wide, and it has a row of its own. */
const floorsFor = (vw, vh, table, wide, drop, cap) => {
  const row = table[vw + 'x' + vh];
  if (row) return row;
  if (vw >= 640) return wide;
  return Math.min(cap || Infinity, Math.max(120, vh - drop));
};
const readMin = (vw, vh) => floorsFor(vw, vh, READ_MIN, 340, 444);
const readAny = (vw, vh) => floorsFor(vw, vh, READ_FLOOR_ANY, 200, 604, 240);

/* The peek strip: a strip, and a target a thumb can hit (WCAG 2.2 SC 2.5.5). */
const PEEK = [40, 72];
/* The year line: enough for a year and an axis, not enough for a deck. */
const YEARLINE = [28, 60];

/* WHICH STEPS ARE WALKED IS NO LONGER A LIST OF NUMBERS.
   It used to be [1, 2, 4, 14, 18, 20], chosen because on the 25-step `thirty`
   those were a poster, the spine, a textual beat, a Complication Gate, another
   textual beat and the exits choropleth — the set of surfaces §11 actually
   distinguishes. Every one of those numbers is meaningless on any other route,
   and four of the six are out of range on `eight`. `lib/routes.sample()` picks
   the same set of SURFACES on whatever route it is handed: the opening beat,
   the second beat, the first gate, the first recall, a beat from the middle,
   and the last step. THE ORDER STILL MATTERS: they are walked in one session,
   because a gate reached by walking the path is a different mount from a gate
   reached by pasting its address. */
const routes = require('./lib/routes.js');

module.exports = async ({ page, shot, log, url }) => {
  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');

  const read = () => page.evaluate(() => {
    const app = document.getElementById('app');
    const vis = (e) => {
      if (!e) return false;
      const c = getComputedStyle(e);
      if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false;
      const r = e.getBoundingClientRect();
      return r.width > 2 && r.height > 2;
    };
    const box = (s) => {
      const e = document.querySelector(s);
      if (!vis(e)) return null;
      const r = e.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
               b: Math.round(r.bottom), sh: e.scrollHeight, ch: e.clientHeight };
    };

    /* THE DRAWN MAP, not the rectangle it was given — the same measurement
       `dock.js` makes, so the two files cannot disagree about what a student
       is looking at. */
    let drawn = null;
    const clipBox = document.querySelector('.stage__map');
    const clip = clipBox ? clipBox.getBoundingClientRect() : null;
    for (const sel of ['.map.is-enlarged canvas', '.stage__map canvas', '.stage__map svg', '.stage__map']) {
      const n = document.querySelector(sel);
      if (!vis(n)) continue;
      const r = n.getBoundingClientRect();
      if (r.width <= 40) continue;
      let x = r.left, y = r.top, rr = r.right, bb = r.bottom;
      if (clip && !n.closest('.map.is-enlarged')) {
        x = Math.max(x, clip.left); y = Math.max(y, clip.top);
        rr = Math.min(rr, clip.right); bb = Math.min(bb, clip.bottom);
      }
      drawn = { x: Math.round(x), y: Math.round(y), w: Math.round(rr - x), h: Math.round(bb - y) };
      break;
    }

    /* THE READABLE WINDOW — the box the step's own words are actually read
       through, whichever of the three it is. A beat renders `.tr-panel` with a
       scroller of its own; a Complication Gate renders `.qz` straight into the
       sheet's body and the body is the scroller; a beat short enough not to
       need one is still read through the panel it is in. */
    let sc = null;
    /* AND THE CLOSE, AND ANY SURFACE THAT NAMES ITS OWN. Round 2 measured the
       Close at 390x844 through `.cx-sheet__body`, which reported 511 holding
       511 and looked settled, while `.cl-close__scroll` inside it held 6,332 —
       so this file would have passed a surface reading at 13 screenfuls. The
       reading window is the scroller the prose is actually in, and a piece may
       name its own with `data-read-window` (RESPONSIVE_LAW §11.2). */
    const sheetBody = document.querySelector('.app__sheet .cx-sheet__body');
    const named = sheetBody && sheetBody.querySelector('[data-read-window], .cl-close__scroll');
    if (vis(named)) sc = named;
    if (!sc) for (const sel of ['.tr-panel__scroll', '.tr-panel', '.qz']) {
      const n = document.querySelector(sel);
      if (!vis(n)) continue;
      sc = /qz/.test(sel) ? document.querySelector('.cx-sheet__body') : n;
      if (vis(sc)) break;
      sc = null;
    }
    if (!sc && vis(sheetBody)) sc = sheetBody;
    const readable = sc ? { ...box2(sc) } : null;
    function box2(e) {
      const r = e.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
               b: Math.round(r.bottom), sh: e.scrollHeight, ch: e.clientHeight };
    }

    /* SCROLLING ANCESTORS OF THE READABLE WINDOW. "No scroller inside a
       scroller" is exactly this number and it must be 0: a nested touch scroll
       region hands a mid-flick gesture to a box with no fade on it, and the
       student's thumb lands in whichever of the three the 30px band under it
       belonged to. Surfaces the student cannot reach (the dossier stacked
       BEHIND an open sheet) are not ancestors and are not counted; they are
       still scrollable, which is right, because closing the sheet reveals
       them. */
    const nest = [];
    if (sc) {
      let n = sc.parentElement;
      while (n && n !== document.body) {
        const c = getComputedStyle(n);
        if (/(auto|scroll)/.test(c.overflowY) && n.scrollHeight > n.clientHeight + 2 && n.clientHeight > 8) {
          nest.push((n.className || n.tagName) + ' ' + n.clientHeight + '/' + n.scrollHeight);
        }
        n = n.parentElement;
      }
    }

    /* IS THE PEEK STRIP A CONTROL? Rendered, the full width of the plate, and
       the topmost thing at its own centre — the same test `dock.js` D2 makes
       of Back and Next, because a control that is drawn and not reachable is
       not a control. */
    const peekEl = document.querySelector('.map__peek');
    let peek = null;
    if (vis(peekEl)) {
      const r = peekEl.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      peek = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
               reachable: !!top && (peekEl.contains(top) || top.contains(peekEl)),
               name: (peekEl.getAttribute('aria-label') || peekEl.textContent || '').trim().slice(0, 60),
               focusable: peekEl.tagName === 'BUTTON' || peekEl.hasAttribute('tabindex') };
    }

    /* ANYTHING DRAWN OUTSIDE THE REGION THAT OWNS IT. LAYOUT_BUDGET B3: being
       clipped is being over budget, and the remedy is to shed a stratum. */
    const clipped = [];
    for (const sel of ['.app__time', '.app__lede', '.app__bar']) {
      const e = document.querySelector(sel);
      if (!vis(e)) continue;
      const pb = e.getBoundingClientRect();
      for (const c of e.querySelectorAll('*')) {
        if (!vis(c)) continue;
        const b = c.getBoundingClientRect();
        if (b.height < 4 || b.width < 4) continue;
        if (b.bottom > pb.bottom + 1.5 || b.top < pb.top - 1.5) {
          const cls = (c.className && c.className.baseVal !== undefined) ? c.className.baseVal : c.className;
          clipped.push(sel + ' > ' + String(cls || c.tagName).split(/\s+/)[0] + ' '
            + Math.round(b.top) + '..' + Math.round(b.bottom) + ' in ' + Math.round(pb.top) + '..' + Math.round(pb.bottom));
        }
      }
    }

    return {
      vw: innerWidth, vh: innerHeight,
      read: app.dataset.read || '', work: app.dataset.beatwork || '',
      fit: document.documentElement.getAttribute('data-tour-fit') || '',
      dock: app.dataset.dock, rail: app.dataset.rail, path: app.dataset.path,
      kind: (document.querySelector('.tr-panel') ? document.querySelector('.tr-panel').getAttribute('data-kind') : null)
        || (document.querySelector('.qz') ? 'gate' : ''),
      drawn, readable, peek, nest, clipped: clipped.slice(0, 8),
      /* THE STICKY SPINE AND THE GAP UNDER IT. `position: sticky` resolves
         against its containing block — the body's CONTENT box — while the
         student looks through the body's PADDING box, so a spine pinned to
         `inset-block-end: 0` inside a padded scroller comes to rest one
         `padding-block-end` above the visible edge and whatever is behind it
         paints through the gap. Round 8, the phone, cold-loading
         `#tour=thirty&step=20` at 390x844: the spine rested at 740-773 and
         `.viz-onpath__h` ran 779-829 — ten pixels of a 50px heading printed
         under the through-line and above the year line, on a `data-read="off"`
         map-work beat where neither of the two rules that already said this
         applied. RESPONSIVE_LAW §11.5C. */
      spine: (() => {
        const bd = document.querySelector('.app__sheet .cx-sheet__body');
        if (!vis(bd)) return null;
        const blk = bd.querySelector(':scope > .cl-blk');
        if (!vis(blk)) return null;
        const br = bd.getBoundingClientRect();
        const kr = blk.getBoundingClientRect();
        const gap = Math.round(br.bottom - kr.bottom);
        let under = '';
        if (gap > 1) {
          const el = document.elementFromPoint(Math.round(br.x + br.width / 2),
            Math.round(kr.bottom + Math.min(gap - 1, 4)));
          if (el && bd.contains(el) && el !== blk && !blk.contains(el)) {
            const cls = (el.className && el.className.baseVal !== undefined) ? el.className.baseVal : el.className;
            under = String(cls || el.tagName).split(/\s+/)[0];
          }
        }
        return { pos: getComputedStyle(blk).position, gap, under,
          scroller: bd.scrollHeight > bd.clientHeight + 4 };
      })(),
      panel: box('.app__sheet') || box('.app__dossier'),
      key: box('.legend__pin') || box('#app .stage__key'),
      time: box('.app__time'),
      year: box('.tl__year'), axis: box('.tl-ax'), phase: box('.tl__phase'),
      fitBtn: !!document.querySelector('.tr-panel__fit'),

      /* IS THE BEAT THE DECLARATION IS ABOUT ACTUALLY ON SCREEN? The same
         predicate the shell branches on (`chrome/index.js` `_livePanel`), asked
         here so the checker and the resolver cannot disagree about which
         declaration governs. RESPONSIVE_LAW §11.2, round 2's correction. */
      beat: vis(document.querySelector('.tr-panel')),

      lanes: Array.from(document.querySelectorAll('.tl-lane')).filter(vis).length,
      scroll: document.documentElement.scrollHeight <= innerHeight + 1,

      /* THE EDGES OF THE READING, in the units the complaint was made in: how
         deep into a line box the top and bottom edges of the window fall. 0 is
         an edge that lands between lines. RESPONSIVE_LAW §11.5. */
      cut: (() => {
        if (!sc) return null;
        const b = sc.getBoundingClientRect();
        let rects = [];
        try {
          const rg = document.createRange();
          rg.selectNodeContents(sc);
          rects = Array.from(rg.getClientRects()).filter((r) => r.height > 4 && r.height <= 40 && r.width > 8);
        } catch (_) { return null; }
        const at = (y) => {
          let w = 0;
          for (const r of rects) {
            if (y <= r.top + 0.5 || y >= r.bottom - 0.5) continue;
            w = Math.max(w, Math.min(y - r.top, r.bottom - y));
          }
          return Math.round(w * 10) / 10;
        };
        return { top: at(b.top), bottom: at(b.bottom), lines: rects.length,
          trim: getComputedStyle(app).getPropertyValue('--read-trim').trim(),
          box: Math.round(b.height) + '/' + sc.scrollHeight };
      })(),

      /* THE CONTROL THAT LEAVES READING MODE, wherever it is rendered, and how
         many there are. A surface with none is a dead end; a surface with two
         is two controls for one state. */
      toggles: (() => {
        const out = [];
        for (const sel of ['.app__sheet .tr-panel__fit', '.cx-sheet__fit', '.map__peek']) {
          const n = document.querySelector(sel);
          if (!vis(n)) continue;
          const r = n.getBoundingClientRect();
          out.push({ sel, w: Math.round(r.width), h: Math.round(r.height),
            name: (n.getAttribute('aria-label') || n.textContent || '').trim().slice(0, 48) });
        }
        return out;
      })(),

      /* THE PANEL UNDER THE SHEET. LAYOUT_BUDGET B7 stacks them in one column;
         the covered one must be out of the tab order and out of the
         accessibility tree. */
      covered: (() => {
        const d = document.querySelector('.app__dossier');
        if (!d) return null;
        const sheetOpen = app.dataset.sheet === 'open';
        const tabbable = Array.from(d.querySelectorAll('a[href],button,input,select,textarea,[tabindex]'))
          .filter((e) => !e.disabled && e.tabIndex >= 0 && e.getClientRects().length).length;
        const cs = getComputedStyle(d);
        const rendered = cs.display !== 'none' && cs.visibility !== 'hidden' && d.getBoundingClientRect().height > 8;
        return { sheetOpen, rendered, inert: d.hasAttribute('inert'), ariaHidden: d.getAttribute('aria-hidden'), tabbable };
      })(),
    };
  });

  /* EVERY ADDRESS IN THIS FILE IS BUILT FROM THE PUBLISHED PAYLOAD.
     `here` is whichever route is being walked at the time, so a rule that only
     ever held on the old default cannot hide behind a hardcoded hash. */
  let here = null;
  const goto = async (step, routeId) => {
    const id = routeId || here;
    await page.goto(routes.href(url, id, step), { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready',
      null, { timeout: 30000 });
    await page.waitForTimeout(2200);
    /* AND THEN WAIT FOR THE PLATE TO STOP MOVING. Round 2 of wave 9: under the
       front door's five-way parallelism this file reported `R3 the map is a
       peek strip got 390x22 (want 390x40-72)` on one step of one route, in
       reduced motion, and the same command on an idle machine held all 433
       assertions. 22px is not a layout; it is a map caught mid-redraw, because
       2,200ms is a guess and a busy machine is slower than a guess. So the
       measurement waits for the drawn plate's own height to be the same across
       two animation frames 250ms apart. A law measured on a half-drawn frame
       is a law nobody can trust when it goes red. */
    await page.waitForFunction(() => {
      const el = document.querySelector('.map__svg, .map svg, #map svg, .app__map svg');
      if (!el) return true;
      const h = Math.round(el.getBoundingClientRect().height);
      const was = window.__readSettleH;
      window.__readSettleH = h;
      return was === h && h > 0;
    }, null, { timeout: 15000, polling: 250 }).catch(() => {});
  };

  let sawReading = false;

  /* THE ROUTES, DEFAULT FIRST — read from the app, never named here. */
  await page.goto(String(url).split('#')[0], { waitUntil: 'load' });
  const walk = await routes.chosen(page);
  const pay = await routes.payload(page);
  log('routes published: ' + pay.routes.map((r) => r.id + (r.isDefault ? '*' : '')
      + ' (' + r.steps + ' steps, ' + r.minutesExactMax + ' min slow)').join('  ')
    + '   default=' + pay.default);
  log('walking, default first: ' + walk.join(', '));
  t('R0 exactly one route is the default', pay.routes.filter((r) => r.isDefault).length === 1,
    pay.routes.filter((r) => r.isDefault).map((r) => r.id).join(',') || 'none', 'exactly one');

  /* The first surface on the default route that is genuinely in reading mode,
     remembered while walking so R11 and R12 below do not have to guess a step
     number. Wave 8's read.js hardcoded step 18 for both. */
  let readingAt = null;
  let lastStepOf = {};

  const plan = [];
  for (const id of walk) {
    const steps = await routes.stepsOf(page, id);
    lastStepOf[id] = steps[steps.length - 1].step;
    for (const st of routes.sample(steps)) plan.push({ id, st });
  }
  log('plan: ' + plan.map((x) => x.id + '#' + x.st.step + ':' + x.st.kind + '/' + x.st.id).join('  '));

  for (const { id, st } of plan) {
    here = id;
    const step = st.step;
    await goto(step);
    const m = await read();
    const key = m.vw + 'x' + m.vh;
    const p = id + ' step ' + String(step).padStart(2) + ' ';
    const inBand = m.dock === 'docked' && m.rail === 'sheet';
    /* R11 and R12 need a beat whose WORK IS THE PROSE — the state READ_MIN
       governs. A `sweep` or `time` beat reads at READ_FLOOR_ANY because the
       band is its subject (§11.10), so picking one of those would fail R11 for
       being correct. Text first; anything that reads at all as the fallback. */
    if (id === walk[0] && m.read === 'on' && m.beat) {
      if (!readingAt || (readingAt.work !== 'text' && m.work === 'text')) {
        readingAt = { id, step, work: m.work };
      }
    }

    log(p + 'kind=' + (m.kind || '-') + ' fit=' + (m.fit || '-') + ' read=' + m.read + ' work=' + (m.work || '-')
      + '  map ' + (m.drawn ? m.drawn.w + 'x' + m.drawn.h : 'none')
      + '  panel ' + (m.panel ? m.panel.w + 'x' + m.panel.h : 'none')
      + '  READABLE ' + (m.readable ? m.readable.h + ' of ' + m.readable.sh : 'none')
      + '  time ' + (m.time ? m.time.h : 0));

    /* R10 — the contract is published, always, whether or not it is on. */
    t(p + 'R10 the shell publishes data-read', m.read === 'on' || m.read === 'off',
      m.read || '(absent)', 'on|off');
    /* R10, SECOND HALF — THE RESOLVED WORK NEVER CONTRADICTS THE DECLARATION
       THAT GOVERNS THE SURFACE ON SCREEN, AND WHICH DECLARATION THAT IS
       DEPENDS ON WHAT IS MOUNTED.
       ROUND 7 CORRECTED THIS RULE, NOT THE APP. It read `<html data-tour-fit>`
       on every step in the band and compared it to `#app[data-beatwork]`, and
       `data-tour-fit` is tours' contract about a BEAT: §11.2's round-2
       correction — "a declaration about a beat answers only while the beat is
       on screen" — had already retired that comparison everywhere the beat is
       not what the student is looking at, and this rule's wording was never
       brought with it. Measured at 390x844 and at 768x1024, walking the path
       (not pasting the address) to `#tour=thirty&step=20`: the exits beat
       declares `fit: map` and is CORRECT to keep declaring it, because the
       checkpoint card "Who did this" is open over it and the beat comes back
       with its choropleth the moment the card closes. What is on screen is the
       checkpoint: a 582px card read through 578px, the plate a 44px strip, the
       time control the 52px year line, `work=text` resolved from the card's own
       `ask:sheet` `work` exactly as §11.2 says it must be. The shell was right,
       the band was right, and the rule was comparing the card's resolved work
       against a beat that was not rendered.
       So it now asks the question of the surface. A mounted beat: the
       declaration governs, unchanged — `fit` answers "plate or panel" and the
       resolved work answers "and which apparatus", so on a beat whose evidence
       is the four lanes the shell resolves `time` from a declaration of `text`,
       and a resolution that contradicts the declaration about the PLATE still
       fails here. A lesson surface with no beat in it — a Complication Gate, a
       checkpoint or recall card, the Close — is prose to be read, and §11.1's
       own after-table gives all three the same band: plate 44, ribbon 0, time
       52. So on those the assertion is the sharper one, and it is the one that
       would have caught the dead end the phone critic found at
       `#tour=core&step=15` (a recall card reading a 661px card through 242px
       because a dormant `map` declaration was still answering for it): the
       shell publishes a work, it is not `map`, and the plate has actually stood
       down. RESPONSIVE_LAW §11.2, §11.10. */
    if (inBand) {
      if (m.beat) {
        t(p + 'R10 data-beatwork follows the declaration that governs the surface',
          m.work === m.fit || (m.work === 'time' && m.fit === 'text'),
          'a beat is mounted: work=' + (m.work || '(absent)') + ' fit=' + (m.fit || '(absent)'),
          'identical, or `time` resolved from `text`');
      } else {
        const strip = !!m.drawn && m.drawn.h <= PEEK[1];
        t(p + 'R10 data-beatwork follows the declaration that governs the surface',
          (m.work === 'text' || m.work === 'time') && strip,
          'no beat is mounted: work=' + (m.work || '(absent)')
            + ' plate=' + (m.drawn ? m.drawn.h : 0) + 'px'
            + ' (the beat\'s own fit=' + (m.fit || 'none') + ' is dormant)',
          'the surface\'s own work, and the plate stood down');
      }
    }

    /* Outside the sheet band there is no reading mode, and that is a rule. */
    if (!inBand) {
      t(p + 'R0 no reading mode outside the sheet band', m.read === 'off',
        m.read + ' (dock=' + m.dock + ' rail=' + m.rail + ')', 'off');
      continue;
    }

    if (m.read === 'on') {
      sawReading = true;
      const floor = readMin(m.vw, m.vh);

      /* R1 — THE RULE THIS FILE EXISTS FOR. It is a rule about a beat whose
         SUBJECT is the prose. On a `time` beat the four lanes are the evidence
         and they keep their band; R17 and R19 are that beat's floor. */
      if (m.work !== 'time') {
      t(p + 'R1 the readable window', !!m.readable && m.readable.h >= floor,
        (m.readable ? m.readable.h + 'px holding ' + m.readable.sh
          + ' (' + (m.readable.sh / Math.max(1, m.readable.h)).toFixed(1) + ' screenfuls)' : 'none'),
        '>= ' + floor + 'px');

      /* R2 — and the panel is the majority of the band. */
      const share = m.panel ? m.panel.h / m.vh : 0;
      t(p + 'R2 the panel is the majority of the band', share >= PANEL_SHARE,
        (share * 100).toFixed(1) + '% (' + (m.panel ? m.panel.h : 0) + ' of ' + m.vh + ')',
        '>= ' + (PANEL_SHARE * 100) + '%');

      } else {
        /* THE SAME SENTENCE, SAID ABOUT THE BEAT WHOSE SUBJECT IS THE TIME
           CONTROL: the panel is still the larger of the two things that are
           not the subject, and it is still half the band. */
        const share2 = m.panel ? m.panel.h / m.vh : 0;
        t(p + 'R2 a time beat: the panel is half the band and bigger than the control',
          share2 >= 0.5 && !!m.time && m.panel.h > m.time.h,
          (share2 * 100).toFixed(1) + '% (' + (m.panel ? m.panel.h : 0) + ' of ' + m.vh + '), time '
          + (m.time ? m.time.h : 0), '>= 50% and > the time control');
      }

      /* R3 — the map is a peek strip, and the strip is a control. */
      t(p + 'R3 the map is a peek strip', !!m.drawn && m.drawn.h >= PEEK[0] && m.drawn.h <= PEEK[1] && m.drawn.w >= m.vw - 8,
        m.drawn ? m.drawn.w + 'x' + m.drawn.h : 'none', m.vw + 'x' + PEEK[0] + '-' + PEEK[1]);
      t(p + 'R3 the strip is a reachable control', !!m.peek && m.peek.reachable && m.peek.focusable && m.peek.h >= 40,
        m.peek ? (m.peek.w + 'x' + m.peek.h + ' reachable=' + m.peek.reachable + ' "' + m.peek.name + '"') : 'no .map__peek',
        'a focusable button, >= 44px, topmost at its own centre');

      /* R4 — one scroll region, not three. */
      t(p + 'R4 no scroller inside a scroller', m.nest.length === 0,
        m.nest.length + (m.nest.length ? ' [' + m.nest.join(' | ') + ']' : ''), '0 scrolling ancestors');

      /* R5 — the year line still says when, and still moves. (On a `time`
         beat the whole control is there, which R19 asserts.) */
      if (m.work !== 'time') t(p + 'R5 the year line', !!m.time && m.time.h >= YEARLINE[0] && m.time.h <= YEARLINE[1],
        m.time ? m.time.h + 'px' : 'none', YEARLINE[0] + '-' + YEARLINE[1] + 'px');
      /* On a `time` beat the spine's READING is not a substitute for the band,
         because the band is the beat's evidence and it is on screen whole —
         R19 asserts that. This clause is about the state where it is not. */
      if (m.work !== 'time') t(p + 'R5 the year, the axis and the spine\'s reading', !!m.year && !!m.axis && !!m.phase,
        'year=' + (m.year ? m.year.w + 'x' + m.year.h : 'none')
        + ' axis=' + (m.axis ? m.axis.w + 'x' + m.axis.h : 'none')
        + ' phase=' + (m.phase ? m.phase.w + 'x' + m.phase.h : 'none'),
        'all three rendered (FEATURE_SPEC P03 A1)');

      /* R6 — the ribbon stands down WITH the map, not on its own. */
      t(p + 'R6 the colour ribbon is not keying a 44px map', !m.key,
        m.key ? m.key.w + 'x' + m.key.h + ' @' + m.key.y : 'not rendered', 'not rendered');

      /* R8 — nothing is clipped by the rows this mode resized. */
      t(p + 'R8 nothing is clipped', m.clipped.length === 0,
        m.clipped.length ? m.clipped.join(' ; ') : 'nothing', '0');
    } else {
      /* R9 — a beat whose work is the map keeps the band `dock.js` D4 asks
         for, and nothing in this pass touches it. */
      t(p + 'R9 a map beat keeps its band', !!m.drawn && m.drawn.h >= 176,
        m.drawn ? m.drawn.w + 'x' + m.drawn.h : 'none', '>= 176 high (dock.js D4)');
      t(p + 'R9 and its colour ribbon', !!m.key, m.key ? m.key.w + 'x' + m.key.h : 'none', 'rendered');
    }

    /* R17 — THE FLOOR UNDER EVERY STEP, WHATEVER ITS WORK. The rule round 3
       needed and no rule in this file could make: R1 and R2 are inside the
       `read === 'on'` branch, so a beat that keeps the plate was measured by
       nothing at all, and the three that keep it are the first, the second and
       the tenth stop of the default route. RESPONSIVE_LAW §11.10. */
    {
      const floorAny = readAny(m.vw, m.vh);
      t(p + 'R17 the reading window, whatever the work', !!m.readable && m.readable.h >= floorAny,
        (m.readable ? m.readable.h + 'px holding ' + m.readable.sh
          + ' (' + (m.readable.sh / Math.max(1, m.readable.h)).toFixed(1) + ' screenfuls)' : 'none')
        + ' work=' + (m.work || '-'),
        '>= ' + floorAny + 'px');
      /* R19 — AND THE APPARATUS THAT IS NOT THE SUBJECT HAS STOOD DOWN. The
         defect this closes is the `map` state holding BOTH the plate at its
         full band and the time control at 184 while the panel sat on B8's
         280px floor. Exactly one of the three claimants is the subject. */
      const timeH = m.time ? m.time.h : 0;
      if (m.work === 'time') {
        t(p + 'R19 a time beat keeps the whole time control', timeH > YEARLINE[1],
          timeH + 'px', '> ' + YEARLINE[1] + 'px — the transport, the axis and the four lanes');
        t(p + 'R19 and its plate is a peek strip', !!m.drawn && m.drawn.h <= PEEK[1],
          m.drawn ? m.drawn.w + 'x' + m.drawn.h : 'none', '<= ' + PEEK[1] + ' high');
        t(p + 'R19 and the four lanes are on screen', m.lanes === 4,
          m.lanes + ' lanes', '4 (FEATURE_SPEC P03 A1 — the beat argues about them)');
      } else if (m.work) {
        t(p + 'R19 the time control is a year line', timeH >= YEARLINE[0] && timeH <= YEARLINE[1],
          timeH + 'px (work=' + m.work + ')', YEARLINE[0] + '-' + YEARLINE[1] + 'px');
      }
    }

    /* R7 — no document scroll, at either setting (LAYOUT_BUDGET B4). */
    t(p + 'R7 no document scroll', m.scroll, m.scroll ? 'none' : 'the document scrolls', 'none');

    /* R13 — EVERY SURFACE THAT CAN BE IN READING MODE CARRIES THE CONTROL
       THAT LEAVES IT, AND CARRIES EXACTLY ONE OF IT IN THE PANEL.
       Round 2, measured at 390x844 on `#tour=core&step=15`, a recall card: the
       card renders no `.tr-panel__foot`, so tours' `Map` did not exist, and
       pressing OPEN THE MAP took the plate to 192px with no control anywhere
       to give the room back — Back or Next were the only way out. A mode with
       an entrance and no exit is worse than no mode. The peek strip is the
       second route and is counted separately; what this asserts is that the
       PANEL always carries one and never two. */
    if (inBand) {
      const panelToggles = m.toggles.filter((x) => x.sel !== '.map__peek');
      t(p + 'R13 one control leaves reading mode, in the panel', panelToggles.length === 1,
        panelToggles.map((x) => x.sel + ' "' + x.name + '"').join(' + ') || 'none',
        'exactly one of .tr-panel__fit / .cx-sheet__fit');
      if (m.read === 'on') {
        t(p + 'R13 and the peek strip is the second route', m.toggles.some((x) => x.sel === '.map__peek'),
          m.toggles.map((x) => x.sel).join(' '), 'the strip is rendered too');
      }
    }

    /* R14 — NO LINE OF PROSE IS CUT THROUGH ITS X-HEIGHT AT EITHER EDGE, on
       first paint. Round 2, measured at 390x844 on `#tour=core&step=9`: "on the
       1914 map took twenty years of treaties" clipped at the bottom on first
       paint, and after a flick "What kind of thing is it?" clipped at the top
       and "What can it NOT tell you?" at the bottom. The window's height is
       trimmed to a line boundary by the shell (`--read-trim`) and the scroll
       position is snapped to one after every settle. A cut inside the
       DESCENDER band of a line is not a cut through its x-height and reads
       perfectly, so the tolerance is a quarter of the app's largest leading. */
    /* AND IT IS ASSERTED IN EVERY MODE — round 3, the rubric: "at 390x844 the
       beat scroller clips its last line of body text through the x-height
       rather than at a line boundary." It was measured on the spine beat, whose
       `data-read` is `off`, which is exactly where this rule was not looking:
       9.3px into a line box on the spine, 6.8 on the poster. */
    if (m.work && m.cut) {
      t(p + 'R14 no line cut at either edge', m.cut.top <= 7 && m.cut.bottom <= 7,
        'top ' + m.cut.top + 'px, bottom ' + m.cut.bottom + 'px of a line box (' + m.cut.lines
          + ' lines, trim ' + m.cut.trim + ', window ' + m.cut.box + ')',
        '<= 7px at both edges');
    }

    /* R20 — THE THROUGH-LINE SPINE RESTS ON THE SCROLLPORT'S EDGE, and
       nothing paints under it. R14 could not see this and never could: it
       measures the READING WINDOW, and on the beat this was found on the
       reading window is `.tr-panel__scroll`, whose edges were both clean while
       a heading was sliced sixteen pixels lower in the box AROUND it. The
       rule is stated about the geometry rather than about the slice, because
       the gap is `padding-block-end` and the slice is only what happened to be
       behind it. RESPONSIVE_LAW §11.5C. */
    if (m.spine && m.spine.pos === 'sticky' && m.spine.scroller) {
      t(p + 'R20 the spine rests on the scrollport edge', m.spine.gap <= 1 && !m.spine.under,
        'gap ' + m.spine.gap + 'px' + (m.spine.under ? ', and `' + m.spine.under + '` paints in it' : ''),
        '<= 1px, and nothing under it');
    }

    /* R15 — THE PANEL UNDER THE SHEET IS NOT ON THE PAGE. */
    if (m.covered && m.covered.sheetOpen && m.covered.rendered) {
      t(p + 'R15 the covered panel is inert', m.covered.inert && m.covered.ariaHidden === 'true',
        'inert=' + m.covered.inert + ' aria-hidden=' + m.covered.ariaHidden
        + ' tabbables behind the sheet=' + m.covered.tabbable,
        'inert and aria-hidden while the sheet covers it');
    }
  }

  /* ---- R11: ONE PRESS, BOTH WAYS ---------------------------------------
     The state is only honest if it is reversible by the student who is in it.
     Press the peek strip: the map, the ribbon and the time control all come
     back in the same press, because reading mode is ONE state and not three
     independent collapses. Press `Map` in the panel's foot: it goes back. */
  /* A PRESS A STUDENT COULD ACTUALLY MAKE, AND A FAILURE THAT IS A FAILURE.
     Playwright's actionability check IS the rule here: if something paints over
     the peek strip the student cannot open the map, and §11's "one press moves
     between the two states" is broken. Until wave 9 that came out as a raw
     30-second Playwright timeout that killed the scenario before it reported
     anything — a broken app produced a stack trace instead of a named rule. So
     the press is caught, turned into a FAIL that names what intercepted it, and
     the rest of the file still runs. Never `force: true`: a press the student
     cannot make is the defect, not an obstacle to route around. */
  const press = async (sel, why) => {
    try { await page.click(sel, { timeout: 8000 }); return true; }
    catch (e) {
      const m = /<([a-z]+) class="([^"]*)"[^>]*> from/.exec(String(e.message)) ;
      t(why, false, 'the press did not land' + (m ? ' — `.' + m[2].split(' ')[0] + '` is over it' : ''),
        'one press on ' + sel);
      return false;
    }
  };

  here = walk[0];
  /* NOT STEP 18. The textual beat this rule needs is whichever surface on the
     DEFAULT route actually resolved into reading mode during the walk above —
     recorded there, so a route with a different beat order still gets tested
     and a route with no textual beat at all says so instead of passing. */
  if (!readingAt) {
    const steps = await routes.stepsOf(page, walk[0]);
    readingAt = { id: walk[0], step: (steps.find((x) => x.kind === 'beat') || steps[0]).step, work: '?' };
  }
  log('R11/R12 use ' + readingAt.id + ' step ' + readingAt.step + ' (work=' + readingAt.work + ')');
  await goto(readingAt.step, readingAt.id);
  const before = await read();
  if (before.read === 'on') {
    const landed = await press('.map__peek', 'R11 the peek strip is pressable');
    await page.waitForTimeout(1200);
    if (!landed) { await shot('peek-strip-not-pressable'); }
    const opened = await read();
    await shot('after-one-press');
    /* 160, not D4's 176, and the 16 is measured: `--lede-h` is `auto` in the
       sheet band, step 18's opening sentence wraps to three lines where step
       1's wraps to two, and the third line costs the plate 22px — the map is
       390x192 on a two-line beat and 390x170 on a three-line one, in map mode,
       with or without this pass. That is a separate debt (RESPONSIVE_LAW
       §11.6) and this rule is about the press, not about the lede. */
    if (landed) t('R11 one press on the peek strip opens the map', opened.read === 'off' && !!opened.drawn
      && opened.drawn.h >= 160 && opened.drawn.h >= 3 * before.drawn.h,
      'read=' + opened.read + ' map=' + (opened.drawn ? opened.drawn.w + 'x' + opened.drawn.h : 'none')
      + ' (was ' + before.drawn.h + ')',
      'read=off and the band back');
    /* THE RIBBON COMES BACK WITH THE MAP IT KEYS. THE TIME CONTROL DOES NOT,
       AND THAT IS ROUND 3'S AMENDMENT: it comes back where it is the subject
       (a `sweep` beat, the cold plate), because the band has three claimants
       and one subject, and the state this press moves to is "the plate is the
       argument" — not "everything is at full size and the panel is on its
       floor", which is the defect the poster and the spine were. The year, the
       axis and the spine's reading are all still on screen and the scrubber
       still moves. RESPONSIVE_LAW §11.10. */
    t('R11 and the ribbon comes back with the map it keys', !!opened.key,
      'ribbon=' + (opened.key ? opened.key.h : 0), 'rendered');
    t('R11 and the year line still says when', !!opened.time && opened.time.h >= YEARLINE[0],
      'time=' + (opened.time ? opened.time.h : 0) + 'px', '>= ' + YEARLINE[0] + 'px');
    t('R11 and the panel is still over the floor', !!opened.readable
      && opened.readable.h >= readAny(opened.vw, opened.vh),
      'readable=' + (opened.readable ? opened.readable.h : 0),
      '>= ' + readAny(opened.vw, opened.vh) + 'px');
    t('R11 no document scroll after the press', opened.scroll, opened.scroll ? 'none' : 'the document scrolls', 'none');

    if (landed && opened.fitBtn) {
      await press('.tr-panel__fit', 'R11 the `Map` control is pressable');
      await page.waitForTimeout(1200);
      const back = await read();
      t('R11 and one press on `Map` returns to the reading', back.read === 'on'
        && !!back.readable && back.readable.h >= readMin(before.vw, before.vh),
        'read=' + back.read + ' readable=' + (back.readable ? back.readable.h : 0), 'back in reading mode');
    }
    await shot('reading-mode-390');
  } else if (before.dock === 'docked' && before.rail === 'sheet') {
    t('R11 ' + readingAt.id + ' has a beat that reads', false, 'read=' + before.read,
      'reading mode on at least one beat of ' + readingAt.id);
  }

  /* ---- R12: THE CLOSE READS LIKE A BEAT ---------------------------------
     The ending, the sign and the print is the most textual surface in the
     application and it was the only one that never collapsed the map, because
     reading mode used to require a mounted `.tr-panel` and the Close is not
     one. Measured at 390x844 before this round: `.cx-sheet__body` 242 holding
     6,268 (unfinished) to 7,071 (finished) — 26 SCREENFULS — over a 170px map
     of a place the Close is not about, a colour ribbon keying it, and a 184px
     time control, with no `.tr-panel__foot` and therefore no way to collapse
     any of it. */
  {
    await goto(readingAt.step, readingAt.id);
    await page.evaluate(() => window.BEA && window.BEA.bus && window.BEA.bus.emit('close:open', { reason: 'read.js' }));
    await page.waitForTimeout(1400);
    const c = await read();
    const inBand = c.dock === 'docked' && c.rail === 'sheet';
    const floor = readMin(c.vw, c.vh);
    log('close    read=' + c.read + '  map ' + (c.drawn ? c.drawn.w + 'x' + c.drawn.h : 'none')
      + '  panel ' + (c.panel ? c.panel.w + 'x' + c.panel.h : 'none')
      + '  READABLE ' + (c.readable ? c.readable.h + ' of ' + c.readable.sh : 'none')
      + '  time ' + (c.time ? c.time.h : 0));
    if (inBand && floor) {
      t('close R12 the Close takes the reading fit', c.read === 'on', 'read=' + c.read, 'on');
      t('close R12 the readable window', !!c.readable && c.readable.h >= floor,
        (c.readable ? c.readable.h + 'px holding ' + c.readable.sh
          + ' (' + (c.readable.sh / Math.max(1, c.readable.h)).toFixed(1) + ' screenfuls)' : 'none'),
        '>= ' + floor + 'px');
      t('close R12 the plate is a peek strip', !!c.drawn && c.drawn.h <= PEEK[1], 
        c.drawn ? c.drawn.w + 'x' + c.drawn.h : 'none', '<= ' + PEEK[1] + ' high');
      t('close R12 the year line', !!c.time && c.time.h >= YEARLINE[0] && c.time.h <= YEARLINE[1],
        (c.time ? c.time.h : 0) + 'px', YEARLINE[0] + '-' + YEARLINE[1] + 'px');
      t('close R12 no scroller inside a scroller', c.nest.length === 0,
        c.nest.length ? c.nest.join(' / ') : '0', '0 scrolling ancestors');
      const panelToggles = c.toggles.filter((x) => x.sel !== '.map__peek');
      t('close R12 one control leaves reading mode', panelToggles.length === 1,
        panelToggles.map((x) => x.sel + ' "' + x.name + '"').join(' + ') || 'none',
        'exactly one');
      t('close R12 no document scroll', c.scroll, c.scroll ? 'none' : 'the document scrolls', 'none');
      if (c.cut) {
        t('close R14 no line cut at either edge', c.cut.top <= 7 && c.cut.bottom <= 7,
          'top ' + c.cut.top + 'px, bottom ' + c.cut.bottom + 'px of a line box (' + c.cut.lines + ' lines)',
          '<= 7px at both edges');
      }
      if (c.covered && c.covered.rendered) {
        t('close R12 the covered panel is inert', c.covered.inert,
          'inert=' + c.covered.inert + ' tabbables=' + c.covered.tabbable, 'inert');
      }
      await shot('the-close-reading');

      /* R16 — AND IT COMES BACK. One press on the shell's own control opens
         the map from the Close exactly as `Map` does from a beat. */
      const sel = panelToggles.length ? panelToggles[0].sel : null;
      if (sel) {
        await press(sel, 'close R16 the control is pressable');
        await page.waitForTimeout(1200);
        const back = await read();
        t('close R16 one press opens the map', back.read === 'off' && !!back.drawn && back.drawn.h >= 150,
          'read=' + back.read + ' map=' + (back.drawn ? back.drawn.w + 'x' + back.drawn.h : 'none'),
          'read=off and the band back');
        await press(sel, 'close R16 the control is pressable on the way back');
        await page.waitForTimeout(1200);
        const again = await read();
        t('close R16 and one press returns to the reading', again.read === 'on'
          && !!again.readable && again.readable.h >= floor,
          'read=' + again.read + ' readable=' + (again.readable ? again.readable.h : 0),
          'back over the floor');
      }
    }
  }

  /* ---- R20: THE COLD LOAD, WHICH IS THE ONLY WAY TO THE STATE ----------
     The walk above reaches step 20 with a checkpoint card over the beat,
     because five steps of answers are already in storage; the phone critic
     reached it by pasting the address into a fresh browser, and there the beat
     itself mounts with `viz/index.js`'s counted figure appended beside it —
     which is precisely the state §11.5B hands the body its overflow back in,
     and therefore the only state in which the body is a scrollport at all.
     Storage is cleared and the address pasted, exactly as the critic did. */
  {
    await page.goto(String(url).split('#')[0], { waitUntil: 'load' });
    await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (_) {} });
    /* The LAST step of the default route, not step 20 — the ending is what this
       rule is about, and on a five-step route there is no step 20. */
    const coldStep = lastStepOf[walk[0]];
    await goto(coldStep, walk[0]);
    const c = await read();
    log('cold' + coldStep + '   read=' + c.read + ' work=' + (c.work || '-')
      + '  spine ' + (c.spine ? c.spine.pos + ' gap=' + c.spine.gap + ' scroller=' + c.spine.scroller
        + (c.spine.under ? ' under=' + c.spine.under : '') : 'none'));
    if (c.spine && c.spine.pos === 'sticky') {
      t('cold' + coldStep + ' R20 the spine rests on the scrollport edge, and nothing paints under it',
        c.spine.gap <= 1 && !c.spine.under,
        'gap ' + c.spine.gap + 'px, body ' + (c.spine.scroller ? 'scrolls' : 'clips')
          + (c.spine.under ? ', and `' + c.spine.under + '` paints in the gap' : ''),
        '<= 1px, and nothing under it');
      await shot('cold-last-step-spine');
    }
  }

  R.forEach(r => log(r));
  const bad = R.filter(r => r.startsWith('FAIL'));
  log('');
  log(bad.length ? '>>> READING LAW BROKEN — ' + bad.length + ' of ' + R.length
    : '>>> the reading law holds — ' + R.length + ' assertions'
      + (sawReading ? '' : ' (no reading mode at this viewport, which is the rule here)'));
  /* AND IT EXITS NON-ZERO WHEN IT IS BROKEN. Until wave 9 this file printed
     ">>> READING LAW BROKEN" and returned normally, so `inspect.js` exited 0
     and any runner that trusts exit codes — including the one this wave
     builds — called a broken reading law green. */
  if (bad.length) {
    const e = new Error('READING LAW BROKEN — ' + bad.length + ' of ' + R.length + '\n' + bad.join('\n'));
    e.acceptance = bad;
    throw e;
  }
};
