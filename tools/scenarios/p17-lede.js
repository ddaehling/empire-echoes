/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 — does the ribbon (or its pinned copy) ever overlap the lede strip
   in the 768–1024 band, with a rail open? */
module.exports = async ({ page, shot, log }) => {
  const box = async (sel) => page.evaluate((s) => {
    const e = document.querySelector(s); if (!e) return null;
    const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden') return null;
    const r = e.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(r.right), b: Math.round(r.bottom), pos: c.position, z: c.zIndex };
  }, sel);
  const ov = (a, b) => (!a || !b) ? 0
    : Math.max(0, Math.min(a.b, b.b) - Math.max(a.y, b.y)) * Math.max(0, Math.min(a.r, b.r) - Math.max(a.x, b.x));

  const state = async (label) => {
    const key = await box('.stage__key');
    const pin = await box('.legend__pin');
    const lede = await box('.app__lede');
    const rib = await box('.legend--ribbon');
    const app = await page.evaluate(() => { const a = document.getElementById('app');
      return { dock: a.dataset.dock, rail: a.dataset.rail, dossier: a.dataset.dossier, sheet: a.dataset.sheet, stage: a.dataset.stage }; });
    log(`\n-- ${label}  ${JSON.stringify(app)}`);
    log('   lede   ' + JSON.stringify(lede));
    log('   key    ' + JSON.stringify(key));
    log('   pin    ' + JSON.stringify(pin));
    log('   ribbon ' + JSON.stringify(rib));
    log('   key x lede = ' + ov(key, lede) + ' px2 ; pin x lede = ' + ov(pin, lede) + ' px2');
    await shot(label.replace(/\W+/g, '_'));
  };

  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForTimeout(2800);
  await state('cold');
  // open a dossier by clicking a territory
  for (const [x, y] of [[420, 300], [300, 250], [500, 320], [200, 300]]) {
    await page.mouse.click(x, y); await page.waitForTimeout(900);
    if (await page.evaluate(() => document.getElementById('app').dataset.dossier === 'open')) break;
  }
  await state('dossier-open');
  // open the legend sheet
  await page.evaluate(() => document.querySelector('.legend__route')?.click());
  await page.waitForTimeout(1400);
  await state('legend-sheet-open');
  // inside a beat
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForTimeout(2800);
  await state('beat9');
  await page.evaluate(() => document.querySelector('.legend__route')?.click());
  await page.waitForTimeout(1400);
  await state('beat9-sheet-open');
};
