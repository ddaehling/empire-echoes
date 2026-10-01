/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b4-earned.js — a tap-through must NOT arrive with a complete sentence. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.evaluate(() => { try { localStorage.clear(); } catch (_) {} });
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1400);
  // pure tap-through: press Next only, never answer anything
  for (let i = 0; i < 60; i++) {
    /* Gates only: place the complication on the first cell under the thumb and
       press Next. Never answer a beat's own question. */
    await page.evaluate(() => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
      for (const sel of ['.tr-field__cell', '.gt-opt', '.tr-gate__opt', '.qz__opt', '.hg-arg__opt']) {
        const b = [...document.querySelectorAll(sel)].filter(vis)[0];
        if (b) { b.click(); break; }
      }
      for (const ta of document.querySelectorAll('.tr-gate textarea, .hg-arg textarea, .qz textarea')) {
        if (!ta.value) { ta.value = 'Because it complicates the claim.'; ta.dispatchEvent(new Event('input', { bubbles: true })); }
      }
      for (const sel of ['.tr-gate__go', '.hg-arg__go', '.qz__go']) {
        const b = [...document.querySelectorAll(sel)].filter(vis)[0];
        if (b && !b.disabled) b.click();
      }
    });
    await page.waitForTimeout(240);
    const r = await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      if (!b) return 'no-next';
      if (b.disabled || b.getAttribute('data-locked') === 'yes') return 'locked';
      b.click(); return 'ok';
    });
    await page.waitForTimeout(280);
    if (r !== 'ok') { log('stopped after ' + i + ' presses: ' + r); break; }
  }
  const s = await page.evaluate(() => {
    const q = (x) => document.querySelector(x);
    return {
      count: (q('.cl-blk__count') || {}).textContent,
      finish: q('.cl-finish') ? ((q('.cl-finish').textContent || '').trim() + ' primary=' + (q('.cl-finish').dataset.primary || '') + ' :: ' + q('.cl-finish').title) : null,
      filled: [...document.querySelectorAll('.cl-say__filled, .cl-blk__filled')].map(e => (e.textContent || '').trim()),
      done: (() => { try { return JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter(e => e.kind === 'completed').length; } catch (_) { return 0; } })(),
    };
  });
  log('TAP-THROUGH: ' + JSON.stringify(s));
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(1000);
  const c = await page.evaluate(() => ({
    stand: (document.querySelector('.cl-close__stand') || {}).textContent,
    scaffold: (document.querySelector('.cl-sign__scaffold') || {}).textContent,
    gaps: [...document.querySelectorAll('.cl-sign__gap')].map(n => n.dataset.waiting + '|' + n.title),
  }));
  log('CLOSE: ' + JSON.stringify(c, null, 1).slice(0, 1400));
};
