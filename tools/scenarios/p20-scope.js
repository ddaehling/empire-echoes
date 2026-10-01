/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(900);
  await page.goto(page.url().split('#')[0] + '#panel=workshop');
  await page.waitForTimeout(1600);
  const n = await page.evaluate(() => document.querySelectorAll(".tp-case:not(.tp-port__case)").length);
  log('cases on page: ' + n + ' (should be 6, once)');
  const hidden = await page.evaluate(() => [...document.querySelectorAll(".tp-case:not(.tp-port__case) .tp-case__reveal")].filter(r => r.hidden).length);
  log('hidden reveals before commit: ' + hidden);
  await page.evaluate(() => {
    const p = document.querySelector('.tp__pages'); const t = document.querySelector('.tp-cases');
    p.scrollTop += t.getBoundingClientRect().top - p.getBoundingClientRect().top - 120;
  });
  await page.waitForTimeout(300);
  await shot('scope-before');
  await page.evaluate(() => {
    document.querySelectorAll(".tp-case:not(.tp-port__case)").forEach((c, i) => c.querySelectorAll('.tp-vote')[i % 3].click());
  });
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({
    hidden: [...document.querySelectorAll(".tp-case:not(.tp-port__case) .tp-case__reveal")].filter(r => r.hidden).length,
    tally: document.querySelector('.tp-sorter__tally').textContent.slice(0, 140),
  }));
  log('AFTER ' + JSON.stringify(after));
  await shot('scope-after');
};
