/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// P03 — keyboard, reduced motion, focus rings, and the module's own housekeeping.
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForSelector('.tl-ax__rail');
  const year = () => page.evaluate(() => window.BEA.store.getState().year);
  const playing = () => page.evaluate(() => window.BEA.store.getState().playing);
  const motion = await page.evaluate(() => document.documentElement.dataset.motion + ' / reduced=' + window.BEA.util?.prefersReducedMotion?.());
  log('motion attr: ' + motion);

  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1800));
  await page.focus('.tl-ax__rail');
  await shot('rail-focus', '.app__time');
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  log('after 2x ArrowRight (rail focused): ' + await year());
  await page.keyboard.press('PageUp'); log('after PageUp: ' + await year());
  await page.keyboard.press('Home'); log('after Home: ' + await year());
  await page.keyboard.press('End'); log('after End: ' + await year());
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('Home'); log('Home from body: ' + await year());
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1700));
  await page.keyboard.press('ArrowRight');
  log('ArrowRight from body (should NOT move the year — arrows belong to the map): ' + await year());

  // Space toggles play
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('Space'); await page.waitForTimeout(120);
  log('Space from body -> playing=' + await playing() + ' year=' + await year());
  await page.keyboard.press('Space'); await page.waitForTimeout(120);
  log('Space again -> playing=' + await playing());

  // Reduced motion: play must step, not run
  await page.evaluate(() => window.BEA.store.batch(d => { d('setReducedMotion', 'reduced'); d('setYear', 1856); }));
  await page.waitForTimeout(200);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('Space'); await page.waitForTimeout(400);
  log('reduced: playing=' + await playing() + ' year=' + await year() + ' (expect playing=false, year=1857)');
  await shot('reduced', '.app__time');
  log('play button title: ' + await page.getAttribute('.tl-btn--play', 'title'));
  await page.evaluate(() => window.BEA.store.dispatch('setReducedMotion', 'auto'));

  // bus contract: block playback
  await page.evaluate(() => window.BEA.bus.emit('ask:blockPlayback', { reason: 'commit a prediction first' }));
  await page.waitForTimeout(150);
  log('blocked: disabled=' + await page.getAttribute('.tl-btn--play', 'disabled') + ' title=' + await page.getAttribute('.tl-btn--play', 'title'));
  await page.evaluate(() => window.BEA.bus.emit('ask:allowPlayback'));
  await page.waitForTimeout(150);
  log('unblocked: disabled=' + await page.getAttribute('.tl-btn--play', 'disabled'));

  // chip navigates to the place
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1874));
  await page.waitForTimeout(150);
  const chip = await page.$('.tl-chip');
  if (chip) { await chip.click(); await page.waitForTimeout(200); }
  log('after chip click, selected=' + await page.evaluate(() => window.BEA.store.getState().selectedTerritoryId));
  log('errors: ' + JSON.stringify(errs));
};
