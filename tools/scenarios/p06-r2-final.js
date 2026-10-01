/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Final drive: the twelve named defects, plus the Amritsar testimony, on a phone. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.evaluate(() => { window.BEA.store.act.setYear(1919); window.BEA.store.act.select('british-india'); });
  await page.waitForTimeout(1200);
  const tg = await page.evaluate(() => {
    const t = document.body.innerText;
    const i = t.indexOf('Tagore');
    return i < 0 ? '(Tagore not on this panel)' : t.slice(Math.max(0, i - 200), i + 400).replace(/\s+/g, ' ');
  });
  log('TAGORE:', tg);
  await shot('india-1919');
};
