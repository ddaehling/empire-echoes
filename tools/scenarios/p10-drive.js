/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10-drive — resolve the bank, open a question, answer it wrong, look. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 10000 });
  const info = await page.evaluate(() => ({
    items: window.BEA.quiz.items().map(i => i.id + ' [' + i.t + '/' + (i.misconception||'-') + '] ' + i.kind),
    dropped: window.BEA.quiz.dropped(),
    keys: window.BEA.quiz.persistedKeys(),
  }));
  log('RESOLVED ' + info.items.length + '\n  ' + info.items.join('\n  '));
  log('DROPPED  ' + (info.dropped.join(' | ') || 'none'));
  log('PERSISTED KEYS ' + info.keys.join(', '));

  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1857));
  await page.waitForTimeout(400);
  await shot('01-working');

  await page.evaluate(() => window.BEA.quiz.open('t6-who-conquered'));
  await page.waitForTimeout(500);
  await shot('02-choose');

  // answer it wrong on purpose
  await page.evaluate(() => window.BEA.quiz.answer('navy'));
  await page.waitForTimeout(700);
  await shot('03-corrected');

  const st = await page.evaluate(() => ({ year: BEA.store.getState().year, sel: BEA.store.getState().selectedTerritoryId, ls: localStorage.getItem('bea:metrics.v1') }));
  log('AFTER WRONG ' + JSON.stringify(st));

  await page.evaluate(() => window.BEA.quiz.open('t7-loop'));
  await page.waitForTimeout(400);
  await shot('04-order');

  await page.evaluate(() => window.BEA.quiz.open('t3-middle-passage'));
  await page.waitForTimeout(400);
  await shot('05-estimate');

  await page.evaluate(() => window.BEA.quiz.open('t7-explain'));
  await page.waitForTimeout(400);
  await shot('06-explain');

  await page.evaluate(() => window.BEA.quiz.open('t14-peak'));
  await page.waitForTimeout(400);
  await shot('07-year');

  await page.evaluate(() => window.BEA.quiz.open('t16-famine'));
  await page.waitForTimeout(400);
  await shot('08-map');

  await page.evaluate(() => window.BEA.quiz.open('t1-engines'));
  await page.waitForTimeout(400);
  await shot('09-match');
};
