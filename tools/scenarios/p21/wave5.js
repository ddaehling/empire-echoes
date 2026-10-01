/**
 * p21/wave5.js — the through-line, at every width, plus the Any-Exit Close.
 *
 * WHAT IT EXISTS TO CATCH. Measured on the build before this pass, cold-loaded
 * into the authored path:
 *
 *   390x844   data-foot="off"  .cl-bar 0x0     six clauses in the DOM, NONE drawn
 *   768x1024  data-foot="off"  .cl-bar 0x0     six clauses in the DOM, NONE drawn
 *   900x700   data-foot="on"   .cl-bar 564x18  TWO of six drawn, four behind "…"
 *   1366x768  data-foot="on"   .cl-bar 924x18  FIVE of six from beat 9 on
 *   1440x900  data-foot="on"   .cl-bar 976x18  FIVE of six from beat 9 on
 *
 * RESPONSIVE_LAW §6 publishes `#app[data-foot="off"]` for exactly the first
 * two, and §7 tells P21 to put the sentence in the beat panel there. This file
 * asserts both halves and the Close that the sentence ends in.
 *
 *   node tools/inspect.js tools/scenarios/p21/wave5.js --out /tmp/w390  --w 390  --h 844
 *   node tools/inspect.js tools/scenarios/p21/wave5.js --out /tmp/w768  --w 768  --h 1024
 *   node tools/inspect.js tools/scenarios/p21/wave5.js --out /tmp/w900  --w 900  --h 700
 *   node tools/inspect.js tools/scenarios/p21/wave5.js --out /tmp/w1366 --w 1366 --h 768
 *   node tools/inspect.js tools/scenarios/p21/wave5.js --out /tmp/w1440 --w 1440 --h 900
 */

const STEPS = [1, 9, 14, 23];

module.exports = async ({ page, shot, log }) => {
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
    const box = (s) => { const e = document.querySelector(s); if (!vis(e)) return null; const r = e.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    /* Topmost at its own centre — a control that is drawn under something is
       not a control. */
    const reach = (sel) => {
      const e = document.querySelector(sel);
      if (!vis(e)) return { ok: false, why: 'not rendered' };
      const r = e.getBoundingClientRect();
      if (r.top < 0 || r.left < 0 || r.bottom > innerHeight + 1 || r.right > innerWidth + 1) return { ok: false, why: 'outside' };
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return { ok: !!top && (e.contains(top) || top.contains(e)), why: 'covered' };
    };
    const say = document.querySelector('.cl-say');
    const blk = document.querySelector('.cl-blk');
    const drawn = (() => {
      const clip = document.querySelector('.stage__map');
      const c = clip ? clip.getBoundingClientRect() : null;
      for (const sel of ['.map.is-enlarged canvas', '.stage__map canvas', '.stage__map svg', '.stage__map']) {
        const n = document.querySelector(sel);
        if (!vis(n)) continue;
        const r = n.getBoundingClientRect();
        if (r.width <= 40 || r.height <= 40) continue;
        let x = r.left, y = r.top, rr = r.right, bb = r.bottom;
        if (c && !n.closest('.map.is-enlarged')) { x = Math.max(x, c.left); y = Math.max(y, c.top); rr = Math.min(rr, c.right); bb = Math.min(bb, c.bottom); }
        return { x: Math.round(x), y: Math.round(y), w: Math.round(rr - x), h: Math.round(bb - y), l: x, t: y, r: rr, b: bb };
      }
      return null;
    })();
    /* Does the through-line, wherever it is, stand on the map? */
    let onMap = 0;
    if (drawn) {
      for (const e of [document.querySelector('.cl-bar'), blk]) {
        if (!vis(e)) continue;
        const r = e.getBoundingClientRect();
        const ox = Math.max(0, Math.min(r.right, drawn.r) - Math.max(r.left, drawn.l));
        const oy = Math.max(0, Math.min(r.bottom, drawn.b) - Math.max(r.top, drawn.t));
        onMap += Math.round(ox * oy);
      }
    }
    return {
      vw: innerWidth, vh: innerHeight,
      foot: app.dataset.foot, dock: app.dataset.dock, path: app.dataset.path, stage: app.dataset.stage,
      bar: box('.cl-bar'), blk: box('.cl-blk'), drawn, onMap,
      lineGroups: document.querySelectorAll('.cl-say__g').length,
      lineEllipsis: !!document.querySelector('.cl-say__gap'),
      lineOver: say ? say.scrollWidth - say.clientWidth : 0,
      lineScrollable: !!say && say.scrollWidth > say.clientWidth + 1,
      lineMore: say ? (say.dataset.more || '') : '',
      lineTab: !!say && say.hasAttribute('tabindex'),
      blkSlots: blk ? blk.querySelectorAll('.cl-blk__gap').length + blk.querySelectorAll('.cl-blk__filled').length : 0,
      blkText: blk ? blk.querySelector('.cl-blk__say').textContent.replace(/\s+/g, ' ').trim() : '',
      finish: reach('.cl-blk__finish').ok ? 'block' : (reach('.cl-finish').ok ? 'strip' : 'NONE'),
      scroll: document.documentElement.scrollHeight <= innerHeight + 1,
    };
  });

  for (const step of STEPS) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step=' + step, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(2200);
    /* The block is the LAST thing in a panel that scrolls, so a student
       reaches it by scrolling the panel — which is what this does before
       asking whether the route out is reachable. */
    await page.evaluate(() => { const b = document.querySelector('.cl-blk'); if (b) b.scrollIntoView({ block: 'end' }); });
    await page.waitForTimeout(350);
    const m = await read();
    const p = 'step ' + String(step).padStart(2) + ' ';
    log(p + 'foot=' + m.foot + ' dock=' + m.dock
      + '  bar ' + (m.bar ? m.bar.w + 'x' + m.bar.h : 'not drawn')
      + '  blk ' + (m.blk ? m.blk.w + 'x' + m.blk.h : 'none')
      + '  line ' + m.lineGroups + ' groups, over ' + m.lineOver + ', more=' + (m.lineMore || '-')
      + '  block slots ' + m.blkSlots
      + '  map ' + (m.drawn ? m.drawn.w + 'x' + m.drawn.h : 'none'));

    /* T1 — all six clauses exist wherever the sentence is drawn. */
    const six = m.blk ? m.blkSlots === 6 : m.lineGroups === 6;
    t(p + 'T1 six clauses', six, m.blk ? m.blkSlots + ' in the block' : m.lineGroups + ' in the line', '6');
    /* T2 — the sentence is on screen at all. This is the 390x844 defect. */
    t(p + 'T2 through-line drawn', !!(m.bar || m.blk),
      'bar ' + (m.bar ? 'yes' : 'no') + ' block ' + (m.blk ? 'yes' : 'no'), 'one of the two');
    /* T3 — nothing is elided. The old line printed "…" for four clauses. */
    t(p + 'T3 no clause elided', !m.lineEllipsis, m.lineEllipsis ? 'a "…" is printed' : 'none', 'no "…"');
    /* T4 — a route to the Close that a thumb can reach. */
    t(p + 'T4 Finish reachable', m.finish !== 'NONE', m.finish, 'block or strip');
    /* T5 — RESPONSIVE_LAW §1: nothing of ours floats on the plate. */
    t(p + 'T5 nothing on the map', m.onMap === 0, m.onMap + 'px2', '0');
    /* T6 — LAYOUT_BUDGET B4. */
    t(p + 'T6 no document scroll', m.scroll, m.scroll ? 'none' : 'the page scrolls', 'none');
    /* T7 — a scrollable line must be operable from a keyboard: either it holds
       buttons (unfilled clauses are buttons) or it takes a tab stop itself. */
    if (m.bar && m.lineScrollable) {
      const kb = await page.evaluate(() => {
        const n = document.querySelector('.cl-say');
        return !!n.querySelector('button') || n.hasAttribute('tabindex');
      });
      t(p + 'T7 scroller keyboard-operable', kb, kb ? 'yes' : 'no focusable child and no tabindex', 'yes');
    }
    await shot('s' + step);
  }

  /* ---- Esc Esc reaches the Close, at this width ------------------------ */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  const close = await page.evaluate(() => {
    const n = document.querySelector('.cl-close');
    if (!n) return { open: false };
    const r = n.getBoundingClientRect();
    const grey = [...document.querySelectorAll('.cl-line[data-can="no"]')];
    const full = [...document.querySelectorAll('.cl-line[data-can="yes"]')];
    const drawnMap = document.querySelector('.stage__map canvas') || document.querySelector('.stage__map');
    const mr = drawnMap ? drawnMap.getBoundingClientRect() : null;
    const ox = mr ? Math.max(0, Math.min(r.right, mr.right) - Math.max(r.left, mr.left)) : 0;
    const oy = mr ? Math.max(0, Math.min(r.bottom, mr.bottom) - Math.max(r.top, mr.top)) : 0;
    return {
      open: true, w: Math.round(r.width), h: Math.round(r.height),
      lines: grey.length + full.length, grey: grey.length,
      /* A GREY LINE HAS TWO HONEST REASONS. A beat never reached is priced in
         seconds; a beat reached and walked past without answering its question
         is greyed for THAT reason and says "answer it" plus the question, which
         is close.json's own rule and is not a missing price — pricing it in
         seconds would claim the student still has the beat to do. Both count as
         a line that says what it would take; a grey line saying neither does
         not. */
      pricedGrey: grey.filter((li) => /\d+\s*seconds/.test(li.textContent)
        || /unanswered/.test(li.dataset.why || '')).length,
      unanswered: grey.filter((li) => /unanswered/.test(li.dataset.why || '')).length,
      sign: !!document.querySelector('.cl-sign__field'),
      print: !!document.querySelector('.cl-actions .btn--primary'),
      overMap: Math.round(ox * oy),
      scrollable: (() => { let p = n.parentElement; while (p) { if (p.scrollHeight > p.clientHeight + 2 && getComputedStyle(p).overflowY !== 'visible') return true; p = p.parentElement; } return false; })(),
    };
  });
  log('esc esc -> ' + JSON.stringify(close));
  t('close  T8 Esc Esc opens the Close', close.open, close.open ? 'open' : 'not open', 'open');
  t('close  T9 greyed lines carry a price or the question they did not answer', close.open && close.grey > 0 && close.pricedGrey === close.grey,
    close.pricedGrey + ' of ' + close.grey, 'all of them');
  t('close  T10 never over the plate', close.open && close.overMap === 0, close.overMap + 'px2', '0');
  t('close  T11 it scrolls at this height', close.open && close.scrollable, String(close.scrollable), 'true');
  await shot('close');

  /* ---- the revision sheet ---------------------------------------------- */
  if (close.open) {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('.cl-actions button')].find((x) => /Print/.test(x.textContent));
      if (b) b.click();
    });
    await page.waitForTimeout(700);
    const sheet = await page.evaluate(() => {
      const p = document.querySelector('.tr-print');
      if (!p || p.hidden) return { on: false };
      return {
        on: true, h1: (p.querySelector('h1') || {}).textContent || '',
        sections: p.querySelectorAll('section').length,
        armed: document.documentElement.dataset.p05print === 'on',
        version: /dataset\s+\S+/.test(p.textContent),
      };
    });
    log('sheet -> ' + JSON.stringify(sheet));
    t('sheet  T12 the revision sheet builds', sheet.on && sheet.sections >= 4 && sheet.armed && sheet.version,
      JSON.stringify(sheet), 'on, >=4 sections, armed, versioned');
    await shot('sheet');
  }

  R.forEach((l) => log(l));
  log(R.some((l) => l.startsWith('FAIL')) ? '>>> P21 THROUGH-LINE BROKEN' : '>>> the through-line holds');
};
