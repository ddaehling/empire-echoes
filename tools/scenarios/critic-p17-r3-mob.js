/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('mobile-landing');
  const g = await page.evaluate(() => {
    const q = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { y: Math.round(b.y), h: Math.round(b.height), w: Math.round(b.width), sh: e.scrollHeight, ch: e.clientHeight, txt: (e.innerText||'').slice(0,400) }; };
    return { legend: q('.legend'), body: q('.legend__bodywrap'), byline: q('.byline'), vh: innerHeight };
  });
  log('MOBILE GEOM: ' + JSON.stringify(g, null, 1));
  // try to expand
  const t = page.locator('.legend__toggle');
  if (await t.count()) { log('toggle text: ' + await t.first().innerText()); await t.first().click(); await page.waitForTimeout(700); await shot('mobile-toggled'); 
    const g2 = await page.evaluate(() => { const e = document.querySelector('.legend'); const b=e.getBoundingClientRect(); const w=document.querySelector('.legend__bodywrap'); return { y:Math.round(b.y), h:Math.round(b.height), bw: w? {h:Math.round(w.getBoundingClientRect().height), sh:w.scrollHeight}:null }; });
    log('after toggle: ' + JSON.stringify(g2)); }
  const crit = page.locator('text=Three things wrong').first();
  if (await crit.count()) { await crit.click(); await page.waitForTimeout(700); await shot('mobile-crit'); }
};
