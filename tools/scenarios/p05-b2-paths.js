/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p05-b2-paths.js — every OTHER way into the sentence.
 *  A. cold Close (no tour ever started): does each blank's control actually go somewhere?
 *  B. free explore, then rejoin: does the sentence survive?
 *  C. a route switched mid-run: does the sentence re-key?
 */
module.exports = async ({ page, shot, log }) => {
  const state = () => page.evaluate(() => {
    const st = window.BEA.store.getState();
    const slots = [...document.querySelectorAll('.cl-say__g')].map(g => ({
      n: g.dataset.n,
      filled: !!g.querySelector('.cl-say__filled'),
      btn: !!g.querySelector('button.cl-say__blank'),
      flat: !!g.querySelector('.cl-say__blank--flat'),
      offered: (g.querySelector('.cl-say__blank--flat') || {}).dataset ? (g.querySelector('.cl-say__blank--flat').dataset.offered || 'yes') : 'yes',
    }));
    const f = document.querySelector('.cl-finish') || document.querySelector('.cl-blk__finish');
    return { tour: st.activeTour, step: st.tourStep, slots, finish: f ? (f.textContent || '').trim() : null,
      audit: (window.BEA.throughLineAudit || {}).ok };
  });

  /* --- A. cold Close: press blank 1 with no lesson running --------------- */
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.evaluate(() => { try { localStorage.clear(); } catch (_) {} });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  log('A cold: ' + JSON.stringify(await state()));
  const hit = await page.evaluate(() => {
    const b = document.querySelector('.cl-say__g[data-n="1"] button.cl-say__blank');
    if (!b) return 'blank 1 is not a control';
    b.click(); return 'pressed';
  });
  await page.waitForTimeout(1600);
  const a2 = await page.evaluate(() => {
    const st = window.BEA.store.getState();
    return { tour: st.activeTour, step: st.tourStep, title: (document.querySelector('.cx-sheet__title') || {}).textContent,
      lede: (document.querySelector('.cx-lede__say') || {}).textContent };
  });
  log('A press blank 1 (' + hit + ') -> ' + JSON.stringify(a2));
  await shot('A-cold-blank1');

  /* --- B. explore then rejoin ------------------------------------------- */
  await page.goto('http://localhost:8777/app/#tour=core&step=4', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  const b1 = await state();
  await page.evaluate(() => window.BEA.bus.emit('tours:explore', {}));
  await page.waitForTimeout(900);
  const b2 = await state();
  await page.evaluate(() => window.BEA.bus.emit('tours:rejoin', {}));
  await page.waitForTimeout(1200);
  const b3 = await state();
  log('B in-beat : ' + JSON.stringify(b1));
  log('B explore : ' + JSON.stringify(b2));
  log('B rejoined: ' + JSON.stringify(b3));
  await shot('B-rejoined');

  /* --- C. switch route mid-run ------------------------------------------ */
  await page.evaluate(() => window.BEA.bus.emit('tours:setRoute', { id: 'eight' }));
  await page.waitForTimeout(1400);
  log('C -> eight: ' + JSON.stringify(await state()));
  await page.evaluate(() => window.BEA.bus.emit('tours:setRoute', { id: 'thirty' }));
  await page.waitForTimeout(1400);
  log('C -> thirty: ' + JSON.stringify(await state()));
  await shot('C-switched');
};
