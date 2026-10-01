/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* AT5: a because-chip navigates to the claim it caused and restores the map
   where its evidence lives; Back returns exactly where you were — with the
   panel's own Back button AND with the browser's. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://localhost:8777/app/#year=1857&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  const before = await page.evaluate(() => ({ url: location.hash, view: window.BEA.store.getState().mapView }));
  log('BEFORE ' + JSON.stringify(before));

  const chip = await page.evaluate(() => {
    const c = document.querySelector('.dsr-chip[data-authored="yes"]');
    if (!c) return null;
    return { text: c.innerText.replace(/\s+/g, ' '), target: c.dataset.target, year: c.dataset.targetYear, section: c.dataset.section };
  });
  log('CHIP ' + JSON.stringify(chip));
  await page.evaluate(() => document.querySelector('.dsr-chip[data-authored="yes"]').click());
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => ({
    url: location.hash, view: window.BEA.store.getState().mapView,
    name: (document.querySelector('.dsr__name') || {}).textContent,
    scrollTop: document.querySelector('.app__dossier').scrollTop,
    crumb: (document.querySelector('.dsr__back') || {}).innerText,
  }));
  log('AFTER CHIP ' + JSON.stringify(after));
  await shot('after-chip');

  /* panel Back */
  await page.evaluate(() => document.querySelector('.dsr__back').click());
  await page.waitForTimeout(900);
  const back1 = await page.evaluate(() => ({
    url: location.hash, view: window.BEA.store.getState().mapView,
    name: (document.querySelector('.dsr__name') || {}).textContent,
    crumb: document.querySelector('.dsr__back') ? document.querySelector('.dsr__back').innerText : null,
  }));
  log('AFTER PANEL BACK ' + JSON.stringify(back1));
  await shot('after-panel-back');

  /* now the browser's Back */
  await page.evaluate(() => document.querySelector('.dsr-chip[data-authored="yes"]').click());
  await page.waitForTimeout(900);
  const mid = await page.evaluate(() => ({ url: location.hash, view: window.BEA.store.getState().mapView }));
  log('AFTER CHIP 2 ' + JSON.stringify(mid));
  await page.goBack();
  await page.waitForTimeout(1200);
  const back2 = await page.evaluate(() => ({
    url: location.hash, view: window.BEA.store.getState().mapView,
    name: (document.querySelector('.dsr__name') || {}).textContent,
    crumb: document.querySelector('.dsr__back') ? document.querySelector('.dsr__back').innerText : null,
  }));
  log('AFTER BROWSER BACK ' + JSON.stringify(back2));
  await shot('after-browser-back');
  log('ERRORS ' + JSON.stringify(errs));
};
