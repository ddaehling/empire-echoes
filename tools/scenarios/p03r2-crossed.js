/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.waitForFunction: Timeout 20000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot, url }) => {
  const base = url.split('#')[0];
  await page.goto(base + '#year=1858&def=controlled', { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('.tl-chg'), null, { timeout: 20000 });
  await page.waitForTimeout(500);
  log('1858 controlled: ' + await page.evaluate(() => JSON.stringify({
    count: document.querySelector('.tl__count').textContent,
    head: document.querySelector('.tl__changecount').textContent,
    delta: document.querySelector('.tl__delta').textContent,
    cards: [...document.querySelectorAll('.tl-chg:not(.tl-chg--more)')].filter(c => !c.hidden).map(c => ({
      s: c.querySelector('.tl-chg__subject').textContent,
      m: c.querySelector('.tl-chg__mech').textContent,
      h: c.querySelector('.tl-chg__how').textContent.slice(0, 70),
    })),
  }, null, 1)));
  await shot('1858-controlled', '.tl');
  // the expander, with the records that did not move the map
  await page.evaluate(() => document.querySelector('.tl-chg--more').click());
  await page.waitForTimeout(300);
  log('also-section: ' + await page.evaluate(() => {
    const a = document.querySelector('.tl-all__also');
    return a ? a.textContent + ' || ' + [...document.querySelectorAll('.tl-all__row--flat')].slice(0,3).map(r => r.innerText.replace(/\n/g,' / ')).join('  ~~  ') : 'none';
  }));
  await shot('expander-controlled');
};
