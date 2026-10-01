/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(900);
  for (const L of ['status', 'tenure', 'mechanism', 'resistance', 'informal']) {
    await page.evaluate((l) => { location.hash = '#year=1900&layer=' + l; }, L);
    await page.waitForTimeout(900);
    const box = await page.evaluate(() => {
      const n = document.querySelector('.legend--ribbon');
      if (!n) return null;
      const r = n.getBoundingClientRect();
      return { x: Math.round(r.x - 8), y: Math.round(r.y - 6), width: Math.round(r.width + 16), height: Math.round(r.height + 12) };
    });
    if (box) await page.screenshot({ path: require('path').join(process.env.P17OUT || '/tmp', 'x.png') }).catch(() => {});
    await shot('rib-' + L, '.stage__key');
    const say = await page.evaluate(() => {
      const n = document.querySelector('.legend--ribbon');
      return n ? n.textContent.trim().replace(/\s+/g, ' ').slice(0, 260) : null;
    });
    log(L + ' :: ' + say);
  }
  /* the sheet on a re-keyed plate */
  await page.evaluate(() => { location.hash = '#year=1900&layer=exit'; });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(900);
  await shot('sheet-on-exit');
  const live = await page.evaluate(() => {
    const n = document.querySelector('.legend__live');
    return n ? n.textContent.replace(/\s+/g, ' ').slice(0, 700) : '(no live block)';
  });
  log('LIVE BLOCK :: ' + live);
};
