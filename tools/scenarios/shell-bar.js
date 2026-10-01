/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  log(JSON.stringify(await page.evaluate(() => {
    const bar = document.querySelector('.app__bar').getBoundingClientRect();
    const kids = [...document.querySelectorAll('.app__bar *')].filter(e => e.children.length === 0 && e.textContent.trim())
      .map(e => { const r = e.getBoundingClientRect(); return { t: String(e.className).slice(0,24) || e.tagName, y: Math.round(r.top), h: Math.round(r.height), over: Math.round(Math.max(0, r.bottom - bar.bottom)) }; })
      .filter(k => k.over > 0 || k.h > bar.height);
    return { barH: Math.round(bar.height), spilling: kids };
  })));
  await shot('bar');
};
