/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * P18 round-5 acceptance — the prediction phase, the chip row, and the cut line.
 *
 *   node tools/inspect.js tools/scenarios/p18r5-accept.js --out /tmp/p390  --mobile
 *   ... --w 768 --h 1024 | --w 900 --h 700 | --w 1024 --h 640 | --w 1366 --h 768
 *   ... --w 1440 --h 900 | --w 1920 --h 1080 | --w 844 --h 390   (+ --dark, + --reduced)
 *
 * Prints PASS/FAIL per rule and `>>> compare r5 holds` / `>>> COMPARE R5 BROKEN`.
 * It cold-loads into `#tour=thirty&step=9`, like p18r4-accept.js, because every
 * defect it exists to catch was reported inside a mounted beat.
 *
 * What each rule is for, in the words of the round-5 verdict:
 *
 *   P1  "the compare plate draws one map (1770) and asks 'Was it holding more
 *        of the map in 1770, or in 1820?' with no 1820 plate visible and no
 *        toggle" — the second plate is on screen from the first frame, face
 *        down, labelled with its own year, and counting nothing.
 *   P2  the third answer to that question sat at y=638 in a box that ended at
 *        628. Every answer is whole and in the scrollport AT REST.
 *   P3  "the preset chip row clips '1945' at the right edge with no scroll
 *        affordance" — the row scrolls, the fade is keyed to the measurement,
 *        and the pressed chip is inside the row.
 *   P4  "sliced clean through the x-height" — a scroller with more below fades
 *        its last line; a scroller at its end does not.
 *   P5  committing turns a card over. It does not re-lay the surface out.
 *   P6  LAYOUT_BUDGET B5 / RESPONSIVE_LAW: nothing stands on either plate, in
 *        either phase.
 */
const READY = () => window.BEA && window.BEA.store
  && window.BEA.store.getState().status === 'ready';
const BEAT = 'http://localhost:8777/app/#tour=thirty&step=9';

module.exports = async ({ page, shot, log }) => {
  const R = [];
  const ok = (id, name, got, want, pass) => R.push({ id, name, got: String(got), want, pass: !!pass });
  const w = page.viewportSize().width, h = page.viewportSize().height;
  log(`viewport ${w}x${h}`);
  const settle = (ms = 900) => page.waitForTimeout(ms);

  /* Whichever element is actually the scrollport for the question or the
     difference at this width — the whole grid below 62rem, the column above. */
  const READ = () => page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const box = (n) => { if (!n) return null; const b = n.getBoundingClientRect();
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
        r: Math.round(b.right), b: Math.round(b.bottom) }; };
    const grid = q('.cmp__grid'), ask = q('.cmp__ask'), delta = q('.cmp__delta');
    const port = (n) => (n && n.scrollHeight > n.clientHeight + 2) ? n : null;
    const sc = port(grid) || port(ask) || port(delta) || grid;
    const scb = sc.getBoundingClientRect();
    const face = q('.cmp__facedown');
    const faceShown = !!face && getComputedStyle(face).display !== 'none';
    const pk = q('.cmp__picker');
    const pressed = pk && pk.querySelector('.cmp__pick[aria-pressed="true"]');
    const pb = pk && pk.getBoundingClientRect();
    const ab = pressed && pressed.getBoundingClientRect();
    const whole = (n) => { const b = n.getBoundingClientRect();
      return b.top >= scb.top - 0.5 && b.bottom <= scb.bottom + 0.5; };
    return {
      phase: q('.cmp').dataset.phase,
      plateA: box(q('.cmp__side[data-side="a"] .cmp__plate')),
      plateB: box(q('.cmp__side[data-side="b"] .cmp__plate')),
      years: [...document.querySelectorAll('.cmp__year')].map((n) => n.textContent.trim()),
      faceShown,
      faceText: face ? face.innerText.replace(/\s+/g, ' ').trim() : '',
      /* A face-down plate must not print the count that answers the question. */
      totB: (q('.cmp__side[data-side="b"] .cmp__totals') || {}).innerText || '',
      choices: [...document.querySelectorAll('.cmp__choice')].map((n) => ({
        t: n.textContent.trim(), whole: whole(n),
      })),
      scroller: sc.className.split(/\s+/)[0], scPort: box(sc),
      scMore: sc.scrollHeight - sc.clientHeight,
      fadeOn: sc.dataset.more === 'yes',
      fadeCss: !!(getComputedStyle(sc).maskImage || '').match(/gradient/),
      picker: pb ? { cw: pk.clientWidth, sw: pk.scrollWidth, of: pk.dataset.of || 'unset',
        pressedInside: !!(ab && ab.left >= pb.left - 1 && ab.right <= pb.right + 1),
        pressed: pressed ? pressed.textContent : null } : null,
      docScroll: document.documentElement.scrollHeight - innerHeight,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  /* Every painting element that is the topmost thing over either drawn plate,
     sampled on an 8px grid and clipped to what is on screen — the same counter
     p18r4-accept.js rule C9/C10 uses. */
  const overPlates = () => page.evaluate(() => {
    const plates = [...document.querySelectorAll('.cmp__plate')];
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
      for (let y = b.top + 3; y < b.bottom - 3; y += 8) {
        for (let x = b.left + 3; x < b.right - 3; x += 8) {
          const e = document.elementFromPoint(x, y);
          if (!e) continue;
          if (e === p || p.contains(e) || e.closest('.cmp__plate')) continue;
          if (e.closest('.map__tiplayer')) continue;
          area += 64;
          const k = e.className && typeof e.className === 'string' ? e.className.split(/\s+/)[0] : e.tagName;
          who[k] = (who[k] || 0) + 64;
        }
      }
    }
    return { area, who };
  });

  await page.goto(BEAT, { waitUntil: 'load' });
  await page.waitForFunction(READY);
  await settle(1300);
  await page.keyboard.press('v');
  await settle(1200);
  await shot('ask');

  const a = await READ();

  /* ------------------------------------------------------------ P1 ------ */
  ok('P1', 'the second plate is on screen in the ask phase, face down',
    `shown=${a.faceShown} "${a.faceText.slice(0, 40)}"`, 'a face-down card, with words on it',
    a.faceShown && /face down/i.test(a.faceText) && /commit/i.test(a.faceText));
  ok('P1b', 'both years are labelled before the reveal', a.years.join(' / '),
    'two different years', a.years.length === 2 && a.years[0] !== a.years[1]);
  ok('P1c', 'the face-down plate counts nothing', `"${a.totB.trim()}"`,
    'no figure that answers the question', !/\d/.test(a.totB));
  ok('P1d', 'the drawn plate is still a map', a.plateA ? a.plateA.w + 'x' + a.plateA.h : 'none',
    '>= 150x60', !!a.plateA && a.plateA.w >= 150 && a.plateA.h >= 60);

  /* ------------------------------------------------------------ P2 ------ */
  const cut = a.choices.filter((c) => !c.whole);
  ok('P2', 'every answer is whole and in the scrollport at rest',
    cut.length ? cut.map((c) => c.t).join(' | ') : `${a.choices.length} answers, all whole`,
    'none below the fold', a.choices.length > 0 && cut.length === 0);

  /* ------------------------------------------------------------ P3 ------ */
  const pk = a.picker;
  ok('P3', 'no comparison chip is cut without the row saying it scrolls',
    pk ? `${pk.cw} of ${pk.sw}, fade=${pk.of}` : 'no picker',
    'fits, or scrolls with a fade at the end that has more',
    !!pk && (pk.sw <= pk.cw + 2 ? pk.of === 'none' : (pk.of === 'end' || pk.of === 'start' || pk.of === 'both')));
  ok('P3b', 'the pressed chip is inside the row', pk ? `${pk.pressed} inside=${pk.pressedInside}` : 'n/a',
    'inside', !pk || pk.pressedInside);

  /* ------------------------------------------------------------ P6a ----- */
  const o1 = await overPlates();
  ok('P6a', 'nothing stands on either plate (ask)', o1.area + 'px2 ' + JSON.stringify(o1.who), '0', o1.area === 0);

  /* ------------------------------------------------------------ P4a ----- */
  ok('P4a', 'a question with more below fades its last line, and only then',
    `more=${a.scMore}px fade=${a.fadeOn}/${a.fadeCss}`, 'fade iff there is more',
    (a.scMore > 2) === a.fadeOn && (!a.fadeOn || a.fadeCss));

  /* ------------------------------------------------------------ P5 ------ */
  const before = { a: a.plateA, b: a.plateB };
  await page.evaluate(() => { const b = document.querySelector('.cmp__choice'); if (b) b.click(); });
  await settle(1200);
  await shot('revealed');
  const r = await READ();
  ok('P5', 'committing turns a card over rather than re-laying the surface out',
    `A ${before.a.x}->${r.plateA.x}, B ${before.b.x}->${r.plateB.x}`,
    (w >= 736 && h > 544) ? 'neither plate moves sideways' : 'a phone-sized window re-lays out on purpose',
    w < 736 || h <= 544 || (before.a.x === r.plateA.x && before.b.x === r.plateB.x));
  ok('P5b', 'the face-down card is gone and the second plate is drawn',
    `face=${r.faceShown} totals="${r.totB.replace(/\s+/g, ' ').trim().slice(0, 30)}"`,
    'no card, real totals', !r.faceShown && /\d/.test(r.totB));

  const o2 = await overPlates();
  ok('P6b', 'nothing stands on either plate (revealed)', o2.area + 'px2 ' + JSON.stringify(o2.who), '0', o2.area === 0);

  /* ------------------------------------------------------------ P4b ----- */
  /* THE VERDICT IS THE THING THE READER HAS JUST BET AGAINST, so it is the
     thing in the first window — not the counted head, which each plate's own
     strip already restates. Measured at 900x700 before this pass: the head took
     the 114px window and the verdict was drawn across the bottom edge with the
     lower half of every letter removed. */
  const verdict = await page.evaluate(() => {
    const g = document.querySelector('.cmp__guess') || document.querySelector('.cmp__verdict');
    if (!g) return null;
    const sc = [document.querySelector('.cmp__delta'), document.querySelector('.cmp__grid')]
      .find((n) => n && n.scrollHeight > n.clientHeight + 2) || document.querySelector('.cmp__delta');
    const b = g.getBoundingClientRect(), s = sc.getBoundingClientRect();
    return { top: Math.round(b.top), bottom: Math.round(b.bottom), port: Math.round(s.bottom),
      shown: Math.round(Math.min(b.bottom, s.bottom) - Math.max(b.top, s.top)), h: Math.round(b.height),
      fade: sc.dataset.more === 'yes' };
  });
  ok('P4b', 'the answer to the committed question is whole in the first window',
    verdict ? `${verdict.shown} of ${verdict.h}px` : 'no verdict', 'whole',
    !!verdict && verdict.shown >= verdict.h - 1);
  ok('P4c', 'and whatever the fold does cut is faded, not guillotined',
    verdict ? `fade=${verdict.fade}` : 'n/a', 'faded while there is more', !verdict || verdict.fade);

  ok('P7', 'no document scroll and no sideways scroll',
    `${r.docScroll} / ${r.overflowX}`, '0 / 0', r.docScroll <= 0 && r.overflowX <= 0);

  /* --------------- the chip row, driven ------------------------------- */
  await page.evaluate(() => { const b = [...document.querySelectorAll('.cmp__pick')].pop(); if (b) b.click(); });
  await settle(1300);
  const last = await READ();
  ok('P3c', 'opening the last comparison brings its chip into the row',
    last.picker ? `${last.picker.pressed} inside=${last.picker.pressedInside}` : 'n/a',
    'inside', !last.picker || last.picker.pressedInside);
  ok('P3d', 'and it is the comparison that is drawn', last.years.join(' / '), '1945 / 1965',
    last.years.join(' / ') === '1945 / 1965');
  await shot('last-preset');

  const pass = R.filter((x) => x.pass).length;
  for (const x of R) log(`${x.pass ? 'PASS' : 'FAIL'}  ${x.id} ${x.name}  got ${x.got}  (${x.want})`);
  log(pass === R.length ? `>>> compare r5 holds — ${R.length} rules`
    : `>>> COMPARE R5 BROKEN — ${R.length - pass} of ${R.length}`);
};
