/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const rd = (page) => page.evaluate(()=>{ const l=document.querySelector('.legend'); const t=l&&l.innerText||'';
  return { hasColours: t.includes('COLOURS'), first: t.split('\n').filter(Boolean).slice(0,4).join(' | '), h: Math.round(l.getBoundingClientRect().height) }; });
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  log('start      ', JSON.stringify(await rd(page)));
  for (const k of ['2','1','3','1','4','1']) {
    await page.keyboard.press(k); await page.waitForTimeout(1400);
    log('after ' + k + '    ', JSON.stringify(await rd(page)));
  }
  await shot('cols');
};
