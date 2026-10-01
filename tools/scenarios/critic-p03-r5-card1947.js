/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  for (const y of [1947, 1945, 1968, 1778, 1815]) {
    await page.evaluate((yy) => { location.hash = '#year=' + (yy-1); }, y);
    await page.waitForTimeout(400);
    await page.locator('.tl-btn--play').click();
    for (let i=0;i<14;i++){ await page.waitForTimeout(400);
      const p = await page.evaluate(()=>document.querySelector('.tl-btn--play')?.getAttribute('data-playing'));
      if (p==='false') break; }
    const t = await page.evaluate(() => {
      const cands = Array.from(document.querySelectorAll('div,section,aside')).filter(e => /STOPPED HERE/.test(e.innerText||'') && e.innerText.length < 1400);
      return cands.length ? cands[cands.length-1].innerText : 'none';
    });
    log('=== ' + y + ' ===\n' + t + '\n');
  }
  await shot('final');
};
