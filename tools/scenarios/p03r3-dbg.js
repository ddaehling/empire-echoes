/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  await page.evaluate(() => {
    const tl = document.querySelector('.tl').__p03;
    window.__k = 0; window.__back = [];
    document.querySelector('.tl-ax__rail').addEventListener('keydown', () => { window.__k++; }, true);
    let last = window.BEA.store.getState().year;
    window.BEA.store.subscribe((s) => { if (s.year < last) window.__back.push([last, s.year, window.BEA.store.history().slice(-4)]); last = s.year; });
    window.BEA.store.dispatch('setYear', 1600);
  });
  await page.waitForTimeout(200);
  await page.focus('.tl-ax__rail');
  for (let i = 0; i < 397; i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  log(JSON.stringify(await page.evaluate(() => ({ keys: window.__k, year: window.BEA.store.getState().year, want: document.querySelector('.tl').__p03.wantYear, backs: window.__back.slice(0, 6), nBack: window.__back.length })), null, 1));
};
