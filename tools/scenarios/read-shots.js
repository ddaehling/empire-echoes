/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=18', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(2200);
  await shot('reading');
  // keyboard: can the peek strip be reached and pressed?
  const kb = await page.evaluate(() => {
    const b = document.querySelector('.map__peek');
    if (!b) return 'no peek';
    b.focus();
    const ok = document.activeElement === b;
    return 'focusable=' + ok + ' name="' + (b.getAttribute('aria-label') || b.textContent).trim() + '" tab=' + b.tabIndex;
  });
  log('keyboard: ' + kb);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  log('after Enter: read=' + await page.evaluate(() => document.getElementById('app').dataset.read));
  await shot('after-enter');
  // gate
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.goto('http://localhost:8777/app/#tour=thirty&step=14', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  await shot('gate');
};
