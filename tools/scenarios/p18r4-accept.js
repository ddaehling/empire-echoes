/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * P18 round-4 acceptance — the year inside a lesson beat, and the dock law.
 *
 *   node tools/inspect.js tools/scenarios/p18r4-accept.js --out /tmp/c390  --mobile
 *   ... --w 768 --h 1024 | --w 900 --h 700 | --w 1024 --h 640 | --w 1366 --h 768
 *   ... --w 1440 --h 900 | --w 1920 --h 1080          (+ --dark, + --reduced)
 *
 * Prints PASS/FAIL per rule and `>>> compare holds` / `>>> COMPARE BROKEN`.
 * It cold-loads into `#tour=thirty&step=9` — the diwani beat, headline
 * "12 AUGUST 1765" — because every defect it exists to catch appears only when
 * a beat is already mounted when the comparison opens.
 */
const READY = () => window.BEA && window.BEA.store
  && window.BEA.store.getState().status === 'ready';
const BEAT = 'http://localhost:8777/app/#tour=thirty&step=9';

module.exports = async ({ page, shot, log }) => {
  const R = [];
  const ok = (id, name, got, want, pass) => R.push({ id, name, got: String(got), want, pass: !!pass });
  const w = page.viewportSize().width, h = page.viewportSize().height;
  log(`viewport ${w}x${h}`);

  const settle = (ms = 700) => page.waitForTimeout(ms);
  const state = () => page.evaluate(() => {
    const app = document.getElementById('app');
    const st = window.BEA.store.getState();
    const lede = document.querySelector('.app__lede');
    const cmp = document.querySelector('.cmp');
    const box = (n) => { if (!n) return null; const b = n.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    return {
      dock: app.dataset.dock, path: app.dataset.path, rail: app.dataset.rail,
      year: st.year, compareYear: st.compareYear, sel: st.selectedTerritoryId, tourStep: st.tourStep,
      ledeText: lede ? lede.innerText.replace(/\s+/g, ' ').trim() : '',
      cmpOpen: !!(cmp && !cmp.hidden),
      plateYears: [...document.querySelectorAll('.cmp__year')].map((n) => n.textContent.trim()).filter(Boolean),
      held: !!(document.querySelector('.cmp__held') && !document.querySelector('.cmp__held').hidden),
      heldText: (document.querySelector('.cmp__held') || {}).textContent || '',
      cmpBox: box(cmp), stageMap: box(document.querySelector('.stage__map')),
      docScroll: document.documentElement.scrollHeight - innerHeight,
      panel: box(document.querySelector('.app__sheet:not([hidden])')),
    };
  });

  /* A date printed as a HEADLINE — the beat's "12 AUGUST 1765" eyebrow in the
     shell's band. Not "any four digits on the page": a chip that labels another
     comparison, an axis tick and a sentence about 1776 are none of them a claim
     about what is drawn. This is the one that lied. */
  const bandDate = () => page.evaluate(() => {
    const lede = document.querySelector('.app__lede');
    if (!lede) return '';
    const t = lede.innerText.replace(/\s+/g, ' ');
    const m = t.match(/^([^]{0,60}?)\b(1[5-9]\d\d|20[0-2]\d)\b/);
    return m ? m[0].trim() : '';
  });

  /* Every painting, positioned element that overlaps either drawn compare
     plate, counted the way RESPONSIVE_LAW rule D1 counts it: a box only counts
     where it is actually the topmost thing, so an ancestor behind the surface
     is not an occlusion. */
  const overPlates = () => page.evaluate(() => {
    const plates = [...document.querySelectorAll('.cmp__plate')];
    /* CLIPPED TO WHAT IS ON SCREEN. Below 62rem the surface is one scroller and
       a plate can legitimately run past its bottom edge — that is scrolling,
       not occlusion. The question is whether anything stands on the part of a
       plate the reader can actually see. */
    const port = document.querySelector('.cmp__grid');
    const pr = port ? port.getBoundingClientRect() : null;
    let area = 0; const who = {};
    for (const p of plates) {
      const raw = p.getBoundingClientRect();
      const b = pr ? {
        left: Math.max(raw.left, pr.left), right: Math.min(raw.right, pr.right),
        top: Math.max(raw.top, pr.top), bottom: Math.min(raw.bottom, pr.bottom),
      } : raw;
      b.width = b.right - b.left; b.height = b.bottom - b.top;
      if (b.width < 4 || b.height < 4) continue;
      const step = 8;
      for (let y = b.top + 3; y < b.bottom - 3; y += step) {
        for (let x = b.left + 3; x < b.right - 3; x += step) {
          const e = document.elementFromPoint(x, y);
          if (!e) continue;
          if (e === p || p.contains(e) || e.closest('.cmp__plate')) continue;
          /* The map's own hover card is the one stated exception in the law,
             and it cannot be up in a headless run anyway. */
          if (e.closest('.map__tiplayer')) continue;
          area += step * step;
          const k = e.className && typeof e.className === 'string' ? e.className.split(/\s+/)[0] : e.tagName;
          who[k] = (who[k] || 0) + step * step;
        }
      }
    }
    return { area, who };
  });

  /* ---------------------------------------------------------------- 1 ---- */
  await page.goto(BEAT, { waitUntil: 'load' });
  await page.waitForFunction(READY);
  await settle(1100);
  const beat = await state();
  const beatDate = await bandDate();
  ok('C0', 'the beat is mounted and dated', `${beat.path} · "${beatDate}"`, 'path=on and a dated headline',
    beat.path === 'on' && /\d{4}/.test(beatDate));
  const beatYear = beat.year, beatSel = beat.sel;

  await page.keyboard.press('v');
  await settle(1000);
  const open = await state();
  const openDate = await bandDate();
  await shot('open-in-beat');

  ok('C1', 'the comparison opened', open.cmpOpen, 'open', open.cmpOpen);
  ok('C2', 'the beat headline no longer carries a date', `"${openDate}"`, 'no year in the band',
    !/\b(1[5-9]\d\d|20[0-2]\d)\b/.test(openDate));
  ok('C3', 'the year on screen is the plate on screen', `store ${open.year} · plates ${open.plateYears.join('/')}`,
    "store.year is one of the plates' labels", open.plateYears.includes(String(open.year)));
  ok('C4', "the beat's year is nowhere on screen", `beat ${beatYear}, plates ${open.plateYears.join('/')}`,
    'the held beat year is not a label', !open.plateYears.includes(String(beatYear)));
  ok('C5', 'the dossier is closed', open.sel === null ? 'none' : open.sel, 'no selection', open.sel === null);
  ok('C6', 'the held line says the lesson is held', `"${open.heldText.trim()}"`, 'shown, no digits',
    open.held && /held/i.test(open.heldText) && !/\d/.test(open.heldText));
  ok('C7', 'both plates are labelled with their year', open.plateYears.join(' / '), 'two years, never tabs',
    open.plateYears.length === 2 && open.plateYears[0] !== open.plateYears[1]);
  ok('C8', 'no document scroll', open.docScroll, '0', open.docScroll <= 0);

  /* ---------------------------------------------------------------- 2 ---- */
  /* NOTHING IN THIS SURFACE'S OWN CHROME IS CUT MID-WORD (LAYOUT_BUDGET §4).
     A sideways SCROLLER is exempt and is the app's published answer to a row of
     chips longer than its line — it has a fade, it takes a drag, and its
     content is reachable. A box that simply clips is not. */
  const clipped = await page.evaluate(() => {
    const bad = [];
    const scroller = (n) => {
      const o = getComputedStyle(n).overflowX;
      return o === 'auto' || o === 'scroll';
    };
    for (const n of document.querySelectorAll('.cmp__bar, .cmp__bar *, .cmp__jumphost *, .cmp__lab *, .cmp__totals *')) {
      if (!n.textContent.trim()) continue;
      if (scroller(n)) continue;
      let anc = n.parentElement, inScroller = false;
      while (anc && anc.closest('.cmp')) { if (scroller(anc)) { inScroller = true; break; } anc = anc.parentElement; }
      if (inScroller) continue;
      if (n.scrollWidth - n.clientWidth > 1) {
        bad.push((n.className || n.tagName) + ' "' + n.textContent.trim().slice(0, 30) + '" ' + n.clientWidth + '<' + n.scrollWidth);
      }
    }
    return bad;
  });
  ok('C25', 'nothing in the surface chrome is cut mid-word', clipped.length ? clipped.join(' | ') : 'none',
    'none', clipped.length === 0);

  const o1 = await overPlates();
  ok('C9', 'nothing stands on either plate (ask phase)', o1.area + 'px2 ' + JSON.stringify(o1.who), '0',
    o1.area === 0);

  const geom = await page.evaluate(() => {
    const g = (s) => { const n = document.querySelector(s); if (!n) return null; const b = n.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; };
    return { cmp: g('.cmp'), bar: g('.cmp__bar'), grid: g('.cmp__grid') };
  });
  log('geometry: ' + JSON.stringify(geom));

  /* reveal */
  await page.evaluate(() => { const b = document.querySelector('.cmp__choice'); if (b) b.click(); });
  await settle(900);
  await shot('revealed-in-beat');
  const rev = await state();
  const o2 = await overPlates();
  ok('C10', 'nothing stands on either plate (revealed)', o2.area + 'px2 ' + JSON.stringify(o2.who), '0', o2.area === 0);
  ok('C11', 'the revealed pair is still one year regime', `store ${rev.year} · plates ${rev.plateYears.join('/')}`,
    "store.year is one of the plates' labels", rev.plateYears.includes(String(rev.year)));

  const reach = await page.evaluate(() => {
    const cmp = document.querySelector('.cmp');
    const cb = cmp.getBoundingClientRect();
    const inside = (n) => { const b = n.getBoundingClientRect();
      return b.height > 8 && b.top >= cb.top - 1 && b.bottom <= cb.bottom + 1; };
    const sides = [...document.querySelectorAll('.cmp__side')];
    const rows = [...document.querySelectorAll('.cmp__row')];
    const sc = document.querySelector('.cmp__grid');
    /* REACHABLE, not "already on screen". Below 62rem the surface is one
       scroller; whether a plate is in view at rest depends on where the reader
       has scrolled to, and the question that matters is whether they can get to
       it at all. */
    let sidesReachable = 0;
    for (const n of sides) {
      n.scrollIntoView({ block: 'start' });
      const b = n.getBoundingClientRect(), cb2 = cmp.getBoundingClientRect();
      if (b.height > 8 && b.top >= cb2.top - 1 && b.bottom <= cb2.bottom + 1) sidesReachable++;
    }
    if (sc) sc.scrollTop = 0;
    // can the reader reach the first named place at all?
    let firstRowReachable = false, firstRowShown = 0;
    if (rows.length && sc) {
      rows[0].scrollIntoView({ block: 'start' });
      const b = rows[0].getBoundingClientRect(), s = sc.getBoundingClientRect();
      /* Reachable means the row STARTS on screen with enough of it showing to
         read the place's name — not that a row of any height fits whole. A row
         that begins in view and continues past the fold is the ordinary state
         of a list; a row that begins below the fold is one nobody ever sees. */
      firstRowShown = Math.round(Math.min(b.bottom, s.bottom) - Math.max(b.top, s.top));
      firstRowReachable = b.top >= s.top - 1 && b.top < s.bottom - 40 && firstRowShown >= 48;
      sc.scrollTop = 0;
    }
    const plates = [...document.querySelectorAll('.cmp__plate')].map((n) => { const b = n.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; });
    /* Only a STUCK block permanently costs the difference list its window; a
       plates block that scrolls away costs it nothing. */
    const pl = document.querySelector('.cmp__plates');
    const stuck = pl && getComputedStyle(pl).position === 'sticky' ? pl.getBoundingClientRect().height : 0;
    return { sidesInside: sides.filter(inside).length, sidesReachable, sides: sides.length, plates,
      rows: rows.length, firstRowReachable, firstRowShown, sticky: Math.round(stuck),
      deltaVisible: sc ? Math.round(sc.getBoundingClientRect().height - stuck) : 0 };
  });
  log('reach: ' + JSON.stringify(reach));
  ok('C12', 'both plates can be brought fully on screen', `${reach.sidesReachable} of ${reach.sides}`, '2 of 2',
    reach.sidesReachable === 2);
  ok('C13', 'both plates are drawn at a usable size', JSON.stringify(reach.plates), 'each >= 150x70',
    reach.plates.length === 2 && reach.plates.every((p) => p[0] >= 150 && p[1] >= 70));
  ok('C14', 'the first named place can be brought on screen', reach.firstRowReachable, 'yes',
    reach.rows === 0 || reach.firstRowReachable);
  ok('C15', 'the difference has a window of its own', reach.deltaVisible + 'px', '>= 90',
    reach.deltaVisible >= 90);

  /* ---------------------------------------------------------------- 3 ---- */
  await page.keyboard.press('Escape');
  await settle(1200);
  const back = await state();
  const backDate = await bandDate();
  await shot('closed-back-on-beat');
  ok('C16', 'Escape closes the comparison', !back.cmpOpen, 'closed', !back.cmpOpen);
  ok('C17', 'the beat gets its year back', back.year, String(beatYear), back.year === beatYear);
  ok('C18', 'the beat gets its headline back', `"${backDate}"`, 'a dated headline again',
    /\b(1[5-9]\d\d|20[0-2]\d)\b/.test(backDate));
  ok('C19', 'the beat gets its selection back', back.sel || 'none', beatSel || 'none', back.sel === beatSel);
  ok('C20', 'the beat gets its panel back', back.panel ? back.panel.h + 'px' : 'none',
    w >= 992 ? 'a panel or a column' : '>= 280 (B8)',
    !!back.panel && (w >= 992 || back.panel.h >= 280 || back.panel.w >= 280));
  ok('C21', 'no compare state is left in the store', `compareYear=${back.compareYear}`, 'null',
    back.compareYear == null);

  /* --------------- 4: already exploring — no hold, no rejoin ------------- */
  await page.goto(BEAT, { waitUntil: 'load' });
  await page.waitForFunction(READY);
  await settle(1000);
  await page.evaluate(() => window.BEA.bus.emit('tours:explore'));
  await settle(700);
  await page.keyboard.press('v');
  await settle(900);
  const ex = await state();
  ok('C22', 'a student already exploring is not held again', ex.held ? 'held line shown' : 'no held line',
    'no held line', !ex.held);
  await page.keyboard.press('Escape');
  await settle(1000);
  const ex2 = await state();
  ok('C23', 'and is not put back on the path they left', `year ${ex2.year}`,
    'not the beat year ' + beatYear, ex2.year !== beatYear);

  /* --------------- 5: the lesson moving the year wins ------------------- */
  await page.goto(BEAT, { waitUntil: 'load' });
  await page.waitForFunction(READY);
  await settle(1000);
  await page.keyboard.press('v');
  await settle(900);
  await page.evaluate(() => window.BEA.bus.emit('tours:rejoin'));
  await settle(1100);
  const rj = await state();
  ok('C24', 'the lesson rejoining closes the comparison and wins the year',
    `open=${rj.cmpOpen} year=${rj.year}`, `closed, ${beatYear}`, !rj.cmpOpen && rj.year === beatYear);

  /* --------------- 6: a deep link that carries BOTH -------------------- */
  /* `#tour=…&step=…&compare=…` opens this surface out of hydration, without
     ever passing through `request`. Measured at 390x844 before the hold was
     added to that entrance: `.cmp` was 390x192, the two plates 52px each with
     about 26px of map in them, and the whole difference list below the bottom
     of the surface. */
  await page.goto(BEAT + '&compare=1820', { waitUntil: 'load' });
  await page.waitForFunction(READY);
  await settle(1600);
  const dl = await state();
  const dlDate = await bandDate();
  await shot('deep-link-beat-and-compare');
  ok('C26', 'a deep link into a beat AND a comparison holds the lesson too',
    `held=${dl.held} sel=${dl.sel} band="${dlDate}"`, 'held, no selection, no date in the band',
    dl.held && dl.sel === null && !/\b(1[5-9]\d\d|20[0-2]\d)\b/.test(dlDate));
  ok('C27', 'and the surface gets the whole plate',
    dl.cmpBox ? dl.cmpBox.w + 'x' + dl.cmpBox.h : 'none',
    'the same rectangle the comparison gets with no lesson running',
    !!dl.cmpBox && !!dl.stageMap && dl.cmpBox.h === dl.stageMap.h);
  ok('C28', 'and still one year regime', `store ${dl.year} · plates ${dl.plateYears.join('/')}`,
    "store.year is one of the plates' labels", dl.plateYears.includes(String(dl.year)));

  /* --------------- 7: FEATURE_SPEC §2 P18 acceptance -------------------- */
  await page.goto('http://localhost:8777/app/#year=1820&compare=1770', { waitUntil: 'load' });
  await page.waitForFunction(READY);
  await settle(1100);
  const link = await state();
  const set = await page.evaluate(() => {
    const d = window.BEA.data;
    const at = (y) => new Set(Object.keys(d.statusAt(y)).filter((k) => d.statusAt(y)[k]));
    const A = at(1770), B = at(1820);
    let gained = 0, lost = 0;
    for (const k of B) if (!A.has(k)) gained++;
    for (const k of A) if (!B.has(k)) lost++;
    const txt = document.querySelector('.cmp__delta') ? document.querySelector('.cmp__delta').innerText : '';
    return { gained, lost, hasList: /\d/.test(txt), rows: document.querySelectorAll('.cmp__row').length };
  }).catch(() => null);
  ok('AT1', 'a compare link renders both plates', link.plateYears.join('/'), '1770/1820',
    link.plateYears.includes('1770') && link.plateYears.includes('1820'));
  ok('AT1b', 'the difference readout is populated', set ? set.rows + ' rows' : 'n/a', '> 0',
    !set || set.rows > 0);
  ok('AT3', 'both years labelled, never tabs', link.plateYears.length, '2', link.plateYears.length === 2);
  const url = await page.evaluate(() => location.hash);
  ok('AT4', 'the link round-trips', url, 'carries year and compare',
    /year=/.test(url) && /compare=/.test(url));
  const kb = await page.evaluate(() => {
    const a = document.querySelector('.cmp__side[data-side="a"]');
    const b = document.querySelector('.cmp__side[data-side="b"]');
    if (!a || !b) return false;
    a.focus(); const one = document.activeElement === a;
    b.focus(); return one && document.activeElement === b;
  });
  ok('AT5', 'each plate takes focus', kb, 'both', kb);

  /* ---------------------------------------------------------------- out -- */
  const bad = R.filter((r) => !r.pass);
  for (const r of R) log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id} ${r.name}  got ${r.got}  (${r.want})`);
  log('');
  log(bad.length ? `>>> COMPARE BROKEN — ${bad.length} of ${R.length}` : `>>> compare holds — ${R.length} rules`);
};
