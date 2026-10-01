/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForSelector('.tl', { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.click('.tl-btn[aria-label="Forward one year"]');
  await page.waitForTimeout(600);
  await page.hover('.tl-lane[data-phase="atlantic"]');
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const p = document.querySelector('.tl');
    const api = p && p.__p03;
    const s = document.querySelector('.cx-lede__say');
    return {
      budget: api ? api.sayBudget() : null,
      shrink: api ? api.sayShrink : null,
      clientWidth: s && s.clientWidth, fs: s && getComputedStyle(s).fontSize,
      clientHeight: s && s.clientHeight, scrollHeight: s && s.scrollHeight,
      lineClamp: s && getComputedStyle(s).webkitLineClamp,
      text: s && s.textContent,
    };
  });
  log(JSON.stringify(r, null, 1));
};
