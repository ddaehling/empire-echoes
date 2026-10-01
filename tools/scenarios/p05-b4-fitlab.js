/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b4-fitlab.js — the Map control's label must agree with data-tour-fit, always. */
const read = () => {
  const b = document.querySelector('.tr-panel__fit');
  const fit = document.documentElement.getAttribute('data-tour-fit');
  if (!b) return { fit, btn: null };
  return {
    fit,
    read: document.getElementById('app').getAttribute('data-read'),
    text: (b.textContent || '').trim(),
    pressed: b.getAttribute('aria-pressed'),
    name: b.getAttribute('aria-label'),
    ok: (fit === 'text') === (b.getAttribute('aria-pressed') === 'false'),
  };
};
module.exports = async ({ page, log, shot }) => {
  for (const a of ['#tour=core&step=2', '#tour=core&step=1', '#tour=core&step=12']) {
    await page.goto('http://localhost:8777/app/' + a, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    log(a + ' first paint  ' + JSON.stringify(await page.evaluate(read)));
    // press the panel's own toggle
    const clicked = await page.evaluate(() => { const b = document.querySelector('.tr-panel__fit'); if (!b) return false; b.click(); return true; });
    await page.waitForTimeout(500);
    if (clicked) log(a + ' after press  ' + JSON.stringify(await page.evaluate(read)));
    // and via the shell's ask:read (the peek strip's route)
    await page.evaluate(() => window.BEA.bus.emit('ask:read', { mode: 'text' }));
    await page.waitForTimeout(400);
    log(a + ' after ask    ' + JSON.stringify(await page.evaluate(read)));
  }
  // the spine's fitAfter: reveal changes the fit with no press
  await page.goto('http://localhost:8777/app/#tour=core&step=2', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  log('spine before reveal ' + JSON.stringify(await page.evaluate(read)));
  await page.evaluate(() => { for (const b of document.querySelectorAll('.tr-go, .tr-sweep__skip, .tr-panel button')) { const t = (b.textContent || '').toLowerCase(); if (/skip|stop|show/.test(t)) { b.click(); return; } } });
  await page.waitForTimeout(1400);
  log('spine after reveal  ' + JSON.stringify(await page.evaluate(read)));
  await shot('spine-after');
  // the Close
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(1200);
  log('close               ' + JSON.stringify(await page.evaluate(read)));
  await shot('close-fit');
};
