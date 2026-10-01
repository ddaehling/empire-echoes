/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1765'; });
  await page.waitForTimeout(800);
  log('row summary:', await page.evaluate(() => document.querySelector('.tl__count, .tl-sum')?.innerText || document.body.innerText.match(/\d+ things dated[\s\S]{0,160}/)[0]));
  await (await page.$('.tl-chg--more')).click();
  await page.waitForTimeout(700);
  const sheet = await page.evaluate(() => {
    const s = document.querySelector('.tl-all');
    if (!s) return 'no .tl-all';
    return { rows: s.querySelectorAll('.tl-all__row').length, foot: s.querySelector('.tl-all__foot')?.innerText, head: s.querySelector('h2,h3')?.innerText, text: s.innerText.slice(0, 400) };
  });
  log('sheet:', JSON.stringify(sheet, null, 1));
  const names = await page.evaluate(() => [...document.querySelectorAll('.tl-all__row')].map(n => n.innerText.split('\n')[0]));
  log('rows(' + names.length + '):', names.join(' | '));
  // keyboard tab through cards (closed state)
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('.tl-ax__rail').focus());
  const order = [];
  for (let i=0;i<12;i++){ await page.keyboard.press('Tab'); order.push(await page.evaluate(()=>{const a=document.activeElement; const r=a.getBoundingClientRect(); return a.className.slice(0,30)+'@'+Math.round(r.x)+','+Math.round(r.y);})); }
  log('tab order from rail:', order.join('  ->  '));
};
