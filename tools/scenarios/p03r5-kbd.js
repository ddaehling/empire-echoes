/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'focus').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(''+e)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.waitForTimeout(3200);
  await page.evaluate(() => document.querySelector('.tl-btn--play').focus());
  const order = [];
  for (let i=0;i<26;i++){ await page.keyboard.press('Tab');
    order.push(await page.evaluate(()=>{const a=document.activeElement; const r=a.getBoundingClientRect(); return (a.className||a.tagName).toString().split(' ')[0]+'['+(a.textContent||'').trim().slice(0,18)+']'+(r.width<1||r.height<1?'!ZERO':'');})); }
  log('tab order from Play:', order.join('  →  '));
  // the rate rail buttons reachable, and they move the year
  await page.evaluate(() => document.querySelector('.tl-rate__lbl[data-dir="out"]').focus());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  log('after Enter on the biggest-loss label:', await page.evaluate(() => document.querySelector('.tl__year').textContent));
  await page.evaluate(() => document.querySelector('.tl-rate__band[data-dir="out"]').focus());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  log('after Enter on the loss window:', await page.evaluate(() => document.querySelector('.tl__year').textContent));
  log('errors:', JSON.stringify(errs));
};
