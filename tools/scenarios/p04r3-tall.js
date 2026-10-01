/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const out = await page.evaluate(async () => {
    const store = window.BEA.store;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const cases = [['curacao', 1808], ['papua', 1930], ['occupied-syria-lebanon', 1919], ['us-virgin-islands', 1802], ['egypt', 1913], ['british-india', 1913], ['senegambia-province', 1759]];
    const res = [];
    for (const [id, y] of cases) {
      store.batch((d) => { d('setYear', y); d('select', id); });
      await sleep(30);
      const host = document.querySelector('.app__dossier');
      const art = document.querySelector('.dossier');
      if (!art) { res.push({ id, y, none: true }); continue; }
      const hb = host.getBoundingClientRect();
      const rows = [];
      for (const n of art.querySelectorAll('.dsr__head > *, .dsr__fold > *, .dsr__fold p, .dsr__fold h3')) {
        const b = n.getBoundingClientRect();
        if (b.height > 0) rows.push([n.className.replace(/dsr__/g, ''), Math.round(b.height), (n.innerText || '').replace(/\s+/g, ' ').slice(0, 54)]);
      }
      const fold = art.querySelector('.dsr__fold');
      res.push({ id, y, hostH: Math.round(hb.height), over: Math.round(fold.getBoundingClientRect().bottom - hb.bottom), rows });
    }
    return res;
  });
  for (const r of out) log(JSON.stringify(r, null, 1));
};
