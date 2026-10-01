/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(6000);
  const r = await page.evaluate(() => {
    const a = document.querySelector('.dossier--empty');
    const kids = a ? [...a.children].map(c => ({tag:c.tagName, cls:(c.className||'').toString().slice(0,50), h:Math.round(c.getBoundingClientRect().height)})) : null;
    return { docH: document.documentElement.scrollHeight, kids, artH: a?Math.round(a.getBoundingClientRect().height):null,
      legendY: Math.round(document.querySelector('[data-mount="legend"]').getBoundingClientRect().y) };
  });
  log(JSON.stringify(r, null, 1));
};
