/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  log('AT3 divergence >=1600:', await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03; const d = window.BEA.data;
    let diff = 0, n = 0, sample = [];
    for (let y = 1600; y < d.bounds.max; y++) {
      const a = p.nextChange(y, 1), b = d.nextChangeYear(y, 1);
      if (a == null && b == null) continue; n++;
      if (a !== b) { diff++; if (sample.length < 5) sample.push(`${y}: ours ${a}, cuts ${b}`); }
    }
    return JSON.stringify({ years: n, differ: diff, sample });
  }));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1899));
  await page.waitForTimeout(500);
  log('1899 cards:', await page.evaluate(() => [...document.querySelectorAll('.tl-chg:not([hidden]):not(.tl-chg--more)')].map(n => n.innerText.replace(/\n/g,' | ')).join('  ///  ').slice(0, 900)));
  const clipped = await page.evaluate(() => [...document.querySelectorAll('.tl-chg__how')].filter(e => e.offsetParent).map(e => ({ t: e.textContent.length, clipped: e.scrollHeight > e.clientHeight + 2 })));
  log('how fields, clipped?:', JSON.stringify(clipped));
  await shot('1899');
};
