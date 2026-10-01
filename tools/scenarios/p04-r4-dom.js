/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  const r = await page.evaluate(() => {
    const out = [];
    for (const n of document.querySelectorAll('.dsr__head > *, .dsr__meta > *, .dsr__fold .dsr__block > *')) {
      out.push({ c: n.className, hidden: n.hidden, budget: n.dataset.budget, t: (n.innerText || '').replace(/\s+/g,' ').slice(0, 90) });
    }
    return out;
  });
  log(JSON.stringify(r, null, 1));
};
