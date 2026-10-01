/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate(()=>{location.hash='#year=1765';});
  await page.waitForTimeout(1000);
  await shot('y1765');
  log('ROW:', await page.evaluate(()=>document.querySelector('.tl__changes')?.innerText.slice(0,2000)));
  // click "the rest of this account"
  const link = await page.$('text=the rest of this account');
  if (link) { await link.click(); await page.waitForTimeout(1400); await shot('after-rest'); 
    log('URL:', page.url());
    log('DOSSIER:', await page.evaluate(()=>document.querySelector('.dossier, [class*="dossier"]')?.innerText.slice(0,700) || 'none'));
  } else log('no rest link');
};
