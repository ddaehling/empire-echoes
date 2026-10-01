/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.waitForTimeout(3000);
  const tlText = () => page.evaluate(() => {
    const n = document.querySelector('.tl-spine')?.closest('section,div[class]');
    const root = document.querySelector('.tl-ax')?.parentElement?.parentElement;
    return (root || document.body).innerText;
  });
  const yearNow = () => page.evaluate(() => location.hash + ' | ' + (document.querySelector('.tl-year, [class*=year]')?.innerText || ''));

  // 1820 test
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(1200);
  await shot('year1820');
  log('1820 spine text:', await page.evaluate(() => document.querySelector('.tl-spine')?.innerText));

  // 1600 / 1830 / 1858 / 1942
  for (const y of [1600, 1832, 1858, 1945]) {
    await page.evaluate(yy => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(700);
    log(y + ' spine caption:', await page.evaluate(() => document.querySelector('.tl-spine__caption')?.innerText));
  }

  // Shift+ArrowRight from 1856
  await page.evaluate(() => { location.hash = '#year=1856'; });
  await page.waitForTimeout(800);
  await page.click('.tl-ax__handle', { force: true }).catch(()=>{});
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(600);
  log('after Shift+Right from 1856, hash =', await page.evaluate(() => location.hash));
  const expect = await page.evaluate(() => {
    const d = window.__app?.data || window.data;
    try { return d && d.nextChangeYear ? d.nextChangeYear(1856, 1) : 'no data api ('+Object.keys(window).filter(k=>/app|data|store/i.test(k)).join(',')+')'; } catch(e) { return 'err ' + e.message; }
  });
  log('data.nextChangeYear(1856,1) =', JSON.stringify(expect));

  // arrow nudge
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  log('after ArrowRight hash =', await page.evaluate(() => location.hash));
  await page.keyboard.press('Home');
  await page.waitForTimeout(400);
  log('after Home hash =', await page.evaluate(() => location.hash));
  await page.keyboard.press('End');
  await page.waitForTimeout(400);
  log('after End hash =', await page.evaluate(() => location.hash));
  await shot('end-year');

  // Space = play
  await page.keyboard.press('Home');
  await page.waitForTimeout(300);
  await page.keyboard.press('Space');
  await page.waitForTimeout(2500);
  log('after Space 2.5s hash =', await page.evaluate(() => location.hash));
  await shot('playing');
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  log('after pause hash =', await page.evaluate(() => location.hash));
  log('errors:', JSON.stringify(errs));
};
