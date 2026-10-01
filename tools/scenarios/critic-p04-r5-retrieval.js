/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  // dwell on claims: scroll slowly through
  for (let i = 0; i < 8; i++) { await page.evaluate(k => { document.getElementById('dossier').scrollTop = k*600; }, i); await page.waitForTimeout(900); }
  const led = await page.evaluate(() => window.BEA && window.BEA.dossierLedger ? window.BEA.dossierLedger.all() : 'NO LEDGER');
  log('ledger after dwell:', JSON.stringify(led).slice(0, 600));
  // leave and come back
  await page.evaluate(() => { location.hash = '#year=1913&sel=barbados'; });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { location.hash = '#year=1913&sel=kenya'; });
  await page.waitForTimeout(1500);
  const t = await page.evaluate(() => document.getElementById('dossier').innerText);
  const i = t.indexOf('You have read this entry already');
  log('retrieval block present:', i >= 0);
  if (i >= 0) log(t.slice(i - 100, i + 700).replace(/\n{2,}/g, '\n'));
  if (i >= 0) { await page.evaluate(() => { const e=[...document.querySelectorAll('#dossier *')].find(x=>x.textContent.includes('You have read this entry already')&&x.children.length===0); e&&e.scrollIntoView({block:'center'}); }); await page.waitForTimeout(300); await shot('retrieval', '#dossier'); }
};
