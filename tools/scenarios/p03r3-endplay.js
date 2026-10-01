/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForSelector('.tl', { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.evaluate(() => { document.querySelector('.tl').__p03.hasSwept = true; location.hash = '#year=1997&filter=stage:working'; });
  await page.waitForTimeout(900);
  const r = await page.evaluate(async () => {
    const p = document.querySelector('.tl').__p03;
    const out = { bounds: p.bounds, before: { year: p.store.getState().year, want: p.wantYear, raf: p.yearRaf } };
    p.play(true);
    out.justAfter = { year: p.store.getState().year, want: p.wantYear, playing: p.store.getState().playing, raf: !!p.yearRaf };
    await new Promise(r => setTimeout(r, 1200));
    out.after1s = { year: p.store.getState().year, want: p.wantYear, playing: p.store.getState().playing, blocked: p.blocked };
    return out;
  });
  log(JSON.stringify(r, null, 1));
};
