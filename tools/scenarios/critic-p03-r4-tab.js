/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'focus').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1765'; });
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.tl-chg')];
    return cards.map(c => ({ tag: c.tagName, ti: c.getAttribute('tabindex'), dis: c.disabled, hid: c.hasAttribute('hidden'), txt: c.innerText.split('\n')[1] || c.innerText.slice(0,30) }));
  });
  log('cards:', JSON.stringify(info, null, 1));
  // focus first card programmatically then tab
  await page.evaluate(() => document.querySelectorAll('.tl-chg')[0].focus());
  const seq = [];
  for (let i=0;i<10;i++){ seq.push(await page.evaluate(()=>{const a=document.activeElement;const r=a.getBoundingClientRect();return a.className.slice(0,26)+'@'+Math.round(r.x)+' vis='+(r.width>0);})); await page.keyboard.press('Tab'); await page.waitForTimeout(120); }
  log('tab from first card:', seq.join('  ->  '));
  log('scrollLeft now:', await page.evaluate(()=>document.querySelector('.tl__track').scrollLeft));
  await shot('tabbed');
  // press Enter on 3rd card
  await page.evaluate(() => document.querySelectorAll('.tl-chg')[2].focus());
  await page.waitForTimeout(300);
  log('scrollLeft after focusing card 3:', await page.evaluate(()=>document.querySelector('.tl__track').scrollLeft));
  await shot('card3-focused');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await shot('card3-enter');
  log('after Enter, hash:', await page.evaluate(()=>location.hash));
  log('body snippet:', await page.evaluate(()=>document.body.innerText.slice(0,60)));
};
