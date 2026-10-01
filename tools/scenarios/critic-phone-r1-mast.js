/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const s of [1,5,8,9,14,16,20,23]) {
    await page.goto(page.url().split('#')[0] + '#tour=thirty&step=' + s + '&filter=stage:working,pressure:off');
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => {
      const bar = document.querySelector('.app__bar');
      const ctl = [...bar.querySelectorAll('button,a')].filter(e=>e.getBoundingClientRect().height>2);
      return { n: ctl.length, names: ctl.map(e=>(e.innerText||e.getAttribute('aria-label')||'?').replace(/\s+/g,' ').trim().slice(0,18)).join(' | '), h: Math.round(bar.getBoundingClientRect().height) };
    });
    log(`step ${s}: ${m.n} controls, bar ${m.h}px :: ${m.names}`);
  }
};
