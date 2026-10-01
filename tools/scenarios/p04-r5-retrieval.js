/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 5 — acceptance test 6: does the record convert a second reading
 * into retrieval? Fresh load, dwell, leave, come back. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  const first = await page.evaluate(() => ({
    band: !!document.querySelector('.dsr__retrieval'),
    ledger: window.BEA.dossierLedger.size(),
  }));
  log('FIRST ARRIVAL (fresh load): ' + JSON.stringify(first));
  await page.waitForTimeout(2800);
  const dwelt = await page.evaluate(() => ({ ledger: window.BEA.dossierLedger.size(), band: !!document.querySelector('.dsr__retrieval') }));
  log('AFTER READING (same visit): ' + JSON.stringify(dwelt));
  await page.evaluate(() => document.querySelector('.dsr__close').click());
  await page.waitForTimeout(500);
  await page.evaluate(() => { location.hash = '#year=1765&sel=madras-presidency'; });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { location.hash = '#year=1765&sel=bengal-presidency'; });
  await page.waitForTimeout(1400);
  const back = await page.evaluate(() => {
    const r = document.querySelector('.dsr__retrieval');
    return { band: !!r, text: r ? r.innerText.replace(/\n+/g, ' | ').slice(0, 260) : null, ledger: window.BEA.dossierLedger.size() };
  });
  log('SECOND ARRIVAL: ' + JSON.stringify(back, null, 1));
  await page.evaluate(() => { const n = document.querySelector('.dsr__retrieval'); if (n) n.scrollIntoView(); });
  await page.waitForTimeout(300);
  await shot('retrieval-band');
};
