/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'clientWidth').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.waitForTimeout(3200);
  await shot('01-landing');
  await page.evaluate(() => { location.hash = '#year=1765'; });
  await page.waitForTimeout(700);
  const m = await page.evaluate(() => {
    const t = document.querySelector('.tl__track');
    return { clientW: t.clientWidth, scrollW: t.scrollWidth, cards: t.querySelectorAll('.tl-chg:not([hidden])').length,
             more: document.querySelector('.tl-chg--more')?.textContent };
  });
  log('1765 track', JSON.stringify(m));
  await shot('02-1765');
  await page.evaluate(() => { location.hash = '#year=1882'; });
  await page.waitForTimeout(600);
  log('1882 cards:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.tl__track .tl-chg:not([hidden])')].map(n=>n.innerText.replace(/\n/g,' | ')))));
  await shot('03-1882');
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(600);
  log('1820 cards:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.tl__track .tl-chg:not([hidden])')].map(n=>n.innerText.replace(/\n/g,' | ')))));
  await shot('04-1820');
  log('errors:', JSON.stringify(errs));
};
