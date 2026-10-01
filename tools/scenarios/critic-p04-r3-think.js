/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1955&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const btn = page.getByRole('button', { name: /I think that is true/i }).first();
  log('true-btn count:', await page.getByRole('button', { name: /I think that is true/i }).count());
  await btn.click();
  await page.waitForTimeout(900);
  await shot('after-commit', '.app__dossier');
  const t = await page.evaluate(() => {
    const el = document.querySelector('.app__dossier');
    const txt = el.innerText;
    const i = txt.indexOf('THINK');
    return txt.slice(i, i + 2200);
  });
  log('AFTER COMMIT:\n' + t);
  // ledger check
  const led = await page.evaluate(() => { try { return JSON.stringify(window.BEA.store.getState().ledger || null).slice(0,3000); } catch(e){ return 'ERR '+e.message; } });
  log('LEDGER:', led);
  log('LS keys:', await page.evaluate(() => Object.keys(localStorage).join(', ')));
};
