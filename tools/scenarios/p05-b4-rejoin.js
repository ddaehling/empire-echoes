/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p05-b4-rejoin.js — free-explore then rejoin: does the record survive, and
 * does the clause the beat earned stay earned?
 */
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.evaluate(() => { try { localStorage.clear(); } catch (_) {} });
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1400);

  const snap = () => page.evaluate(() => {
    const st = window.BEA.store.getState();
    const q = (s) => document.querySelector(s);
    return {
      step: st.tourStep, tour: st.activeTour, sel: st.selectedTerritoryId,
      title: (q('.cx-sheet__title') || {}).textContent,
      panel: q('.tr-panel') ? q('.tr-panel').dataset.beat : null,
      filled: [...document.querySelectorAll('.cl-say__filled, .cl-blk__filled')].map(e => (e.textContent || '').trim()),
      count: (q('.cl-blk__count') || {}).textContent,
      done: (() => { try { return JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter(e => e.kind === 'completed').map(e => e.beatId); } catch (_) { return []; } })(),
      escape: (q('.tr-bar__escape') || {}).textContent,
    };
  });

  // answer beat 1 and walk to beat 3
  await page.evaluate(() => {
    const i = document.querySelector('.tr-row input[type=number], .app__sheet input[type=number]');
    if (i) { i.value = '9'; i.dispatchEvent(new Event('input', { bubbles: true })); }
    const g = [...document.querySelectorAll('.tr-go, .btn--small')].find(b => /guess/i.test(b.textContent || ''));
    if (g) g.click();
  });
  await page.waitForTimeout(600);
  for (let i = 0; i < 2; i++) { await page.evaluate(() => { const b = document.querySelector('.tr-bar__next'); if (b && !b.disabled) b.click(); }); await page.waitForTimeout(700); }
  log('before explore ' + JSON.stringify(await snap()));

  // leave for free exploration
  const left = await page.evaluate(() => {
    const b = document.querySelector('.tr-bar__escape');
    if (!b) return 'no-escape';
    b.click(); return (b.textContent || '').trim();
  });
  await page.waitForTimeout(900);
  log('escape pressed: "' + left + '"  ' + JSON.stringify(await snap()));

  // select something off the path, and move the year
  await page.evaluate(() => {
    window.BEA.store.dispatch('select', 'jamaica');
    window.BEA.store.dispatch('setYear', 1790);
  });
  await page.waitForTimeout(900);
  log('explored        ' + JSON.stringify(await snap()));
  await shot('explored');

  // rejoin
  const back = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => /back to the lesson|resume|rejoin|continue the lesson/i.test(x.textContent || ''));
    if (b) { b.click(); return (b.textContent || '').trim(); }
    window.BEA.bus.emit('tours:resume', {});
    return 'bus tours:resume';
  });
  await page.waitForTimeout(1200);
  log('rejoined via "' + back + '"  ' + JSON.stringify(await snap()));
  await shot('rejoined');

  // and the run still completes from here
  let n = 0;
  for (let i = 0; i < 40; i++) {
    await page.evaluate(() => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
      for (const inp of document.querySelectorAll('.app__sheet input[type=number]')) { if (!inp.value) { inp.value = '5'; inp.dispatchEvent(new Event('input', { bubbles: true })); } }
      for (const ta of document.querySelectorAll('.app__sheet textarea, .tr-panel textarea, .hg-arg textarea')) { if (!ta.value) { ta.value = 'Because the record says so and I can point at the line.'; ta.dispatchEvent(new Event('input', { bubbles: true })); } }
      for (const b of document.querySelectorAll('.tr-order__btn')) if (vis(b) && !b.disabled) b.click();
      for (let k = 0; k < 6; k++) { const x = document.querySelector('.tr-loop__next'); if (x && vis(x) && !x.disabled) x.click(); }
      const groups = new Set();
      for (const b of document.querySelectorAll('.tr-choice, .tr-tension__opt, .tr-sort__b, .tr-years__b, .tr-defrun__b, .hg-arg__opt, .tr-gate__opt, .gt-opt, .tr-field__cell')) {
        if (!vis(b) || b.disabled) continue;
        const key = (b.closest('[data-q], fieldset, .tr-tension__q, .tr-choices, .tr-sort, .tr-order') || b.parentElement);
        if (groups.has(key)) continue; groups.add(key); b.click();
      }
      for (const sel of ['.tr-loop__cut', '.tr-go', '.tr-tension__go', '.tr-source__go', '.tr-source__skip', '.hg-arg__go', '.tr-gate__go']) {
        for (const b of document.querySelectorAll(sel)) if (vis(b) && !b.disabled) b.click();
      }
    });
    await page.waitForTimeout(300);
    const moved = await page.evaluate(() => { const b = document.querySelector('.tr-bar__next'); if (!b) return 'none'; if (b.disabled || b.getAttribute('data-locked') === 'yes') return 'locked'; b.click(); return 'ok'; });
    await page.waitForTimeout(500);
    n++;
    if (moved !== 'ok') { log('stopped after ' + n + ': ' + moved); break; }
  }
  const end = await snap();
  log('END ' + JSON.stringify(end));
  const fin = await page.evaluate(() => { const b = document.querySelector('.cl-finish'); return b ? (b.textContent || '').trim() + ' primary=' + (b.dataset.primary || '') : null; });
  log('FINISH: ' + fin);
};
