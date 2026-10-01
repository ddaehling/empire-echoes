/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'hidden').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const FIX = () => { const s=document.createElement('style'); s.textContent='.dsr__prose,.dsr__name{font-size:1rem !important;line-height:1.4 !important}'; document.head.append(s); };
const Y = () => window.BEA.store.getState().year;
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate(FIX);
  await page.evaluate(() => { location.hash = '#year=1856'; });
  await page.waitForTimeout(600);
  log('start year', await page.evaluate(Y));

  // Shift+Right from 1856
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(400);
  const after = await page.evaluate(Y);
  const expect = await page.evaluate(() => window.BEA.data.nextChangeYear(1856, 1));
  log('AT3 Shift+Right from 1856 ->', after, 'expected', expect, after === expect ? 'PASS' : 'FAIL');

  // Shift+Left
  await page.keyboard.press('Shift+ArrowLeft');
  await page.waitForTimeout(300);
  log('shift+left ->', await page.evaluate(Y));

  // Home / End
  await page.keyboard.press('Home'); await page.waitForTimeout(300);
  log('Home ->', await page.evaluate(Y));
  await page.keyboard.press('End'); await page.waitForTimeout(300);
  log('End ->', await page.evaluate(Y));

  // Space toggles play
  await page.evaluate(() => { location.hash = '#year=1885'; });
  await page.waitForTimeout(400);
  await page.click('body', { position: { x: 700, y: 400 } }).catch(()=>{});
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
  log('playing after Space:', await page.evaluate(() => window.BEA.store.getState().playing), 'year', await page.evaluate(Y));
  await page.waitForTimeout(3000);
  log('after 3s of play: year', await page.evaluate(Y), 'playing', await page.evaluate(() => window.BEA.store.getState().playing));
  await shot('playing', '.tl');
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
  log('playing after 2nd Space:', await page.evaluate(() => window.BEA.store.getState().playing));

  // stop card: play from 1946 -> should hit 1947 phase end
  await page.evaluate(() => { location.hash = '#year=1944'; });
  await page.waitForTimeout(400);
  await page.keyboard.press('Space');
  await page.waitForTimeout(4000);
  log('stopcard hidden?', await page.evaluate(() => document.querySelector('.tl__stopcard').hidden));
  log('stopcard text:', await page.evaluate(() => document.querySelector('.tl__stopcard').innerText));
  log('year now', await page.evaluate(Y), 'playing', await page.evaluate(() => window.BEA.store.getState().playing));
  await shot('stopcard', '.tl');
  await shot('stopcard-viewport');
};
