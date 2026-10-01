/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.scrollIntoViewIfNeeded: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1955&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const b = page.locator('.dsr__choice', { hasText: 'dozens' }).first();
  await b.scrollIntoViewIfNeeded();
  await b.click();
  await page.waitForTimeout(900);
  await shot('toll-after');
  const t = await page.evaluate(() => {
    const txt = document.querySelector('.app__dossier').innerText;
    const i = txt.indexOf('dozens');
    return txt.slice(Math.max(0,i-500), i + 2200);
  });
  log('TOLL:\n' + t);
  const el = await page.locator('.dsr__toll, [class*=toll]').first();
  try { await el.screenshot({ path: '/tmp/p04r3-toll/toll-el.png' }); log('toll el shot ok'); } catch(e){ log('no toll el', e.message); }
};
