/**
 * Discoverability on a cold landing. The round-3 verdict caps a piece that is
 * "entirely hidden from a cold landing" (it says so of Recall). This measures
 * whether the matrix's own control ever appears to a reader who touches
 * nothing at all — the shell auto-advances to `working` when the opening sweep
 * finishes, which is the only route that costs the reader nothing.
 */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });

  const M = () => page.evaluate(() => {
    const e = document.querySelector('.mx-entry');
    const b = e ? e.getBoundingClientRect() : null;
    return {
      t: Math.round(performance.now() / 1000),
      stage: document.getElementById('app').dataset.stage,
      entry: !!e, hidden: e ? e.hidden : null,
      w: b ? Math.round(b.width) : 0,
    };
  });

  log('t0   ' + JSON.stringify(await M()));
  for (let i = 0; i < 2; i++) {
    await page.waitForTimeout(5000);
    const m = await M();
    log('+' + ((i + 1) * 5) + 's ' + JSON.stringify(m));
    if (m.w > 0) { log('VISIBLE with no user action after about ' + ((i + 1) * 5) + 's'); return; }
  }
  log('NEVER VISIBLE without user action');
};
