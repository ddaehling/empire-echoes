/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  for (const y of [1765, 1947]) {
    await page.evaluate((yy)=>{location.hash='#year='+yy;}, y);
    await page.waitForTimeout(900);
    await shot('y'+y);
  }
  // click the predict button
  const btn = await page.$('.tl-rate__ask');
  if (btn) { await btn.click(); await page.waitForTimeout(700); await shot('predict-open');
    log('predict text: '+await page.evaluate(()=>{const p=document.querySelector('.tl-rate, .tl-guess, .tl-predict'); return p?p.innerText.slice(0,1200):'none';}));
  } else log('no ask button');
  // account disputed chip
  const chip = await page.$('.tl__disputed, [class*=disput]');
  if (chip) { await chip.click(); await page.waitForTimeout(600); await shot('disputed'); 
    log('disputed: '+await page.evaluate(()=>{const p=document.querySelector('.tl__pop, [class*=pop]'); return p?p.innerText.slice(0,1200):'none';})); }
  else log('no disputed chip');
};
