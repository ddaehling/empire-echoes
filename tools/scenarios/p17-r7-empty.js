/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  for (const [y, d] of [[1500, '1'], [1300, '3'], [1997, '3'], [2020, '1']]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.keyboard.press(d);
    await page.waitForTimeout(500);
    log(JSON.stringify(await page.evaluate((yy) => {
      const root = document.querySelector('.legend--ribbon');
      const list = root.querySelector('.legend__ribbon-list');
      const lb = list.getBoundingClientRect();
      const shown = [...list.querySelectorAll('.legend__rib')].filter(n => !n.hidden);
      return { year: yy, tier: root.dataset.tier || null, fit: root.dataset.fit,
        shown: shown.length, text: root.innerText.replace(/\s+/g, ' ').trim().slice(0, 160),
        overflow: Math.round(list.scrollWidth - list.clientWidth),
        half: shown.filter(n => n.getBoundingClientRect().right > lb.right + 0.5).length };
    }, y)));
  }
  await shot('empty');
};
