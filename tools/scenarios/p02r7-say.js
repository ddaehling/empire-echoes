/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * P02 round 7 — THE BAND. Two rules, both of which this module broke.
 *
 *   1. Every re-encoding this module offers says its OWN sentence. Before this
 *      round, pressing P put the shell's definition sentence on screen ("the
 *      word changed, not the map") on the one action that changes the map and
 *      not the word; W, S and H said nothing at all and left the previous,
 *      now-stale sentence up at 19px.
 *   2. No sentence this module writes may be clipped by the band. The band
 *      clamps at two lines with an ellipsis, and a broken sentence at the top
 *      of the screen teaches nothing.
 *
 *   node tools/inspect.js tools/scenarios/p02r7-say.js --out /tmp/say --w 1366 --h 768
 *   node tools/inspect.js tools/scenarios/p02r7-say.js --out /tmp/say --w 1024 --h 640
 *   node tools/inspect.js tools/scenarios/p02r7-say.js --out /tmp/say --mobile
 */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1800);
  let clipped = 0, silent = 0;
  const check = async (tag, wantMark) => {
    await page.waitForTimeout(520);
    const r = await page.evaluate(() => {
      const e = document.querySelector('.cx-lede__say');
      if (!e) return { mark: '', text: '', chars: 0, clip: false };
      return {
        mark: (document.querySelector('.cx-lede__mark') || { textContent: '' }).textContent,
        text: e.textContent, chars: e.textContent.length,
        clip: e.scrollHeight > e.clientHeight + 1,
      };
    });
    const said = wantMark ? r.mark.includes(wantMark) : true;
    if (r.clip) clipped++;
    if (!said) silent++;
    log((r.clip ? 'CLIPPED ' : said ? 'PASS    ' : 'SILENT  ') + tag + '  [' + r.chars + ' chars]  ' + r.mark + ' :: ' + r.text);
  };

  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1901));
  await check('year');
  await page.keyboard.press('p'); await page.waitForTimeout(900); await check('P projection on', 'EQUAL EARTH');
  await page.keyboard.press('p'); await page.waitForTimeout(900); await check('P projection off', 'MERCATOR');
  await page.keyboard.press('w'); await check('W weight on', 'PEOPLE');
  await page.keyboard.press('w'); await check('W weight off', 'LAND');
  await page.keyboard.press('s'); await check('S stitching on', 'SMALL PLACES');
  await page.keyboard.press('s'); await check('S stitching off', 'LAND');
  await page.keyboard.press('h'); await check('H silences on, 1901', 'NOT HERE');
  await page.keyboard.press('h'); await check('H silences off', 'AS FILED');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1954));
  await page.keyboard.press('h'); await check('H silences on, 1954', 'NOT HERE');
  await page.keyboard.press('h');
  for (const k of ['2', '3', '4', '1']) { await page.keyboard.press(k); await check('definition ' + k); }

  log(clipped ? '>>> ' + clipped + ' SENTENCE(S) CLIPPED BY THE BAND' : '>>> every sentence fits the band');
  log(silent ? '>>> ' + silent + ' RE-ENCODING(S) NEVER REACHED THE BAND' : '>>> every re-encoding said its own sentence');
};
