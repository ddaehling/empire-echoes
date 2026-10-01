/**
 * w6/walk.js — walk a route to the end, answering everything it asks, then
 * open the Close and read what it says. ROUTE=core|thirty  env.
 */
module.exports = async ({ page, log, shot }) => {
  const ROUTE = process.env.ROUTE || 'core';
  const SHOT = process.env.SHOT === '1';
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text()); });

  await page.goto('http://localhost:8777/app/#tour=' + ROUTE + '&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => { try { localStorage.removeItem('bea.ledger.v1'); } catch (_) {} });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);

  const rows = [];
  const t0 = Date.now();
  let words = 0, commits = 0, beats = 0, entryWords = 0;
  for (let i = 0; i < 40; i += 1) {
    const st = await page.evaluate(() => {
      const s = window.BEA.store.getState();
      const ix = window.BEA.toursIndex;
      const r = ix && ix.routes[s.activeTour];
      const cur = r && r.steps[s.tourStep];
      return {
        tour: s.activeTour, step: s.tourStep,
        kind: cur ? cur.kind : '?', id: cur ? cur.id : '?',
        count: (document.querySelector('.tr-bar__count') || {}).textContent || '',
        locked: !!(document.querySelector('.tr-bar__next') || {}).disabled,
        last: !!document.querySelector('.tr-bar__next[data-last]'),
        nextLabel: ((document.querySelector('.tr-bar__next') || {}).textContent || '').trim(),
      };
    });
    const w0 = await page.evaluate(() => {
      const n = (x) => String(x || '').trim().split(/\s+/).filter(Boolean).length;
      return n((document.querySelector('.cx-lede__say') || {}).innerText)
        + n((document.querySelector('.tr-panel, .tr-gate') || {}).innerText);
    });
    entryWords += w0;
    // satisfy whatever it asks: answer every control this beat puts up.
    await page.evaluate(() => { window.__w6 = new Set(); window.__w6n = 0; window.__w6pool = -1; window.__w6tried = new Set(); });
    const acts = [];
    for (let t = 0; t < 90; t += 1) {
      const acted = await page.evaluate(() => {
        const seen = window.__w6;
        const body = document.querySelector('.cx-sheet__body') || document.body;
        const key = (n) => (n.getAttribute('aria-label') || n.textContent || n.className || '').trim().slice(0, 60);
        const vis = (n) => { const r = n.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
        const ok = (n) => n && !n.disabled && vis(n);

        const fs = [...body.querySelectorAll('textarea, input[type="text"], input[type="number"], input:not([type])')];
        for (let i = 0; i < fs.length; i += 1) {
          const f = fs[i];
          if (!vis(f) || seen.has('F' + i)) continue;
          seen.add('F' + i);
          f.focus();
          const proto = f.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
          const numeric = f.type === 'number' || /num/.test(String(f.className));
          Object.getOwnPropertyDescriptor(proto, 'value').set.call(f, numeric ? '25'
            : 'Because the evidence on this beat settles what each was placed to know.');
          f.dispatchEvent(new Event('input', { bubbles: true }));
          f.dispatchEvent(new Event('change', { bubbles: true }));
          return 'field ' + key(f);
        }
        for (const f of body.querySelectorAll('input[type="range"]')) {
          if (!vis(f) || seen.has('R' + key(f))) continue;
          seen.add('R' + key(f));
          Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(f,
            String(Math.round((Number(f.min || 0) + Number(f.max || 100)) / 2)));
          f.dispatchEvent(new Event('input', { bubbles: true }));
          f.dispatchEvent(new Event('change', { bubbles: true }));
          return 'slider ' + key(f);
        }
        // the loop's break control, once the walk-through has revealed it
        const cut = body.querySelector('.tr-loop__cut');
        if (ok(cut) && !seen.has('CUT')) { seen.add('CUT'); cut.click(); return 'click ' + key(cut); }
        // ordering: try each remaining card until one is accepted; the pool
        // shrinks when a placement is right, which resets what has been tried.
        const pool = [...body.querySelectorAll('.tr-order__btn')].filter(ok);
        if (pool.length && window.__w6n < 70) {
          if (window.__w6pool !== pool.length) { window.__w6pool = pool.length; window.__w6tried = new Set(); }
          const pick = pool.find((b2) => !window.__w6tried.has(key(b2)));
          if (pick) {
            window.__w6n += 1;
            window.__w6tried.add(key(pick));
            pick.click();
            return 'order ' + key(pick);
          }
        }
        // the franchise sort: one bucket per undone row
        const row = body.querySelector('.tr-sort__row:not([data-done])');
        if (row && window.__w6n < 70) {
          const b0 = [...row.querySelectorAll('.tr-sort__b')].filter(ok)[0];
          if (b0) { window.__w6n += 1; b0.click(); return 'sort ' + key(b0); }
        }
        // two documents in tension: one answer per question group
        for (const grp of body.querySelectorAll('.tr-tension__opts')) {
          if (grp.querySelector('[aria-pressed="true"]')) continue;
          const o0 = [...grp.querySelectorAll('.tr-choice')].filter(ok)[0];
          if (o0) { o0.click(); return 'tension ' + key(o0); }
        }
        for (const c of body.querySelectorAll('.tr-choice')) {
          if (!ok(c) || c.getAttribute('aria-pressed') === 'true') continue;
          if (seen.has('C' + key(c))) continue;
          seen.add('C' + key(c));
          c.click();
          return 'choice ' + key(c);
        }
        const step = body.querySelector('.tr-loop__next');
        if (ok(step) && window.__w6n < 70) { window.__w6n += 1; step.click(); return 'step ' + key(step); }
        const skip = /tr-bar__|tr-panel__more|tr-panel__fit|cx-sheet__fit|tr-open|rather not guess|rather read|Print|Open that record|full record|Why is this number|the other route|full path|off this map|Go to the beat|blanks filled|read the whole|hide the whole|Next beat|Previous beat|cl-blk|cl-say|\u2190 Back/i;
        for (const n of body.querySelectorAll('button, [role="radio"], .tr-field__cell')) {
          if (!ok(n)) continue;
          const k = key(n);
          if (skip.test(k) || skip.test(String(n.className || ''))) continue;
          if (seen.has('B' + k)) continue;
          seen.add('B' + k);
          n.click();
          return 'click ' + k;
        }
        return null;
      });
      if (!acted) break;
      acts.push(acted);
      await page.waitForTimeout(200);
    }
    const after = await page.evaluate(() => ({
      locked: !!(document.querySelector('.tr-bar__next') || {}).disabled,
      label: ((document.querySelector('.tr-bar__next') || {}).textContent || '').trim(),
    }));
    if (acts.length) rows.push('      did: ' + acts.join(' | ').slice(0, 320));
    const w = await page.evaluate(() => {
      const n = (s2) => String(s2 || '').trim().split(/\s+/).filter(Boolean).length;
      /* The same two surfaces p05-clock counts: the one sentence in the band
         and the beat's own panel — not the through-line, not the teaching
         desk's block, not the Close. Counted AFTER the beat has been answered,
         so the reveals a student actually reads are in the total. */
      const lede = document.querySelector('.cx-lede__say');
      const panel = document.querySelector('.tr-panel, .tr-gate');
      return n(lede && lede.innerText) + n(panel && panel.innerText);
    });
    words += w;
    commits += acts.length ? 1 : 0;
    if (st.kind === 'beat') beats += 1;
    if (errs.length && !rows.some((r) => /ERR HERE/.test(r))) rows.push('      ERR HERE after ' + st.kind + ' ' + st.id + ': ' + errs[0]);
    rows.push(String(i).padStart(2) + ' ' + st.count.padEnd(10) + ' ' + st.kind.padEnd(8) + ' ' + String(st.id).padEnd(20) + ' next="' + after.label + '"' + (after.locked ? ' LOCKED' : ''));
    const moved = await page.evaluate(() => {
      const n = document.querySelector('.tr-bar__next');
      if (!n || n.disabled) return false;
      n.click(); return true;
    });
    if (!moved) { rows.push('   -- stuck --'); break; }
    await page.waitForTimeout(700);
    const closed = await page.evaluate(() => !!document.querySelector('.cl-close'));
    if (closed) { rows.push('   -- the Close --'); break; }
  }
  log(rows.join('\n'));
  const wall = Math.round((Date.now() - t0) / 1000);
  log('SCRIPTED WALL CLOCK  ' + wall + 's — a machine, not a student');
  log('WORDS ON ARRIVAL     ' + entryWords + ' — the prose each step puts up before the student touches it');
  log('WORDS RENDERED       ' + words + ' across ' + beats + ' beat screens (panel + lede, reveals included)');
  log('READING MODEL        ' + Math.round(words / 200 * 60) + 's reading at 200 wpm + ' + (beats * 12) + 's looking + ' + (commits * 45) + 's committing = '
    + Math.round((words / 200 * 60 + beats * 12 + commits * 45) / 60) + ' min');

  const openNow = await page.evaluate(() => !!document.querySelector('.cl-close'));
  if (!openNow) {
    await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'w6' }));
    await page.waitForTimeout(1400);
  }
  const c = await page.evaluate(() => {
    const root = document.querySelector('.cl-close');
    if (!root) return null;
    const lines = [...root.querySelectorAll('li.cl-line')].map((li) => ({
      n: (li.querySelector('.cl-line__n') || {}).textContent,
      can: li.dataset.can, why: li.dataset.why,
      miss: ((li.querySelector('.cl-line__missing') || {}).textContent || '').trim().slice(0, 90),
    }));
    return {
      stand: (root.querySelector('.cl-close__stand') || {}).textContent || '',
      late: (root.querySelector('.cl-close__late') || {}).textContent || '',
      speed: (root.querySelector('.cl-close__speed') || {}).textContent || '',
      lines,
      audit: window.BEA.closeVoiceAudit,
      through: (document.querySelector('.cl-say, .cl-blk') || {}).textContent || '',
      beats: (window.BEA.ledgerBeats || null),
    };
  });
  if (!c) { log('NO CLOSE'); } else {
    log('HEADLINE: ' + c.stand.trim());
    if (c.late) log('LATE: ' + c.late.trim().slice(0, 200));
    if (c.speed) log('SPEED: ' + c.speed.trim().slice(0, 160));
    for (const l of c.lines) log('  line ' + String(l.n).padStart(2) + ' can=' + l.can + ' why=' + l.why + (l.miss ? '  ' + l.miss : ''));
    log('voiceAudit: ' + JSON.stringify(c.audit));
  }
  if (SHOT) {
    await shot('close-' + ROUTE);
    await page.evaluate(() => {
      const li = [...document.querySelectorAll('li.cl-line')].find((n) => n.dataset.why === 'offroute');
      if (li) li.scrollIntoView({ block: 'center' });
    });
    await page.waitForTimeout(500);
    await shot('close-' + ROUTE + '-lines');
  }
  log('ERRORS: ' + (errs.length ? errs.join(' | ') : 'none'));
};
