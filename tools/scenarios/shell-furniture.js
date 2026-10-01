/**
 * shell-furniture.js — THE MAP'S FURNITURE DOES NOT MOVE, AND NO BOX OF THE
 * SHELL'S CUTS WHAT IT HOLDS.
 *
 * GUARANTEE THIS FILE PROTECTS: three promises the shell makes and had no way
 * to check, all of them about boxes rather than about type, which is why every
 * one of them survived several waves of critics reading screenshots.
 *
 *   F1  NOTHING IN THE TIME BAND IS CLIPPED BY ITS OWN FURNITURE. `.app__time`
 *       is `overflow: hidden` by LAYOUT_BUDGET B3 — being clipped is being
 *       over budget — so every box inside it must fit inside every clipping
 *       ancestor it has, at every disclosure level.
 *
 *   F2  THE AXIS AND THE FOUR PHASE BANDS SIT AT THE SAME y AT EVERY
 *       DISCLOSURE LEVEL. `.tl__body` centres what it holds, so anything that
 *       changes the height of the deck beside it moves the axis and all four
 *       bands under a reader's stationary finger. Measured at 390x844 before
 *       the fix this file ships with: the deck's grid track went 71.59 ->
 *       71.95 when `apparatus` put the speed selector on the year rank, and
 *       the axis and the spine went with it. Small is not zero, and this rule
 *       is zero.
 *
 *   F3  A MASTHEAD CONTROL'S TARGET IS THE SIZE IT LOOKS. The two masthead
 *       strips clip on the x axis to keep the document one screen wide, and
 *       CSS makes that a decision about BOTH axes. Measured at 900x700 before
 *       the fix: `.bar__slot--main` was 17.0px tall around a 36.2px control —
 *       "Start the lesson", the app's one call to action — so 9.6px was cut
 *       off each end of its target and its focus ring, `elementFromPoint` two
 *       pixels inside either edge returned the masthead, and WCAG 2.2 SC 2.5.8
 *       (24px) failed by seven pixels with nothing visibly wrong.
 *
 * Run it at every viewport the budget names, in both themes:
 *
 *   node tools/inspect.js tools/scenarios/shell-furniture.js --out /tmp/f390  --w 390  --h 844
 *   node tools/inspect.js tools/scenarios/shell-furniture.js --out /tmp/f900  --w 900  --h 700
 *   node tools/inspect.js tools/scenarios/shell-furniture.js --out /tmp/f1366 --w 1366 --h 768
 *
 * Prints PASS/FAIL per rule and throws on any failure.
 */
'use strict';

const READY = () => window.BEA && window.BEA.store
  && window.BEA.store.getState().status === 'ready';

/* F2's tolerance is zero. A tenth of a pixel is a real reflow and the only
   reason to allow one would be that we could not be bothered to find it. */
const MOVE_TOLERANCE = 0.0;
/* WCAG 2.2 SC 2.5.8 minimum target size. */
const TARGET_MIN = 24;

const PROBE = () => {
  const nm = c => {
    const s = typeof c.className === 'string' ? c.className.trim()
      : (c.className && c.className.baseVal ? String(c.className.baseVal).trim() : '');
    return (s ? '.' + s.replace(/\s+/g, '.') : c.tagName);
  };
  const rect = sel => {
    const e = document.querySelector(sel);
    if (!e) return null;
    const b = e.getBoundingClientRect();
    return b.height < 0.5 ? 'none' : (+b.y.toFixed(2)) + '+' + (+b.height.toFixed(2));
  };

  /* F1 — every box in the time band against every clipping ancestor it has. */
  const escapes = [];
  const time = document.querySelector('.app__time');
  if (time) {
    const clippers = [];
    for (const el of [time, ...time.querySelectorAll('*')]) {
      const cs = getComputedStyle(el);
      if (/hidden|clip/.test(cs.overflowY) || /hidden|clip/.test(cs.overflowX)) {
        clippers.push({ el, r: el.getBoundingClientRect(), cs });
      }
    }
    for (const el of time.querySelectorAll('*')) {
      const b = el.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) continue;
      for (const c of clippers) {
        if (c.el === el || !c.el.contains(el)) continue;
        /* a scroller is allowed to have more in it than it shows */
        if (/auto|scroll/.test(c.cs.overflowY) && c.el.scrollHeight > c.el.clientHeight + 2) continue;
        const cut = [];
        if (/hidden|clip/.test(c.cs.overflowY)) {
          if (c.r.top - b.top > 1) cut.push('top ' + (c.r.top - b.top).toFixed(1));
          if (b.bottom - c.r.bottom > 1) cut.push('bottom ' + (b.bottom - c.r.bottom).toFixed(1));
        }
        if (/hidden|clip/.test(c.cs.overflowX)) {
          if (c.r.left - b.left > 1) cut.push('left ' + (c.r.left - b.left).toFixed(1));
          if (b.right - c.r.right > 1) cut.push('right ' + (b.right - c.r.right).toFixed(1));
        }
        if (cut.length) {
          escapes.push(nm(el) + ' [' + b.y.toFixed(1) + '+' + b.height.toFixed(1) + '] cut by '
            + nm(c.el) + ' [' + c.r.y.toFixed(1) + '+' + c.r.height.toFixed(1) + '] — ' + cut.join(', '));
        }
      }
    }
  }

  /* F3 — the effective (clipped) target of every masthead control. */
  const targets = [];
  for (const sel of ['.bar__slot--main', '.bar__slot--end']) {
    const slot = document.querySelector(sel);
    if (!slot) continue;
    const sb = slot.getBoundingClientRect();
    if (sb.height < 1) continue;
    const cs = getComputedStyle(slot);
    const clipsY = /hidden|clip/.test(cs.overflowY);
    for (const b of slot.querySelectorAll('button, a[href], select, input')) {
      const r = b.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const top = clipsY ? Math.max(r.top, sb.top) : r.top;
      const bot = clipsY ? Math.min(r.bottom, sb.bottom) : r.bottom;
      const eff = Math.max(0, bot - top);
      /* THE STRIP SCROLLS ON THE X AXIS AND THAT IS WHAT IT IS FOR. A control
         the reader has not scrolled to yet is not a cut control, and the same
         items are one press away in `.bar__more`. So the hit test is taken at
         the middle of what is VISIBLE of the control, and a control with no
         visible width at all is not tested at all. */
      const left = Math.max(r.left, sb.left), right = Math.min(r.right, sb.right);
      if (right - left < 2) continue;
      const cx = (left + right) / 2;
      const owns = e => !!(e && (e === b || b.contains(e)));
      const edges = owns(document.elementFromPoint(cx, top + 2))
        && owns(document.elementFromPoint(cx, bot - 2));
      targets.push({
        sel, label: (b.textContent || '').trim().slice(0, 22) || b.getAttribute('aria-label') || '(no label)',
        box: +r.height.toFixed(1), eff: +eff.toFixed(1), edges,
      });
    }
  }

  return {
    stage: document.getElementById('app').dataset.stage,
    time: rect('.app__time'),
    axis: rect('.tl-ax__axis'),
    spine: rect('.tl-spine'),
    deck: rect('.tl__deck'),
    escapes: [...new Set(escapes)],
    targets,
  };
};

module.exports = async ({ page, log, url }) => {
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(READY, null, { timeout: 30000 });
  await page.waitForTimeout(1200);

  const seen = [];
  let fails = 0;
  const fail = (rule, msg) => { fails++; log('FAIL  ' + rule + '  ' + msg); };

  for (const level of ['plate', 'working', 'apparatus']) {
    await page.evaluate(l => window.BEA.bus.emit('ask:stage', { level: l }), level);
    await page.waitForTimeout(800);
    const r = await page.evaluate(PROBE);
    seen.push({ asked: level, ...r });
    log('  ' + level.padEnd(10) + '-> ' + String(r.stage).padEnd(10)
      + ' time=' + r.time + '  deck=' + r.deck + '  axis=' + r.axis + '  spine=' + r.spine);
    if (r.escapes.length) {
      fail('F1', 'at ' + r.stage + ', ' + r.escapes.length + ' box(es) cut inside the time band:');
      r.escapes.forEach(e => log('        ' + e));
    }
  }
  if (!seen.some(s => s.escapes.length)) log('PASS  F1  nothing in the time band is cut, at any level');

  /* F2 — one y for the axis and one for the spine, whatever the level. */
  const num = v => (v === 'none' || v == null ? null : parseFloat(v));
  for (const [what, key] of [['the axis', 'axis'], ['the phase bands', 'spine']]) {
    const ys = seen.map(s => num(s[key])).filter(v => v != null);
    if (!ys.length) { log('PASS  F2  ' + what + ' is not on this arrangement'); continue; }
    const spread = Math.max(...ys) - Math.min(...ys);
    if (spread > MOVE_TOLERANCE) {
      fail('F2', what + ' moves ' + spread.toFixed(2) + 'px between disclosure levels: '
        + seen.map(s => s.asked + ' ' + s[key]).join('  /  '));
    } else {
      log('PASS  F2  ' + what + ' is at the same y at every level (' + ys[0].toFixed(2) + ')');
    }
  }

  /* F3 — masthead targets, on the level the reader lands on. */
  const targets = seen[seen.length - 1].targets;
  const cut = targets.filter(t => t.eff < t.box - 0.5 || !t.edges);
  if (cut.length) {
    fail('F3', cut.length + ' masthead control(s) are cut by their own strip:');
    cut.forEach(t => log('        ' + t.sel + '  "' + t.label + '"  box ' + t.box
      + '  effective ' + t.eff + '  edges hit-testable: ' + t.edges));
  } else {
    log('PASS  F3  all ' + targets.length + ' masthead controls keep their whole target ('
      + targets.map(t => t.eff).join(', ') + 'px)');
  }
  /* AND THE STRIP REPORTS, WITHOUT FAILING, ANY CONTROL WHOSE OWN BOX IS UNDER
     SC 2.5.8's 24px. Whether a module gives its control a 24px target is that
     module's business and not the shell's; whether the shell then cuts it is
     F3's, and is above. The line is printed so that whoever owns the control
     can see the number without going looking for it. */
  const smallOwn = targets.filter(t => t.box < TARGET_MIN - 0.01);
  if (smallOwn.length) {
    log('NOTE      ' + smallOwn.length + ' masthead control(s) are under SC 2.5.8\'s '
      + TARGET_MIN + 'px in their OWN box — not the shell\'s to size, not cut by the shell:');
    smallOwn.forEach(t => log('        ' + t.sel + '  "' + t.label + '"  box ' + t.box + 'px'));
  }

  log(fails ? '>>> THE SHELL\'S FURNITURE IS BROKEN (' + fails + ' failing)'
            : '>>> the furniture holds');
  if (fails) throw new Error('shell-furniture: ' + fails + ' failing rule(s)');
};
