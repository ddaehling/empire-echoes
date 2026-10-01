/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(''+e)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.waitForTimeout(3200);
  // 1. a card popover — counterparties + sources
  await page.evaluate(() => { location.hash = '#year=1900'; });
  await page.waitForTimeout(600);
  await page.click('.tl__track .tl-chg:not([hidden])');
  await page.waitForTimeout(500);
  log('POP 1900 first card:', await page.evaluate(() => document.querySelector('.tl__pop').innerText));
  await shot('01-pop-1900');
  // 2. the 1765 diwani card sources
  await page.keyboard.press('Escape');
  await page.evaluate(() => { location.hash = '#year=1765'; });
  await page.waitForTimeout(600);
  const cards = await page.$$('.tl__track .tl-chg:not([hidden])');
  await cards[2].click();
  await page.waitForTimeout(500);
  log('POP 1765 card3:', await page.evaluate(() => document.querySelector('.tl__pop').innerText));
  await shot('02-pop-1765');
  // 3. the sheet count consistency
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.click('.tl-chg--more');
  await page.waitForTimeout(600);
  log('sheet:', JSON.stringify(await page.evaluate(() => {
    const s = document.querySelector('.tl__all');
    return { rows: s.querySelectorAll('.tl-all__row').length, head: s.querySelector('.tl-all__head').innerText.replace(/\n/g,' | '),
             more: document.querySelector('.tl-chg--more').innerText.replace(/\n/g,' '), foot: document.querySelector('.tl__drawer-more')?.innerText };
  })));
  await shot('03-sheet-1765');
  log('errors:', JSON.stringify(errs));
};
