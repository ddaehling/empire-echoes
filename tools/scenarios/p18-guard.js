/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Layout-budget guards for P18: the launcher at second zero, and the plate
   rectangle with a comparison open. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  const zero = await page.evaluate(() => {
    const b = document.querySelector('.cmp__launch');
    const cmp = document.querySelector('.cmp');
    const map = document.querySelector('.stage__map canvas');
    const r = map && map.getBoundingClientRect();
    return {
      stage: document.getElementById('app').dataset.stage,
      launcherHidden: b ? b.hidden : 'no launcher',
      launcherBox: b && !b.hidden ? b.getBoundingClientRect().width : 0,
      cmpHidden: cmp ? cmp.hasAttribute('hidden') : 'none',
      map: r ? Math.round(r.width) + 'x' + Math.round(r.height) : null,
      hostClass: document.querySelector('.stage__over').className,
    };
  });
  log('SECOND ZERO', JSON.stringify(zero));

  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'america', reveal: true }));
  await page.waitForTimeout(1200);
  const open = await page.evaluate(() => {
    const map = document.querySelector('.stage__map canvas');
    const r = map && map.getBoundingClientRect();
    const app = document.getElementById('app');
    const stage = document.querySelector('.app__stage').getBoundingClientRect();
    const key = document.querySelector('.stage__key').getBoundingClientRect();
    const plate = { l: stage.x, t: stage.y, r: stage.x + stage.width, b: stage.y + stage.height - key.height };
    // B5, applying budget.js's own exemptions
    const intruders = [];
    for (const e of app.querySelectorAll('*')) {
      const cs = getComputedStyle(e);
      if (cs.position !== 'absolute' && cs.position !== 'fixed') continue;
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none') continue;
      if (cs.backgroundColor === 'rgba(0, 0, 0, 0)' && !e.className.toString().includes('panel')) continue;
      if (e.closest('.stage__map') || e.closest('.stage__over') || e.closest('.app__overlay')) continue;
      const b2 = e.getBoundingClientRect();
      const ox = Math.max(0, Math.min(b2.right, plate.r) - Math.max(b2.left, plate.l));
      const oy = Math.max(0, Math.min(b2.bottom, plate.b) - Math.max(b2.top, plate.t));
      if (ox * oy > 4000) intruders.push(e.className + ' ' + Math.round(ox * oy));
    }
    const canv = [...document.querySelectorAll('.cmp canvas')].map(c => { const q = c.getBoundingClientRect(); return Math.round(q.width) + 'x' + Math.round(q.height); });
    return {
      mapUntouched: r ? Math.round(r.width) + 'x' + Math.round(r.height) : null,
      timeBar: Math.round(document.querySelector('.app__time').getBoundingClientRect().height),
      docScroll: document.documentElement.scrollHeight - innerHeight,
      ribbonVisible: getComputedStyle(document.querySelector('.stage__key')).visibility,
      intruders, comparePlates: canv,
      totalDrawn: canv.reduce((a, s) => a + (+s.split('x')[0]) * (+s.split('x')[1]), 0),
    };
  });
  log('COMPARE OPEN', JSON.stringify(open));
  await shot('open');

  // mount / destroy churn — no listener leak, no stray node
  const churn = await page.evaluate(async () => {
    const reg = window.BEA.registry;
    const before = document.querySelectorAll('.cmp, .cmp__launch').length;
    return { before, note: 'registry has no public remount; measured by re-opening instead' };
  });
  for (let i = 0; i < 12; i++) {
    await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'peak', reveal: true }));
    await page.waitForTimeout(90);
    await page.evaluate(() => window.BEA.bus.emit('compare:close'));
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({
    cmpNodes: document.querySelectorAll('.cmp').length,
    launchers: document.querySelectorAll('.cmp__launch').length,
    hostClass: document.querySelector('.stage__over').className,
    compareYear: window.BEA.store.getState().compareYear,
    hash: location.hash,
  }));
  log('AFTER 12 OPEN/CLOSE CYCLES', JSON.stringify(after));
};
