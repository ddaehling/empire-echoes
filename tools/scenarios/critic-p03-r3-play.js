/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1755));
  await page.waitForTimeout(400);
  // press Space on body
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('Space');
  await page.waitForTimeout(2600);
  const y1 = await page.evaluate(() => window.BEA.store.getState());
  log('after Space 2.6s: year', y1.year, 'playing', y1.playing, 'speed', y1.speed);
  await shot('playing');
  await page.waitForTimeout(4000);
  const y2 = await page.evaluate(() => window.BEA.store.getState());
  log('after 6.6s: year', y2.year, 'playing', y2.playing);
  await shot('playing2');
  await page.keyboard.press('Space');
  await page.waitForTimeout(400);
  log('after Space again playing:', await page.evaluate(() => window.BEA.store.getState().playing));
  // speed select
  const sel = await page.$('select');
  if (sel) { log('speed options:', await sel.evaluate(n => [...n.options].map(o=>o.textContent).join('|'))); }
  // stop behaviour: play into a big year
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1855));
  await page.evaluate(() => window.BEA.store.dispatch('setSpeed', 4));
  await page.keyboard.press('Space');
  await page.waitForTimeout(5000);
  const y3 = await page.evaluate(() => window.BEA.store.getState());
  log('play from 1855 @4x for 5s -> year', y3.year, 'playing', y3.playing);
  await shot('stopped');
  log('stagenote/footer:', await page.evaluate(() => {
    const f = document.querySelector('.tl, footer, [class*="tl-root"]');
    return f ? f.innerText.slice(0, 1800) : 'none';
  }));
};
