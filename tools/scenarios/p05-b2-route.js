/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p05-b2-route.js — walk a whole route end to end and watch the through-line.
 *
 *   node tools/inspect.js tools/scenarios/p05-b2-route.js --out /tmp/x --w 1366 --h 768
 * Route comes from ROUTE env (default core).
 */
const ROUTE = process.env.ROUTE || 'core';

module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.evaluate(() => { try { localStorage.clear(); } catch (_) {} });
  await page.goto('http://localhost:8777/app/#tour=' + ROUTE + '&step=0', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1800);

  const t0 = Date.now();
  const snap = () => page.evaluate(() => {
    const st = window.BEA.store.getState();
    const q = (s) => document.querySelector(s);
    const txt = (s) => { const e = q(s); return e ? (e.textContent || '').trim() : null; };
    const nx = q('.tr-bar__next');
    const led = (() => { try { return JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]'); } catch (_) { return []; } })();
    return {
      step: st.tourStep, tour: st.activeTour,
      title: txt('.cx-sheet__title'),
      count: txt('.cl-blk__count'),
      filled: [...document.querySelectorAll('.cl-say__filled, .cl-blk__filled')].map(e => (e.textContent||'').trim()),
      finish: (()=>{const b=q('.cl-finish');return b?((b.textContent||'').trim()+' primary='+(b.dataset.primary||'')):null;})(),
      nextLabel: nx ? (nx.textContent || '').trim() : null,
      nextLocked: nx ? (nx.disabled || nx.getAttribute('data-locked') === 'yes') : null,
      done: led.filter(e => e.kind === 'completed').map(e => e.beatId),
      ledgerKinds: led.map(e => e.kind + ':' + (e.claimId || e.beatId || '')),
    };
  });

  /* Generically satisfy whatever this step asks, so the run reaches the end. */
  const satisfy = async () => {
    await page.evaluate(() => {
      const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
      const clicks = [];
      // 1. numeric / text commitments
      for (const inp of document.querySelectorAll('.app__sheet input[type=number], .app__sheet input[type=text]:not(.cl-sign__name)')) {
        if (!vis(inp) || inp.value) continue;
        const mid = inp.min && inp.max ? Math.round((+inp.min + +inp.max) / 2) : 3;
        inp.value = String(mid);
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }
      for (const ta of document.querySelectorAll('.app__sheet textarea, .tr-panel textarea, .hg-arg textarea')) {
        if (!vis(ta) || ta.value) continue;
        ta.value = 'It was made by someone with a reason to be believed, and it cannot tell me what the people it describes thought.';
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
      }
      // 2a. the ordering task wants EVERY card placed, in year order.
      const ord = [...document.querySelectorAll('.tr-order__btn')].filter(b => vis(b) && !b.disabled);
      for (const b of ord) { b.click(); clicks.push('order'); }
      // 2b. the loop wants stepping and then cutting.
      for (let k = 0; k < 6; k++) { const n = document.querySelector('.tr-loop__next'); if (n && vis(n) && !n.disabled) { n.click(); clicks.push('loop'); } }
      // 2c. one choice per question group
      const groups = new Set();
      for (const b of document.querySelectorAll('.tr-choice, .tr-tension__opt, .tr-sort__b, .tr-years__b, .tr-defrun__b, .hg-arg__opt, .tr-gate__opt, .gt-opt, .tr-field__cell')) {
        if (!vis(b) || b.disabled) continue;
        const key = (b.closest('[data-q], fieldset, .tr-tension__q, .tr-choices, .tr-sort, .tr-order') || b.parentElement);
        if (groups.has(key)) continue;
        groups.add(key);
        b.click(); clicks.push(b.className.split(/\s+/)[0]);
      }
      // 3. the "go / commit / next" verbs inside the panel
      for (const sel of ['.tr-loop__next', '.tr-loop__cut', '.tr-go', '.tr-tension__go', '.tr-source__go', '.tr-source__skip', '.hg-arg__go', '.tr-gate__go']) {
        for (const b of document.querySelectorAll(sel)) { if (vis(b) && !b.disabled) { b.click(); clicks.push(sel); } }
      }
      return clicks;
    });
    await page.waitForTimeout(320);
  };

  const rows = [];
  let guard = 0;
  let last = await snap();
  rows.push({ i: 0, ...last });
  while (guard++ < 60) {
    for (let k = 0; k < 4; k++) await satisfy();
    const moved = await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      if (!b) return 'no-next';
      if (b.disabled || b.getAttribute('data-locked') === 'yes') return 'locked:' + (b.textContent || '').trim();
      b.click(); return 'ok';
    });
    await page.waitForTimeout(650);
    const s = await snap();
    rows.push({ i: guard, moved, ...s });
    if (moved !== 'ok') { log('STOPPED at step ' + s.step + ' — ' + moved); break; }
    if (s.step === last.step && s.title === last.title) { log('NO MOVEMENT at step ' + s.step); break; }
    last = s;
  }

  for (const r of rows) log('STEP ' + String(r.step).padStart(2) + ' ' + (r.moved || 'start').padEnd(10)
    + ' blanks=' + (r.count || '-') + ' | ' + String(r.title || '').slice(0, 40).padEnd(40)
    + ' | filled: ' + r.filled.join(' / '));

  const end = rows[rows.length - 1];
  log('ROUTE=' + ROUTE + ' wall=' + Math.round((Date.now() - t0) / 1000) + 's(driver)');
  log('BEATS DONE: ' + (end.done || []).join(', '));
  log('FINAL BLANKS: ' + end.count + '  finish button: ' + JSON.stringify(end.finish));
  await shot('end-of-route');

  // now open the Close and read it
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(900);
  const close = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const lines = [...document.querySelectorAll('.cl-line')].map(e => ({
      can: e.dataset.can, why: e.dataset.why,
      text: (e.textContent || '').trim().slice(0, 46),
    }));
    const btns = [...document.querySelectorAll('.cl-block button, .cl-sign button, .cl-panel button')].map(b => (b.textContent || '').trim());
    return { lines, btns, sheet: !!q('.cl-sign'), scaffold: (q('.cl-sign__scaffold') || {}).textContent };
  });
  log('CLOSE LINES: ' + JSON.stringify(close.lines, null, 1).slice(0, 3000));
  log('CLOSE BUTTONS: ' + close.btns.join(' | '));
  log('SCAFFOLD: ' + close.scaffold);
  log('STANDING LINES: ' + close.lines.filter(l => l.can === 'yes').length + ' of ' + close.lines.length
    + '; grey: ' + close.lines.filter(l => l.can !== 'yes').map(l => l.text.replace(/^(\d+).*/, '$1') + ':' + l.why).join(' '));
  await shot('close');

  /* ---- sign it, and print it. --------------------------------------- */
  const signed = await page.evaluate(() => {
    const f = document.querySelector('.cl-sign__field');
    const nm = document.querySelector('.cl-sign__name');
    if (!f) return 'no field';
    f.value = 'It began as sugar islands worked by enslaved people who kept rising, became a company that taxed Bengal and paid for its own conquests, and ended when the people it ruled organised and Britain ran out of money.';
    f.dispatchEvent(new Event('input', { bubbles: true }));
    if (nm) { nm.value = 'A Student'; nm.dispatchEvent(new Event('input', { bubbles: true })); }
    const btn = [...document.querySelectorAll('.cl-sign button')].find(b => /sign it/i.test(b.textContent || ''));
    if (!btn) return 'no sign button';
    if (btn.disabled) return 'sign disabled';
    btn.click();
    return 'clicked';
  });
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => {
    const done = document.querySelector('.cl-sign__done');
    const sheet = document.querySelector('.cl-print, #cl-print, .cl-sheet');
    const head = sheet ? (sheet.querySelector('h1, .cl-print__head, .cl-sheet__head') || {}).textContent : null;
    const printBtn = [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(t => /print/i.test(t));
    return { done: done ? done.textContent.trim() : null, head: head ? head.trim().slice(0, 120) : null, printBtn };
  });
  log('SIGN: ' + signed + ' -> ' + JSON.stringify(after));
  const sheet = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => /print my revision sheet/i.test(x.textContent || ''));
    if (!b) return { err: 'no print button' };
    window.print = () => { window.__printed = (window.__printed || 0) + 1; };
    b.click();
    const p = document.querySelector('.tr-print');
    return {
      printed: window.__printed || 0,
      hidden: p ? p.hidden : null,
      chars: p ? (p.textContent || '').trim().length : 0,
      head: p ? (p.textContent || '').trim().slice(0, 220) : '',
    };
  });
  log('PRINT SHEET: ' + JSON.stringify(sheet));
  await shot('signed');
};
