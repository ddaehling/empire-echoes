/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const FIX = () => { const s=document.createElement('style'); s.textContent='.dsr__prose,.dsr__name{font-size:1rem !important;line-height:1.35 !important}'; document.head.append(s); };
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate(FIX);
  await page.evaluate(() => { location.hash = '#year=1948'; });
  await page.waitForTimeout(700);
  await shot('tl-1948', '.tl');
  log('aria announcement region:', await page.evaluate(() => {
    const l = [...document.querySelectorAll('[aria-live]')].map(n => n.getAttribute('aria-live') + ':' + n.innerText.slice(0,300));
    return l.join(' || ');
  }));
  // force an announce by pressing shift+right from 1947
  await page.evaluate(() => { location.hash = '#year=1947'; });
  await page.waitForTimeout(500);
  await page.click('.tl-ax__rail');
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(600);
  log('year', await page.evaluate(() => window.BEA.store.getState().year));
  log('live regions after jump:', await page.evaluate(() => [...document.querySelectorAll('[aria-live]')].map(n => n.innerText.slice(0,400)).filter(Boolean).join(' || ')));
  await page.evaluate(() => { location.hash = '#year=1942'; });
  await page.waitForTimeout(600);
  await shot('tl-1942', '.tl');
};
