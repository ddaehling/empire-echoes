/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Playback that reads: rests, stop cards, reduced motion, and the expander. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl'), null, { timeout: 20000 });
  // the expander, full page, so the map is still visible behind it
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1947));
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector('.tl-chg--more').click());
  await page.waitForTimeout(300);
  await shot('expander');
  log('expander rows: ' + await page.evaluate(() => document.querySelectorAll('.tl-all__row').length));
  log('expander first row: ' + await page.evaluate(() => (document.querySelector('.tl-all__row') || {}).innerText));
  log('map still visible behind: ' + await page.evaluate(() => {
    const m = document.querySelector('.map'); const r = m.getBoundingClientRect();
    return JSON.stringify({ h: Math.round(r.height), covered: Math.round(document.querySelector('.tl__all').getBoundingClientRect().height) });
  }));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);

  // playback stops itself at a phase boundary
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1836); window.BEA.store.dispatch('setSpeed', 16); });
  await page.waitForTimeout(200);
  await page.evaluate(() => window.BEA.bus.emit('ask:play'));
  await page.waitForTimeout(3000);
  const s = await page.evaluate(() => ({
    year: window.BEA.store.getState().year, playing: window.BEA.store.getState().playing,
    card: (document.querySelector('.tl__stopcard') || {}).innerText, kind: (document.querySelector('.tl__stopcard') || {}).dataset,
  }));
  log('after playing from 1836 at 16x: ' + JSON.stringify(s));
  await shot('stopcard');

  // the measured cards: peak, biggest gain, biggest loss
  log('stops (measured): ' + await page.evaluate(() => {
    const tl = document.querySelector('.tl').__p03;
    return JSON.stringify([...tl.stops.values()].filter(s => s.kind === 'measured').map(s => s.year + ' :: ' + s.title + ' :: ' + s.why.slice(0, 210)), null, 1);
  }));
};
