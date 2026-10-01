/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Keyboard: reach the index, open a section, read it, come back. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  const here = () => page.evaluate(() => {
    const a = document.activeElement;
    return a ? (a.tagName + '.' + String(a.className).slice(0, 40) + ' "' + (a.innerText || '').slice(0, 34).replace(/\n/g, ' ') + '"') : 'none';
  });
  await page.keyboard.press('d');
  log('after D: ' + await here());
  await page.evaluate(() => {
    const b = document.querySelector('[data-act="sheet"][data-sheet="evidence"]');
    b.focus();
  });
  log('on the index row: ' + await here());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  log('after Enter: ' + await here() + ' · sheet=' + await page.evaluate(() => document.querySelector('.app').dataset.sheet));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  log('after Escape: ' + await here() + ' · sheet=' + await page.evaluate(() => document.querySelector('.app').dataset.sheet));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  log('after a second Escape: ' + await here() + ' · dossier=' + await page.evaluate(() => document.querySelector('.app').dataset.dossier));
};
