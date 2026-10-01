/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const { fixGrid } = require('./critic-p04-r4-lib.js');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '#year=1765&sel=bengal-presidency'; });
  await page.waitForTimeout(1500);
  await fixGrid(page, log);

  // 1) commit to the true/false prediction
  const btn = page.locator('#dossier button', { hasText: 'I think that is true' }).first();
  log('predict button count:', await page.locator('#dossier button').count());
  if (await btn.count()) {
    await btn.scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
    await shot('before-commit');
    await btn.click(); await page.waitForTimeout(700);
    await shot('after-commit');
    const t = await page.evaluate(() => { const d=document.querySelector('#dossier').innerText; const i=d.indexOf('THINK, BEFORE YOU READ'); return d.slice(i, i+900).replace(/\n+/g,' | '); });
    log('after commit:', t);
  } else { log('!! no true/false predict button found'); }

  // 2) death-toll bracket prediction
  const b2 = page.locator('#dossier button', { hasText: 'hundreds of thousands' }).first();
  if (await b2.count()) {
    await b2.scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
    await b2.click(); await page.waitForTimeout(700);
    const t2 = await page.evaluate(() => { const d=document.querySelector('#dossier').innerText; const i=d.indexOf('THINK, BEFORE THE FIGURE'); return d.slice(i, i+1100).replace(/\n+/g,' | '); });
    log('bracket after commit:', t2);
    await shot('bracket-feedback');
  } else { log('!! no bracket button'); }
};
