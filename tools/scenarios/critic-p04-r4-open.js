/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  // dismiss any onboarding
  const keys = ['Escape'];
  for (const k of keys) { await page.keyboard.press(k); await page.waitForTimeout(200); }
  await shot('boot');
  log('URL:', page.url());
  // what territory ids exist?
  const ids = await page.evaluate(() => {
    const d = window.__app?.data || window.data || window.App?.data;
    if (!d) return { err: 'no data global', keys: Object.keys(window).filter(k=>/app|data|store/i.test(k)) };
    const t = d.territories || d.allTerritories || [];
    return { n: (t.length||0), sample: (t.slice?t.slice(0,25):[]).map(x=>x.id||x.slug) };
  });
  log('ids:', JSON.stringify(ids).slice(0,1200));
  log('body first 1200:', (await page.evaluate(() => document.body.innerText)).slice(0, 1200));
};
