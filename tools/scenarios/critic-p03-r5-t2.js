/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  // AT2: scrub to 1820
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(1500);
  await shot('y1820-full');
  const spine = await page.evaluate(() => {
    const s = document.querySelector('.tl-spine');
    return s ? s.innerText : 'NO SPINE';
  });
  log('SPINE @1820:', spine);
  const lit = await page.evaluate(() => Array.from(document.querySelectorAll('.tl-spine [class*="phase"], .tl-spine__track > *')).map(e => e.className + ' | aria=' + (e.getAttribute('aria-current')||'') + ' | lit=' + (e.dataset.lit||e.dataset.active||'') + ' | ' + e.innerText.replace(/\n/g,' ')));
  log('SPINE ROWS:', JSON.stringify(lit, null, 1));
  await shot('y1820-spine', '.tl-spine');
};
