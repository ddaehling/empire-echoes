/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(''+e)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.waitForTimeout(3200);
  log('play button:', await page.evaluate(() => { const b=document.querySelector('.tl-btn--play'); return b.dataset.mode + ' | ' + b.innerText.trim() + ' | ' + b.getAttribute('aria-label'); }));
  await page.evaluate(() => { location.hash='#year=1600'; });
  await page.waitForTimeout(500);
  await page.click('.tl-btn--play');
  await page.waitForTimeout(900);
  log('after pressing Step:', await page.evaluate(() => ({ y: document.querySelector('.tl__year').textContent, playing: document.querySelector('.tl-btn--play').dataset.playing })));
  await page.click('.tl-btn--play');
  await page.waitForTimeout(600);
  log('again:', await page.evaluate(() => document.querySelector('.tl__year').textContent));
  log('rate rail present:', await page.evaluate(() => !!document.querySelector('.tl-rate__bars rect')));
  await shot('01-reduced');
  log('errors:', JSON.stringify(errs));
};
