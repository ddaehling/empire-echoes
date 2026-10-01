/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const found = await page.evaluate(() => {
    const b = document.querySelector('[data-block="nested"]');
    if (!b) return null;
    b.scrollIntoView({block:'center'});
    return b.innerText.slice(0, 800);
  });
  log('NESTED BLOCK:\n' + found);
  await page.waitForTimeout(500);
  await shot('t11-before');
  const paintedBefore = await page.evaluate(() => document.querySelectorAll('.map__target').length + ' targets; painted=' + document.querySelectorAll('[data-painted], .is-painted, .map__target[data-paint]').length);
  log('before: ' + paintedBefore);
  await page.click('[data-act="paint-direct"]');
  await page.waitForTimeout(900);
  await shot('t11-direct');
  log('after direct: ' + await page.evaluate(() => {
    const n = document.querySelectorAll('.is-painted, [data-paint="1"], .map__target.is-dim').length;
    const note = document.querySelector('.stage-note, .map__note, [class*=note]');
    return n + ' | note: ' + (note ? note.innerText.slice(0,200) : 'none');
  }));
  await page.click('[data-act="paint-children"]');
  await page.waitForTimeout(900);
  await shot('t11-children');
  // live region check
  await page.evaluate(() => { location.hash='#year=1913&sel=kenya'; });
  await page.waitForTimeout(900);
  log('LIVE after select: ' + JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('[aria-live]')].map(n=>n.getAttribute('aria-live')+'::'+n.innerText.slice(0,140)))));
};
