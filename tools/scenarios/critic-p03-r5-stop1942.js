/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1941'; });
  await page.waitForTimeout(900);
  await page.locator('.tl-btn--play').click();
  for (let i=0;i<16;i++){ await page.waitForTimeout(500);
    const s = await page.evaluate(()=>({y:document.querySelector('.tl__year')?.textContent, playing:document.querySelector('.tl-btn--play')?.getAttribute('data-playing')}));
    if (s.playing === 'false' && s.y !== '1941') break; }
  await shot('stop1942');
  log('STOPCARD:', await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(e => /STOPPED HERE/i.test(e.textContent) && e.children.length < 8);
    const card = document.querySelector('[class*="stopcard"], [class*="tl__stop"], .tl__stopped');
    return (card||el)?.innerText || 'not found';
  }));
  // now lane popover
  await page.locator('.tl-lane').nth(3).click();
  await page.waitForTimeout(700);
  await shot('lane-pop');
  log('LANE POP:', await page.evaluate(() => {
    const p = document.querySelector('[class*="lanepop"], [class*="tl-lane__pop"], [role="dialog"]');
    return p ? p.innerText.slice(0,2000) : 'no popover; tl text: ' + document.querySelector('.tl').innerText.slice(-1200);
  }));
};
