/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1830&sel=van-diemens-land', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  // commit false, then scroll to toll
  await page.getByRole('button', { name: /I think that is false/i }).first().click();
  await page.waitForTimeout(700);
  await shot('vdl-commit', '.app__dossier');
  // persistence: switch away and back
  await page.evaluate(() => window.BEA.store.act.select('kenya'));
  await page.waitForTimeout(600);
  await page.evaluate(() => window.BEA.store.act.select('van-diemens-land'));
  await page.waitForTimeout(900);
  const t = await page.evaluate(() => {
    const txt = document.querySelector('.app__dossier').innerText;
    const i = txt.indexOf('WHAT YOU SAID');
    const j = txt.indexOf('THINK, BEFORE YOU READ');
    return 'persisted=' + (i>=0) + ' | firstThinkIdx=' + j + '\n' + txt.slice(Math.max(0,Math.min(i<0?j:i,j<0?i:j)), 900);
  });
  log('PERSIST:\n' + t);
  await shot('vdl-return', '.app__dossier');
  // Words block
  const w = page.locator('.dsr__railbtn', { hasText: /^Words$/ }).first();
  if (await w.count()) { await w.click(); await page.waitForTimeout(600); await shot('words', '.app__dossier'); }
};
