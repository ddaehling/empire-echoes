/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* TEST 6 in isolation: a fresh session, one entry, dwell, leave, return. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2400);
  const first = await page.evaluate(() => ({
    band: !!document.querySelector('.dsr__retrieval'),
    ledger: window.BEA.dossierLedger.size(),
    prompt: (document.querySelector('.cx-ask__q') || {}).innerText,
  }));
  await page.waitForTimeout(2600);
  const stamped = await page.evaluate(() => window.BEA.dossierLedger.size());
  await page.evaluate(() => { document.querySelector('.dsr__close').click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { location.hash = '#year=1765&sel=bengal-presidency'; });
  await page.waitForTimeout(1800);
  const second = await page.evaluate(() => {
    const r = document.querySelector('.dsr__retrieval');
    return { band: !!r, text: r ? r.innerText.replace(/\s+/g, ' ').slice(0, 110) : null, ledger: window.BEA.dossierLedger.size() };
  });
  log('first: ' + JSON.stringify(first));
  log('after dwell: ledger=' + stamped);
  log('second: ' + JSON.stringify(second));
  log('TEST6 -> ' + (!first.band && stamped > 0 && second.band ? 'PASS' : 'FAIL'));
};
