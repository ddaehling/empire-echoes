/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('cold');
  log('title:', await page.title());
  log('url:', page.url());
  const txt = await page.evaluate(() => document.body.innerText);
  log('BODYTEXT>>>', txt.slice(0, 4000));
  // map measurement
  const m = await page.evaluate(() => {
    const sel = ['.stage__map', '#map', '.map', 'svg.map', '[data-map]'];
    const out = {};
    for (const s of sel) { const e = document.querySelector(s); if (e) { const r = e.getBoundingClientRect(); out[s] = [Math.round(r.width), Math.round(r.height), Math.round(r.top), Math.round(r.left)]; } }
    out.__vw = innerWidth; out.__vh = innerHeight;
    return out;
  });
  log('MAP>>>', JSON.stringify(m));
};
