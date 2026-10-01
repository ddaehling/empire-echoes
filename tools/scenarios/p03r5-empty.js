/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(''+e)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash='#year=1203'; });
  await page.waitForTimeout(600);
  log('empty year 1203:', await page.evaluate(() => document.querySelector('.tl__nothing').innerText.replace(/\n/g,' | ')));
  await shot('01-empty');
  await page.evaluate(() => { location.hash='#year=1882'; });
  await page.waitForTimeout(600);
  await shot('02-1882');
  await page.click('.tl-chg--more').catch(()=>log('no more button at 1882'));
  await page.waitForTimeout(600);
  await page.evaluate(() => { location.hash='#year=1947'; });
  await page.waitForTimeout(600);
  await page.click('.tl-chg--more');
  await page.waitForTimeout(700);
  log('sheet at 1947:', await page.evaluate(() => { const s=document.querySelector('.tl__all'); return JSON.stringify({rows:s.querySelectorAll('.tl-all__row').length, head:s.querySelector('.tl-all__head').innerText.replace(/\n/g,' | '), more:document.querySelector('.tl-chg--more').innerText.replace(/\n/g,' ')}); }));
  await shot('03-sheet-1947');
  log('errors:', JSON.stringify(errs));
};
