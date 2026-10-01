/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const year = () => page.evaluate(() => {
    const m = document.querySelector('.time__slot').innerText.match(/\n(\d{3,4})\n/);
    return (window.__store && window.__store.getState) ? window.__store.getState().year : (m?m[1]:'?');
  });
  const yr = async () => page.evaluate(() => {
    const e = document.querySelector('[class*="year"]');
    return document.querySelector('.time__slot').innerText.split('\n').filter(s=>/^\d{4}$/.test(s.trim()))[0];
  });
  await page.evaluate(() => { location.hash = '#year=1856'; });
  await page.waitForTimeout(700);
  log('start year', await yr());
  // focus the scrubber
  const info = await page.evaluate(() => {
    const s = document.querySelector('[role="slider"], input[type=range]');
    return s ? {tag:s.tagName, role:s.getAttribute('role'), aria:{now:s.getAttribute('aria-valuenow'),min:s.getAttribute('aria-valuemin'),max:s.getAttribute('aria-valuemax'),text:s.getAttribute('aria-valuetext'),label:s.getAttribute('aria-label')}, tabindex:s.getAttribute('tabindex')} : null;
  });
  log('slider:', JSON.stringify(info));
  await page.evaluate(() => { const s=document.querySelector('[role="slider"], input[type=range]'); if(s) s.focus(); });
  log('focused:', await page.evaluate(()=>document.activeElement.outerHTML.slice(0,180)));
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(600);
  log('after Shift+Right from 1856:', await yr());
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  log('after Right:', await yr());
  await page.keyboard.press('Shift+ArrowLeft');
  await page.waitForTimeout(500);
  log('after Shift+Left:', await yr());
  await page.keyboard.press('Home');
  await page.waitForTimeout(400);
  log('after Home:', await yr());
  await page.keyboard.press('End');
  await page.waitForTimeout(400);
  log('after End:', await yr());
  // data check
  const d = await page.evaluate(async () => {
    const app = window.__app || window.app;
    return null;
  });
  await shot('after-keys');
};
