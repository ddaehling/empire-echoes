/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  // empty state
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(900);
  const empty = await page.evaluate(() => { const h = document.querySelector('.app__dossier');
    return { open: document.querySelector('.app').dataset.dossier, text: h.innerText.slice(0,400), h: h.getBoundingClientRect().width }; });
  log('EMPTY STATE: ' + JSON.stringify(empty, null, 1));
  await shot('empty-state');
  // select then escape
  await page.evaluate(() => { location.hash = '#year=1913&sel=jamaica'; });
  await page.waitForTimeout(900);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  const esc = await page.evaluate(() => ({ hash: location.hash, open: document.querySelector('.app').dataset.dossier }));
  log('AFTER ESC: ' + JSON.stringify(esc));
  // close control?
  const close = await page.evaluate(() => [...document.querySelectorAll('.app__dossier button')].map(b=>b.className+':'+b.innerText.slice(0,20)).slice(0,6));
  log('buttons in dossier: ' + JSON.stringify(close));
  // reduced motion
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => { location.hash = '#year=1770&sel=bengal-presidency'; });
  await page.waitForTimeout(1000);
  await shot('reduced-motion-1770');
  const t = await page.evaluate(() => document.querySelector('.app__dossier').innerText.slice(0,900));
  log('BENGAL 1770 (famine year):\n' + t);
};
