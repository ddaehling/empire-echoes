/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await shot('mobile-landing');
  const m = await page.evaluate(() => {
    const l = document.querySelector('.stage__legend'), n = document.querySelector('.stage__note');
    const b = document.querySelector('#legend-body');
    return {
      legend: l ? { rect: [Math.round(l.getBoundingClientRect().x),Math.round(l.getBoundingClientRect().y),Math.round(l.getBoundingClientRect().width),Math.round(l.getBoundingClientRect().height)], txt: l.innerText.replace(/\n+/g,' | ').slice(0,300) } : null,
      note: n ? { rect: [Math.round(n.getBoundingClientRect().x),Math.round(n.getBoundingClientRect().y),Math.round(n.getBoundingClientRect().width),Math.round(n.getBoundingClientRect().height)], txt: n.innerText.replace(/\n+/g,' | ').slice(0,400) } : null,
      bodyCh: b?b.clientHeight:null, bodySh: b?b.scrollHeight:null,
      stage: Math.round(document.querySelector('#stage').getBoundingClientRect().height),
    };
  });
  log(JSON.stringify(m,null,1));
  // expand legend on mobile
  const t = await page.$('.legend__toggle');
  if (t) { await t.click(); await page.waitForTimeout(700); await shot('mobile-expanded'); log('expanded:', (await page.evaluate(()=>document.querySelector('.stage__legend').innerText)).replace(/\n+/g,' | ').slice(0,400)); }
  // criticism on mobile
  const c = await page.$('.byline__crit');
  if (c) { await c.click(); await page.waitForTimeout(700); await shot('mobile-crit'); }
};
