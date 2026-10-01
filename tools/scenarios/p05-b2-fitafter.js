/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b2-fitafter.js — the plate holds the band until the guess is in, then the reading gets it. */
module.exports = async ({ page, shot, log }) => {
  const read = () => page.evaluate(() => {
    const sc = document.querySelector('.tr-panel__scroll');
    const map = document.querySelector('.map.is-enlarged') || document.querySelector('.stage__map canvas') || document.querySelector('.stage__map svg');
    const sh = document.querySelector('.app__sheet');
    const r = (e) => e ? Math.round(e.getBoundingClientRect().height) : null;
    return {
      fit: document.documentElement.getAttribute('data-tour-fit'),
      read: document.getElementById('app').dataset.read,
      win: sc ? sc.clientHeight : null, content: sc ? sc.scrollHeight : null,
      sheet: r(sh), map: r(map),
      screenfuls: sc && sc.clientHeight ? +(sc.scrollHeight / sc.clientHeight).toFixed(1) : null,
    };
  });

  /* ---- the poster: commit a guess ---- */
  await page.goto('http://localhost:8777/app/#tour=core&step=0', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1900);
  log('poster BEFORE  ' + JSON.stringify(await read()));
  await shot('poster-before');
  await page.evaluate(() => {
    const i = document.querySelector('.app__sheet input[type=number]');
    if (i) { i.value = '3'; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); }
    const g = document.querySelector('.tr-go');
    if (g && !g.disabled) g.click();
  });
  await page.waitForTimeout(1400);
  log('poster AFTER   ' + JSON.stringify(await read()));
  await shot('poster-after');

  /* ---- the exits: same shape ---- */
  await page.goto('http://localhost:8777/app/#tour=core&step=12', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1900);
  log('exits  BEFORE  ' + JSON.stringify(await read()));
  await page.evaluate(() => {
    const i = document.querySelector('.app__sheet input[type=number]');
    if (i) { i.value = '30'; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); }
    const g = document.querySelector('.tr-go');
    if (g && !g.disabled) g.click();
  });
  await page.waitForTimeout(1400);
  log('exits  AFTER   ' + JSON.stringify(await read()));
  await shot('exits-after');

  /* ---- the spine: wait for the sweep to end ---- */
  await page.goto('http://localhost:8777/app/#tour=core&step=2', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1900);
  log('spine  BEFORE  ' + JSON.stringify(await read()));
  await page.waitForTimeout(27000);
  log('spine  AFTER   ' + JSON.stringify(await read()));
  await shot('spine-after');

  /* ---- and the student's own press still outranks it ---- */
  const pressed = await page.evaluate(() => {
    const b = document.querySelector('.tr-panel__fit');
    if (!b) return 'no Map control';
    b.click(); return 'pressed';
  });
  await page.waitForTimeout(900);
  log('spine  Map(' + pressed + ') ' + JSON.stringify(await read()));
  await shot('spine-mapped');
};
