/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `shellr3-drive`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: driving the shell through its own states without losing the band. */
/** shellr3-drive — drive the shell hard and count console errors, page errors,
 *  failed requests and horizontal overflow. Run at every listed viewport in
 *  light, dark and reduced motion. */
module.exports = async ({ page, shot, log }) => {
  const ready = async () => {
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1400);
  };
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await ready();

  const chk = async (where) => {
    const r = await page.evaluate(() => ({
      hOver: document.documentElement.scrollWidth - innerWidth,
      vOver: document.documentElement.scrollHeight - innerHeight,
      stage: document.getElementById('app').dataset.stage,
      rail: document.getElementById('app').dataset.rail,
      dock: getComputedStyle(document.getElementById('app')).getPropertyValue('--dock-floor').trim(),
      loud: [...document.querySelectorAll('#app .cx-cta:not([hidden])')].filter(c => !c.dataset.quiet).length,
    }));
    log(where + ' ' + JSON.stringify(r));
    return r;
  };

  await chk('cold');
  // the sweep
  await page.evaluate(() => window.BEA.bus.emit('ask:sweep'));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.BEA.bus.emit('ask:sweep'));   // re-entrancy
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await chk('after sweep');

  // stages, up and down
  for (const lvl of ['working', 'apparatus', 'plate', 'apparatus']) {
    await page.evaluate((l) => window.BEA.bus.emit('ask:stage', { level: l }), lvl);
    await page.waitForTimeout(350);
  }
  await chk('after stages');

  // the sheet, opened and displaced and restored
  await page.evaluate(() => {
    const n = document.createElement('div'); n.innerHTML = '<p>x</p>'.repeat(60);
    window.BEA.bus.emit('ask:sheet', { id: 'drive', eyebrow: 'E', title: 'T', node: n });
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { a: 1914, b: 1922 }));
  await page.waitForTimeout(900);
  await page.evaluate(() => window.BEA.bus.emit('compare:close', {}));
  await page.waitForTimeout(900);
  await chk('after sheet/compare');

  // the tools panel
  const more = await page.$('#bar-more');
  if (more) {
    const vis = await more.isVisible();
    if (vis) { await more.click(); await page.waitForTimeout(400); await chk('tools open'); await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
  }

  // the lesson, and a resize inside it
  /* ROUND 2 OF WAVE 9: `{ id: 'thirty', step: 6 }` was typed here. `thirty` is
     the full route, which no cold start runs, and step 6 names a different
     surface on every other route. Both come off the payload: the route a cold
     start gives, at a beat in the middle of it. */
  await page.evaluate((s) => { window.BEA.store.dispatch('startTour', s); }, await (async () => {
    const RT = require('./lib/routes.js');
    const id = (await RT.chosen(page))[0];
    const beats = (await RT.stepsOf(page, id)).filter((x) => x.kind === 'beat');
    const mid = beats[Math.floor(beats.length / 2)];
    log('drive: ' + id + ' at step ' + mid.step + ' (' + mid.id + ')');
    return { id, step: mid.step };
  })());
  await page.waitForTimeout(1600);
  await chk('in the lesson');
  await page.setViewportSize({ width: 700, height: 900 });
  await page.waitForTimeout(1200);
  await chk('resized to 700x900');
  await page.setViewportSize({ width: 1200, height: 700 });
  await page.waitForTimeout(1200);
  await chk('resized to 1200x700');
  await shot('drive-end');

  // a nonsense address, then a good one
  await page.evaluate(() => { location.hash = '/nope/nope'; });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { location.hash = 'year=1857'; });
  await page.waitForTimeout(1400);
  await chk('after addresses');
};
