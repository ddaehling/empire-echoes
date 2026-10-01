/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `budget-working`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: LAYOUT_BUDGET B8: a mounted beat keeps its panel. */
/**
 * budget-working.js — the budget, measured in the state a student is actually in.
 *
 * docs/LAYOUT_BUDGET.md §0 used to be tested only against the cold plate. Round 2
 * found six defects that all lived one attribute away from it — `data-stage=working`
 * with a beat panel mounted — and every one of them shipped green:
 *
 *   · at 390x844 the beat panel mounted with a title, an × and no body
 *   · the Back/Next bar was not rendered at all
 *   · Next was intercepted by a dossier paragraph
 *   · at 768x1024 the map plate painted over the top 100px of the beat panel
 *   · a masthead control sat at x=492 in a 390px viewport
 *   · Compare and Layers were open at once, asserting three years on one screen
 *
 * So this file is budget.js's other half. It cold-loads INTO the lesson — the
 * flagship path, at the viewport a student holds — and asserts the things that
 * make a lesson completable rather than the things that make a plate pretty.
 *
 *   node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w390  --mobile
 *   node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w768  --w 768  --h 1024
 *   node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w900  --w 900  --h 700
 *   node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w1366 --w 1366 --h 768
 *   node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w1440 --w 1440 --h 900
 *   node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w844  --w 844  --h 390
 *   node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w740  --w 740  --h 360
 *
 * It prints PASS/FAIL per rule and `>>> working budget holds` / `>>> WORKING BUDGET VIOLATED`.
 */

/* vw x vh : [drawn map w, drawn map h floor, map % of viewport floor] — with a
   teaching panel open. The panel compresses the plate; it never takes it. */
const FLOOR = {
  '1920x1080': [1100, 560, 40],
  '1440x900':  [880,  430, 38],
  '1366x768':  [840,  380, 36],
  '1024x640':  [560,  280, 30],
  '1024x600':  [560,  260, 28],
  '900x700':   [500,  330, 30],
  '768x1024':  [700,  150, 12],   // sheet band: the map keeps the strip --rail-top-min protects
  '390x844':   [340,  140, 10],
  /* THE TWO LANDSCAPE PHONES — docs/RESPONSIVE_LAW.md §12. The rail is a side
     COLUMN at both, so the map is compressed and never covered, and the floors
     are the compressed width. MEASURED mid-lesson, cold-loaded into
     `#tour=thirty&step=3`: 540x171 (43.8 % of the window) at 844x390 and
     436x126 (35.0 %) at 740x360. Before §12 the same measurement was 540x120
     and 436x90, with the beat's own foot 128px below the fold. */
  '844x390':   [500,  148, 40],
  '740x360':   [400,  118, 32],
};

/* ROUND 2 OF WAVE 9 — THIS FILE COLD-LOADED `#tour=thirty&step=3`.
   `thirty` has not been the default since wave 8, and it is now the full route,
   which no student is given by default. The phone critic put it exactly: "it
   passes at 844x390 because steps 3-5 of `thirty` happen to coincide with
   Lesson One's; that is luck, not coverage." This file owns the whole of
   RESPONSIVE_LAW §12 and every landscape assertion in the suite, so it walks
   the route the app publishes — the default, or the one `--route` names — and
   it finds its step rather than counting to three: the first beat on that route
   that mounts a COUNTED FIGURE, because W18 (the commit control is reachable)
   asserts nothing on a beat that mounts none. If no beat on the route mounts
   one, it takes the middle beat, and W18 says so. */
const routes = require('./lib/routes.js');

module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');
  const URL0 = 'http://localhost:8777/app/';

  await page.goto(URL0, { waitUntil: 'load' });
  const ROUTE = (await routes.chosen(page))[0];
  const steps = await routes.stepsOf(page, ROUTE);
  const withFigure = await page.evaluate(async () => {
    const doc = await (await fetch('js/tours/tours.json')).json();
    return (doc.beats || []).filter((b) => b.onPath).map((b) => b.id);
  });
  const beats = steps.filter((s) => s.kind === 'beat');
  const pick = beats.find((s) => withFigure.includes(s.id)) || beats[Math.floor(beats.length / 2)];
  log('route ' + ROUTE + ' — measuring at step ' + pick.step + ' (' + pick.id + ')'
    + (withFigure.includes(pick.id) ? ', which mounts a counted figure' : ', which mounts no counted figure'));

  // A COLD LOAD, not a resize. Every defect above survived a resize down from
  // desktop and only appeared on first paint at the small viewport.
  await page.goto(routes.href(URL0, ROUTE, pick.step), { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2400);

  const read = () => page.evaluate(() => {
    const app = document.getElementById('app');
    const vis = (e) => {
      if (!e) return false;
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
      const r = e.getBoundingClientRect();
      return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    };
    const box = (s) => { const e = document.querySelector(s); if (!vis(e)) return null; const r = e.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    const at = (b, dx, dy) => (b ? (document.elementFromPoint(b.x + dx, b.y + dy) || null) : null);
    const name = (e) => (e ? e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).trim().split(/\s+/).slice(0, 2).join('.') : '') : 'nothing');

    /* THE TRANSPORT. Wherever the piece has put it — the masthead at desktop
       width, its own dock under 62rem — the two controls that move the lesson
       have to be on screen and have to be the thing under the pointer. */
    const nextEl = document.querySelector('.tr-bar__next');
    const backEl = document.querySelector('.tr-bar__back');
    const nb = nextEl && vis(nextEl) ? nextEl.getBoundingClientRect() : null;
    const nextTop = nb ? document.elementFromPoint(nb.x + nb.width / 2, nb.y + nb.height / 2) : null;

    /* THE BEAT PANEL. A head with no body is the round-2 defect verbatim. */
    const sheetEl = document.querySelector('.app__sheet');
    const bodyEl = document.querySelector('.cx-sheet__body');
    const titleEl = document.querySelector('.cx-sheet__title');
    const tb = titleEl && vis(titleEl) ? titleEl.getBoundingClientRect() : null;
    const titleTop = tb ? document.elementFromPoint(tb.x + Math.min(8, tb.width / 2), tb.y + tb.height / 2) : null;

    /* EVERY REGION PRINTS WHAT IT HOLDS, OR SAYS IT CANNOT.
       A fixed-height region with `overflow: hidden` that is asked for more than
       it has does not report an error; it guillotines a sentence. What is
       measured is the TEXT, not the box: a region may clip a few pixels of a
       child's padding and still print every word, and it is the words that
       teach. Two failures count — a line of type whose own rectangle leaves the
       region, and a run of text truncated by its own `overflow: hidden`
       (a sentence cut mid-word, with or without an ellipsis). */
    const clipped = [];
    const scan = (sel) => {
      const region = document.querySelector(sel);
      if (!vis(region)) return;
      const er = region.getBoundingClientRect();
      const walk = document.createTreeWalker(region, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      let n;
      while ((n = walk.nextNode())) {
        const txt = (n.nodeValue || '').trim();
        if (!txt) continue;
        const e = n.parentElement;
        if (!e || seen.has(e) || !vis(e)) continue;
        seen.add(e);
        // inside something that scrolls on purpose? then it is reachable.
        let scroller = null;
        for (let p = e; p && p !== region; p = p.parentElement) {
          const cs = getComputedStyle(p);
          if (/(auto|scroll)/.test(cs.overflowX + cs.overflowY)) { scroller = p; break; }
        }
        const r = e.getBoundingClientRect();
        if (!scroller && (r.bottom - er.bottom > 1.5 || er.top - r.top > 1.5 || r.right - er.right > 1.5 || er.left - r.left > 1.5)) {
          clipped.push(sel + ' > .' + String(e.className).trim().split(/\s+/)[0] + ' “' + txt.slice(0, 24) + '” outside its region');
          continue;
        }
        const cs = getComputedStyle(e);
        if (cs.overflow !== 'visible' && cs.overflowX !== 'visible'
            && e.scrollWidth - e.clientWidth > 1 && cs.webkitLineClamp === 'none') {
          clipped.push(sel + ' > .' + String(e.className).trim().split(/\s+/)[0] + ' “' + txt.slice(0, 24) + '” cut by ' + (e.scrollWidth - e.clientWidth) + 'px');
        }
      }
    };
    /* The shell's own regions. The time bar is left out on purpose: P03's
       phase lanes are bars whose WIDTH means a span of years, so a lane label
       clipped by its own lane is the encoding working, not a defect. Rule B3
       already caps that region's height. */
    ['.app__bar', '.app__lede', '.app__foot'].forEach(scan);

    /* THE ONE SENTENCE IS A WHOLE SENTENCE.
       `.cx-lede__say` is `-webkit-line-clamp`ed, and a clamped element is
       exactly as tall as its clamp — so a sentence that needed three lines and
       got two is invisible to every geometric check above. It is the round-2
       verdict's "the beat lede is truncated at 900x700: 'Before you look
       closely:…' cuts the beat's actual question", and it is the one place in
       the app where a piece's prose is cut by the shell's arithmetic rather
       than by its own. `scrollHeight` still reports the whole sentence. */
    const say = document.querySelector('.cx-lede__say');
    const sayCut = say ? say.scrollHeight - say.clientHeight : 0;

    /* EVERY MASTHEAD CONTROL IS REACHABLE. Either it is inside the bar's own
       rectangle, or the bar has collapsed into a named disclosure that holds
       it. A control at x=492 in a 390px window is neither. */
    const bar = document.querySelector('.app__bar');
    const barR = bar ? bar.getBoundingClientRect() : null;
    const stranded = [];
    for (const c of document.querySelectorAll('.app__bar button, .app__bar a[href], .app__bar input, .bar__tools button, .bar__tools a[href]')) {
      if (!vis(c)) continue;
      const r = c.getBoundingClientRect();
      if (r.left >= 0 && r.right <= innerWidth + 0.5 && r.top >= -0.5 && r.bottom <= innerHeight + 0.5) continue;
      stranded.push(String(c.className).trim().split(/\s+/)[0] + '@' + Math.round(r.x));
    }

    /* ================= W16 / W17 — THE LANDSCAPE PASS ====================
       docs/RESPONSIVE_LAW.md §12. Every height step in this repository stopped
       at 700px, and the first time anyone ran the app at 844x390 the five grid
       rows summed to 518 of 390. `#app.app` is `max-height: 100dvh; overflow:
       hidden`, so 128px of the layout was laid out below the fold of a page
       that DOES NOT SCROLL:

         .app__sheet      540,48  304x470   bottom at 518
         .tr-panel__foot  541,404 303x53    `more of this beat · Map · Next`
         .cl-blk          557,469 271x33    the through-line, all six clauses
         .cl-blk__finish  468,792  38x36    `Finish`
         .app__time       0,356   540x136   bottom at 492

       W9 could not see any of it — it only looks in the masthead. W12 could
       not either: the document does not scroll, which is the whole problem.
       W8's region scan could not, because these elements were not outside the
       region that owns them; the region was outside the window.

       W16 is the general rule: A CONTROL THE STUDENT MUST PRESS IS INSIDE THE
       WINDOW, or inside something that scrolls to it. W17 is the arithmetic
       behind it: the shell's own rows end at or before the fold. */
    const showing = (e) => {
      for (let p = e; p && p.nodeType === 1; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
      }
      const r = e.getBoundingClientRect();
      return r.width > 2 && r.height > 2;
    };
    const reachableByScroll = (e) => {
      for (let p = e.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (!/(auto|scroll)/.test(cs.overflowX + cs.overflowY)) continue;
        if (p.scrollHeight - p.clientHeight > 2 || p.scrollWidth - p.clientWidth > 2) return true;
      }
      return false;
    };
    /* ROUND 3, THE PHONE: "Landscape recall Commit is dead to a tap." MEASURED
       at 844x390 on core step 10, a spaced-recall card: `Commit` at y 338-382,
       P21's sticky through-line spine at 341.5-374, and
       `document.elementFromPoint` at Commit's own centre returned
       `.cl-blk__spine`; `Skip - it stays unanswered` shared the rect and was
       equally dead. Same at 740x360, Commit 308-352 against the spine at
       311.5-344. W16 asked whether a control was INSIDE THE WINDOW and this
       one was: the rule could not see a control that is on screen, correctly
       laid out, and under something opaque. So it asks the second question
       too — IS IT THE TOPMOST THING AT ITS OWN CENTRE — which is the question
       W5 has always asked about Next and D2 about Back.

       Three exclusions, each measured rather than assumed, because a rule that
       cries wolf on a walk of seventeen beats is a rule nobody runs:
       · a control inside `[inert]` or `[aria-hidden]` — the dossier stacked
         behind an open sheet is not on the page (RESPONSIVE_LAW §11.9), and
         its close button hit-tests to the sheet's, correctly;
       · a control not WHOLLY inside its own scroller's box — half-scrolled-out
         is the scroller working, and 6 of the 17 beats have one at any moment;
       · an inline control, measured at the centre of its FIRST client rect —
         a `more` link that wraps across two lines has a bounding box whose
         centre is in the prose between them. */
    const hidden = (e) => !!e.closest('[inert], [aria-hidden="true"]');
    const scrollerOf = (e) => {
      for (let p = e.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (/(auto|scroll)/.test(cs.overflowX + cs.overflowY)
          && (p.scrollHeight - p.clientHeight > 2 || p.scrollWidth - p.clientWidth > 2)) return p;
      }
      return null;
    };
    const offscreen = [], covered = [];
    for (const c of document.querySelectorAll('#app button, #app a[href], #app input, #app select, #app textarea, #app [tabindex]:not([tabindex="-1"])')) {
      if (!showing(c)) continue;
      /* THE PLATE'S OWN TARGETS ARE NOT CHROME. A territory's 44px hit target
         sits where the territory is drawn, and a map pans: measured at
         390x844, `.map__target` for a place near the eastern edge is at
         x=420 of 390, which is the map working, not a control off the page.
         The plate is measured by B6, D1 and D4 instead. */
      if (c.closest('.stage__map, .stage__over, .map__furniture')) continue;
      const r = c.getBoundingClientRect();
      /* 4px, not 0. `.cl-bar__whole` — "Read it whole", in the provenance
         strip — measured 1.4px past the fold at 900x700 and 1024x640: that is
         a descender in a 26px strip, which chrome.css SS-E already records and
         which W8 owns. A control 1px over is a hairline; a control 128px over
         is off the page, and this rule is about the second. */
      const nm = String(c.className || c.tagName).trim().split(/\s+/)[0]
        + ' “' + (c.textContent || '').trim().slice(0, 20) + '”';
      if (!(r.bottom <= innerHeight + 4 && r.top >= -4 && r.right <= innerWidth + 4 && r.left >= -4)) {
        if (!reachableByScroll(c)) offscreen.push(nm + '@' + Math.round(r.x) + ',' + Math.round(r.y));
        continue;
      }
      /* ---- and now the second question: is anything standing on it? ---- */
      if (hidden(c)) continue;
      const sc = scrollerOf(c);
      if (sc) { const b = sc.getBoundingClientRect(); if (r.top < b.top - 1 || r.bottom > b.bottom + 1) continue; }
      const rects = c.getClientRects();
      const q = rects.length ? rects[0] : r;
      const topAt = document.elementFromPoint(q.x + q.width / 2, q.y + q.height / 2);
      if (!topAt) { covered.push(nm + ' -> nothing'); continue; }
      if (topAt !== c && !c.contains(topAt) && !topAt.contains(c)) {
        covered.push(nm + ' -> ' + String(topAt.className || topAt.tagName).trim().split(/\s+/).slice(0, 2).join('.'));
      }
    }
    const rowsOver = [];
    for (const sel of ['.app__bar', '.app__lede', '.app__stage', '.app__time', '.app__foot', '.app__sheet', '.app__dossier']) {
      const e = document.querySelector(sel);
      if (!e || !showing(e)) continue;
      const r = e.getBoundingClientRect();
      const over = Math.round(Math.max(r.bottom - innerHeight, r.right - innerWidth));
      if (over > 4) rowsOver.push(sel + ' +' + over + 'px');
    }

    /* ONE TEACHING PANEL AT A TIME, AND ONE YEAR ON SCREEN. */
    const surfaces = [];
    if (app.dataset.sheet === 'open') surfaces.push('sheet');
    if (vis(document.querySelector('.cmp__plates')) || vis(document.querySelector('.cmp__grid'))) surfaces.push('compare');
    if (vis(document.querySelector('.tp-workshop, .tp-sheet'))) surfaces.push('workshop');

    const st = window.BEA.store.getState();
    return {
      vp: innerWidth + 'x' + innerHeight,
      rail: app.dataset.rail, stage: app.dataset.stage, bar: app.dataset.bar || 'wide',
      hash: location.hash,
      year: st.year, compareYear: st.compareYear, tour: st.activeTour, step: st.tourStep,
      map: box('.map.is-enlarged') || box('.stage__map canvas') || box('.stage__map svg'),
      sheet: box('.app__sheet'),
      sheetBodyChars: bodyEl ? (bodyEl.textContent || '').trim().length : -1,
      sheetTitle: titleEl ? (titleEl.textContent || '').trim() : '',
      titleUnder: name(titleTop),
      titleIsMine: !!(titleTop && titleTop.closest && titleTop.closest('.app__sheet')),
      next: nb ? { x: Math.round(nb.x), y: Math.round(nb.y), w: Math.round(nb.width), h: Math.round(nb.height) } : null,
      back: backEl && vis(backEl) ? 'yes' : 'no',
      nextUnder: name(nextTop),
      nextIsMine: !!(nextTop && nextTop.closest && nextTop.closest('.tr-bar')),
      clipped, stranded, surfaces, sayCut,
      sayText: say ? (say.textContent || '').trim().slice(0, 60) : '',
      docScroll: document.documentElement.scrollHeight - innerHeight,
      read: (document.getElementById('app').dataset.read || 'off'),
      wideBy: Math.max(document.documentElement.scrollWidth - document.documentElement.clientWidth,
        innerWidth - document.documentElement.clientWidth),
      barMainOver: (() => { const e = document.querySelector('.bar__slot--main'); return e ? e.scrollWidth - e.clientWidth : 0; })(),
      barEndOver: (() => { const e = document.querySelector('.bar__slot--end'); return e ? e.scrollWidth - e.clientWidth : 0; })(),
      offscreen, covered, rowsOver,
    };
  });

  const m = await read();
  const f = FLOOR[m.vp] || FLOOR['1366x768'];
  log('MEASURED ' + JSON.stringify(m));
  await shot('01-beat');

  t('W1 the beat panel has a body', m.sheetBodyChars >= 200, m.sheetBodyChars + ' chars', '>= 200');
  t('W2 the panel is 280px+ tall ', !!m.sheet && m.sheet.h >= 280, m.sheet ? m.sheet.h + 'px' : 'no panel', '>= 280');
  t('W3 nothing paints over its head', m.titleIsMine, m.sheetTitle ? '"' + m.sheetTitle.slice(0, 28) + '" under ' + m.titleUnder : 'no title', 'the title is the topmost thing at its own coordinates');
  t('W4 Back and Next are on screen', !!m.next && m.back === 'yes', m.next ? 'next ' + m.next.w + 'x' + m.next.h + '@' + m.next.x + ',' + m.next.y + ' back:' + m.back : 'absent', 'both rendered and in the viewport');
  t('W5 Next is not intercepted  ', m.nextIsMine, m.nextUnder, 'elementFromPoint lands inside .tr-bar');
  /* W6 / W7 — AMENDED BY READING MODE, docs/RESPONSIVE_LAW.md §11.
     These two rules say the map keeps a plate and a share of the window inside
     a mounted beat, and they were right about a state that had only one shape.
     It has two now, and the beat declares which. On a step whose work is the
     MAP they are unchanged. On a step whose work is TEXT the plate is a 44px
     peek strip and the panel has the band, because the alternative — measured
     at 390x844 on step 18, the Amritsar beat — was a 390x192 map that passed
     W6 and W7 while 2,154px of the beat's own prose was read through a 226px
     window that no rule in this repository could see. The strip is still
     asserted, as a strip and as a control, by `tools/scenarios/read.js` R3,
     and the band comes back in one press (R11). What replaces W6 and W7 in
     that state is R1: the READABLE window, which is the number that decides
     whether a student on a phone finishes the lesson. */
  if (m.read === 'on') {
    t('W6 the map keeps a peek strip', !!m.map && m.map.w >= parseInt(m.vp.split('x')[0], 10) - 8 && m.map.h >= 40 && m.map.h <= 72,
      m.map ? m.map.w + 'x' + m.map.h : 'none', 'full width, 40-72 tall (reading mode; read.js R1/R3/R11)');
  } else {
    t('W6 the map keeps a plate    ', !!m.map && m.map.w >= f[0] && m.map.h >= f[1], m.map ? m.map.w + 'x' + m.map.h : 'none', '>= ' + f[0] + 'x' + f[1]);
    const pct = m.map ? +(100 * m.map.h / parseInt(m.vp.split('x')[1], 10)).toFixed(1) : 0;
    t('W7 the map keeps its share  ', pct >= f[2], pct + '% of viewport height', '>= ' + f[2] + '%');
  }
  t('W8 no region clips its text ', m.clipped.length === 0, m.clipped.join(' | ') || 'clear', 'nothing over its region');
  t('W9 no masthead control is stranded', m.stranded.length === 0, m.stranded.join(', ') || 'clear', 'every control inside the viewport');
  t('W9b the one sentence is whole   ', m.sayCut <= 1, m.sayCut + 'px of it clamped away — "' + m.sayText + '"', 'nothing lost to -webkit-line-clamp');
  t('W10 one teaching panel      ', m.surfaces.length <= 1, m.surfaces.join('+') || 'none', '<= 1 open at once');
  t('W11 the year is single valued', m.compareYear == null || m.surfaces.includes('compare'), 'year ' + m.year + ' compare ' + m.compareYear, 'no compare year without the compare plate');
  t('W12 no document scroll      ', m.docScroll <= 0 && m.wideBy <= 0, m.docScroll + 'px tall, ' + m.wideBy + 'px wide', 'both <= 0');
  t('W16 no control off the page ', m.offscreen.length === 0, m.offscreen.slice(0, 6).join(' | ') || 'clear', 'every control inside the window, or inside something that scrolls to it');
  t('W16h nothing stands on a control', m.covered.length === 0, m.covered.slice(0, 6).join(' | ') || 'clear', 'every control on screen is the topmost thing at its own centre');
  t('W17 the rows sum to the window', m.rowsOver.length === 0, m.rowsOver.join(' | ') || 'clear', 'no shell region past the fold');

  /* ================= W18 — THE FIGURES THAT CARRY T3, T8 AND T14 ==========
     ROUND 3, THE RUBRIC, as the one MATERIAL defect of the round: at 390x844
     the three ON_PATH figures were unreachable. `viz/index.js` appends
     `.viz-onpath` as a SIBLING of `.tr-panel` inside `.cx-sheet__body`, and
     `layout.css`'s reading-mode clip made that body `overflow: hidden`, so the
     figure was laid out at y=764 with nothing to scroll and its commit control
     at y=1,388 in an 844px window. MEASURED then: eight wheel events over the
     sheet moved scrollTop 0 -> 0; `.tr-panel__scroll` scrolled to its own end
     and stopped; `MORE OF THIS BEAT ↓` pressed to exhaustion revealed nothing;
     the fallback aux control was `display: none` at this width. The default
     route lost T3 — the scale of the slave trade — and T8, on the one device
     most students use, while passing every rule in this repository.

     No existing rule could see it. W16 looks at CONTROLS and the commit
     control was off the window, but `reachableByScroll` answered "yes" for the
     document's own scrollers on the way up. `check-warrants.js` does not cover
     the viz specs mounted on beats. So the rule is stated as the thing that
     was actually lost: THE CONTROL THAT COMMITS THE GUESS IS REACHABLE — in
     the window already, or inside something that scrolls to it, AND topmost at
     its own centre once it is there.

     It is asserted here because this file cold-loads into the first beat on
     the published route that MOUNTS a counted figure — found by asking the
     authored record which beats carry one, not by counting to three. A step
     where no figure is mounted asserts nothing, which is honest: whether a
     figure belongs on a step is the path's business, not the budget's.
     RESPONSIVE_LAW §11.5B. */
  const figs = await page.evaluate(() => {
    const bad = [], seen = [];
    for (const f of document.querySelectorAll('.viz-onpath')) {
      const id = f.dataset.onpath || f.dataset.t || 'figure';
      seen.push(id);
      const btn = [...f.querySelectorAll('button')].find((b) => /commit/i.test(b.textContent || ''));
      if (!btn) { bad.push(id + ': no commit control in the figure'); continue; }
      let sc = null;
      for (let p = btn.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight - p.clientHeight > 2) { sc = p; break; }
      }
      const r0 = btn.getBoundingClientRect();
      const already = r0.top >= -2 && r0.bottom <= innerHeight + 2;
      if (!already && !sc) {
        bad.push(id + ': commit at y=' + Math.round(r0.y) + ' of ' + innerHeight + ', no scrollable ancestor');
        continue;
      }
      if (!already) { try { btn.scrollIntoView({ block: 'center' }); } catch (_) { btn.scrollIntoView(); } }
      const r = btn.getBoundingClientRect();
      if (r.top < -2 || r.bottom > innerHeight + 2) {
        bad.push(id + ': commit at y=' + Math.round(r.y) + ' after scrolling to it');
        continue;
      }
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      if (!(top && (top === btn || btn.contains(top) || top.contains(btn)))) {
        bad.push(id + ': commit covered by ' + (top ? String(top.className || top.tagName).trim().split(/\s+/)[0] : 'nothing'));
      }
    }
    return { bad, seen };
  });
  t('W18 the counted figure is reachable', figs.bad.length === 0,
    (figs.seen.length ? figs.seen.join(', ') : 'no figure on this step') + (figs.bad.length ? ' — ' + figs.bad.join(' | ') : ''),
    "every ON_PATH figure's commit control scrolls into view and hit-tests to itself");

  /* ---- and then the thing the round-2 critic could not do: press Next. ---- */
  let advanced = 0, blocked = '';
  for (let i = 0; i < 3; i++) {
    const before = await page.evaluate(() => window.BEA.store.getState().tourStep);
    const hit = await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      if (!b) return 'no next';
      if (b.disabled || b.getAttribute('data-locked') === 'yes') return 'gate';
      const r = b.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      if (!top || !top.closest('.tr-bar')) return 'intercepted by ' + (top ? String(top.className).slice(0, 30) : 'nothing');
      b.click();
      return 'ok';
    });
    if (hit !== 'ok') { blocked = hit; break; }
    await page.waitForTimeout(1300);
    const after = await page.evaluate(() => window.BEA.store.getState().tourStep);
    if (after === before) { blocked = 'Next did nothing'; break; }
    advanced++;
  }
  t('W13 the path advances       ', advanced >= 2 || blocked === 'gate', advanced + ' step(s)' + (blocked ? ' then: ' + blocked : ''), '2 presses of Next move the lesson');
  const m2 = await read();
  log('AFTER 2 ' + JSON.stringify({ step: m2.step, sheetBodyChars: m2.sheetBodyChars, title: m2.sheetTitle, clipped: m2.clipped, stranded: m2.stranded, surfaces: m2.surfaces, docScroll: m2.docScroll, wideBy: m2.wideBy }));
  t('W14 later beats have bodies ', m2.sheetBodyChars >= 200, m2.sheetBodyChars + ' chars at step ' + m2.step, '>= 200');
  t('W15 still nothing clipped   ', m2.clipped.length === 0 && m2.stranded.length === 0 && m2.sayCut <= 1 && m2.docScroll <= 0 && m2.wideBy <= 0,
    (m2.clipped.concat(m2.stranded).join(' | ') || 'clear') + ', sentence -' + m2.sayCut + ', scroll ' + m2.docScroll + '/' + m2.wideBy, 'clear');
  t('W16b still nothing off the page', m2.offscreen.length === 0 && m2.covered.length === 0 && m2.rowsOver.length === 0,
    m2.offscreen.slice(0, 4).concat(m2.covered.slice(0, 4)).concat(m2.rowsOver).join(' | ') || 'clear', 'clear two beats later');
  await shot('02-after-next');

  log(R.join('\n'));
  const bad = R.filter((r) => r.startsWith('FAIL'));
  if (!bad.length) { log('>>> working budget holds — ' + R.length + ' assertions on ' + ROUTE); return; }
  /* AND IT THROWS. This file printed ">>> WORKING BUDGET VIOLATED" and exited
     0 for as long as it has existed, so anything trusting an exit code called
     it green while it was saying the opposite. */
  log('>>> WORKING BUDGET VIOLATED — ' + bad.length + ' of ' + R.length + ' on ' + ROUTE);
  throw new Error('working budget: ' + bad.length + ' of ' + R.length
    + ' assertions failed on ' + ROUTE + '\n' + bad.join('\n'));
};
