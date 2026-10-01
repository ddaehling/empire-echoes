/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('landing');
  const t = await page.evaluate(() => document.body.innerText);
  log('BODY:', t.slice(0, 4000));
  // find legend root
  const info = await page.evaluate(() => {
    const out = {};
    const cand = document.querySelectorAll('[class*="legend"],[id*="legend"],[data-module="legend"]');
    out.count = cand.length;
    out.list = [...cand].slice(0,40).map(e => e.tagName + '.' + e.className + ' #' + e.id + ' [' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height) + ']');
    return out;
  });
  log('LEGEND NODES:', JSON.stringify(info, null, 1));
};
