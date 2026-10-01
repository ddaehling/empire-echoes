/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  const years = [1600,1655,1707,1757,1763,1783,1800,1815,1833,1858,1867,1882,1899,1901,1914,1919,1922,1931,1942,1947,1948,1956,1957,1960,1963,1965,1980,1997];
  let clipped = 0, total = 0, noMarker = 0;
  for (const y of years) {
    await page.evaluate((y) => window.BEA.store.dispatch('setYear', y), y);
    await page.waitForTimeout(120);
    const r = await page.evaluate(() => {
      const out = [];
      for (const n of document.querySelectorAll('.tl-chg:not([hidden]):not(.tl-chg--more)')) {
        const h = n.querySelector('.tl-chg__how');
        const s = n.querySelector('.tl-chg__seam');
        const rest = n.querySelector('.tl-chg__rest');
        if (h && !h.hidden) out.push({ how: h.scrollHeight > h.clientHeight + 2, marker: !rest.hidden });
        if (s && !s.hidden && s.scrollHeight > s.clientHeight + 2) out.push({ how: true, marker: !rest.hidden, seam: true });
      }
      return out;
    });
    for (const x of r) { total++; if (x.how) { clipped++; if (!x.marker) noMarker++; } }
  }
  log(`cards checked ${total}; visually clipped ${clipped}; clipped WITHOUT a "read the rest" marker ${noMarker}`);
};
