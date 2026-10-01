/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  const r = await page.evaluate(async () => {
    const { store, data } = window.BEA;
    const wait = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    let unsourcedAtEnd = 0, classAtEnd = 0, chips = 0, authored = 0, withArg = 0, gates = 0;
    const seen = new Set();
    for (const t of data.territories) {
      store.dispatch('setYear', t.acquiredYear || t.firstYear || 1900);
      store.dispatch('select', t.id); store.flush(); await wait();
      const root = document.querySelector('.dossier');
      if (!root) continue;
      chips += root.querySelectorAll('.dsr-chip').length;
      const a = root.querySelectorAll('.dsr-chip[data-authored="yes"]').length;
      authored += a;
      if (a) withArg++;
      if (root.querySelector('[data-ask="purpose"]')) gates++;
      for (const n of root.querySelectorAll('.src')) { void n; }
      seen.add(t.id);
    }
    unsourcedAtEnd = window.BEA.unsourcedCount();
    classAtEnd = window.BEA.classOnlyCount();
    return { n: seen.size, chips, authored, withArg, gates, unsourcedAtEnd, classAtEnd };
  });
  log(JSON.stringify(r, null, 1));
};
