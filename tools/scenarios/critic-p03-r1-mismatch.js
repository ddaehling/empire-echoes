/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  for (const y of [1945, 1948, 1918, 1947, 1874, 1942]) {
    await page.evaluate((yy) => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(500);
    const txt = await page.evaluate(() => document.querySelector('.tl__changes').innerText.replace(/\n+/g,' | '));
    const cnt = await page.evaluate(() => document.querySelector('.tl__count').innerText);
    log(y + ' :: count=' + cnt + ' :: changes=' + txt);
  }
  const deltas = await page.evaluate(() => {
    const d = window.BEA.data, tl = d.timeline();
    const out = [];
    for (const y of [1945,1948,1918,1947,1874,1942]) {
      const n = tl.unitsByYear[y-tl.min], p = tl.unitsByYear[y-1-tl.min];
      const a = d.acquisitions.filter(x=>x.year===y).length, dep = d.departures.filter(x=>x.year===y).length;
      out.push(`${y}: units ${p}->${n} (Δ${n-p}) ; acquisition records ${a}, departure records ${dep}`);
    }
    return out.join('\n');
  });
  log(deltas);
  await page.evaluate(() => { location.hash = '#year=1945'; });
  await page.waitForTimeout(400);
  await shot('tl-1945', '.tl');
};
