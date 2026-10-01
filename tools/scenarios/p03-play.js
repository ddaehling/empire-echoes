/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'textContent').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// P03 — playback that reads: rests on empire-wide years, stops at the moments that matter.
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForSelector('.tl');
  const seen = await page.evaluate(async () => {
    const store = window.BEA.store, bus = window.BEA.bus;
    const stops = [], rests = [];
    bus.on('time:stop', s => stops.push([s.year, s.title]));
    const tl = document.querySelector('.tl').__p03;
    const restYears = [...tl.rests.keys()].filter(y => y > 1800 && y < 1860).slice(0, 5);
    const allStops = [...tl.stops.values()].map(s => [s.year, s.kind, s.title]);
    // run a stretch and watch it stop itself
    store.batch(d => { d('setYear', 1795); d('setSpeed', 16); });
    store.dispatch('play');
    await new Promise(r => setTimeout(r, 4000));
    return { stops, restYears, allStops, year: store.getState().year, playing: store.getState().playing,
             card: document.querySelector('.tl__stopcard').textContent };
  });
  log('all stops: ' + JSON.stringify(seen.allStops));
  log('rest years 1800-1860: ' + JSON.stringify(seen.restYears));
  log('stops fired: ' + JSON.stringify(seen.stops));
  log('landed: year=' + seen.year + ' playing=' + seen.playing);
  log('card: ' + seen.card);
  await shot('after-stop', '.app__time');
  // resume: Keep going must not re-stop on the same year
  await page.click('.tl__stop-go');
  await page.waitForTimeout(900);
  log('after Keep going: year=' + await page.evaluate(() => window.BEA.store.getState().year) + ' playing=' + await page.evaluate(() => window.BEA.store.getState().playing));
  await page.evaluate(() => window.BEA.store.dispatch('pause'));
  log('errors: ' + JSON.stringify(errs));
};
