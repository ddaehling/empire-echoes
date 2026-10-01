/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* p20-kbd — keyboard operation, and the jump nav must not eat the app's hash. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1000);
  await page.goto(page.url().split('#')[0] + '#year=1857&sel=bengal-presidency&panel=workshop');
  await page.waitForTimeout(1800);
  const before = await page.evaluate(() => location.hash);
  await page.evaluate(() => document.querySelectorAll('.tp-jump__item')[3].click());
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => ({ hash: location.hash, year: window.BEA.store.getState().year,
    scrolled: Math.round(document.querySelector('.tp__pages').scrollTop),
    focus: document.activeElement.textContent.trim().slice(0, 30) }));
  log('JUMP before=' + before + ' after=' + JSON.stringify(after));

  // tab strip: focus a tab, arrow across
  await page.evaluate(() => document.getElementById('tp-tab-workshop').focus());
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const tabs = await page.evaluate(() => ({ on: document.querySelector('.tp-tab.is-on').id,
    active: document.activeElement.id, hash: location.hash,
    tabindexes: [...document.querySelectorAll('.tp-tab')].map(t => t.tabIndex) }));
  log('ARROWS ' + JSON.stringify(tabs));

  await page.keyboard.press('End');
  await page.waitForTimeout(400);
  log('END ' + await page.evaluate(() => document.querySelector('.tp-tab.is-on').id));
};
