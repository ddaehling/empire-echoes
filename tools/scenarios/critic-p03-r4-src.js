/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  for (const y of [1765, 1882, 1947, 1919, 1834]) {
    await page.evaluate(yy => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(600);
    const n = await page.evaluate(() => document.querySelectorAll('.tl-chg:not(.tl-chg--more)').length);
    for (let i = 0; i < Math.min(n, 4); i++) {
      await page.evaluate(k => document.querySelectorAll('.tl-chg:not(.tl-chg--more)')[k].click(), i);
      await page.waitForTimeout(450);
      const t = await page.evaluate(() => {
        const p = document.querySelector('.tl-open, .tl-rest, [class*="tl-"][class*="open"]');
        const body = document.body.innerText;
        const idx = body.lastIndexOf('Sources');
        return { head: (p?document.querySelector('.tl-chg[aria-expanded="true"]')?.innerText.split('\n').slice(0,3).join(' / '):'')||'', tail: idx>0 ? body.slice(idx, idx+400).replace(/\n/g,' | ') : 'NO SOURCES BLOCK' };
      });
      log(`${y} card${i}: ${t.tail}`);
    }
  }
};
