/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 7 — is chrome.css §D's P17 shim still load-bearing? Delete every
   rule in it at runtime and measure the strip again. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const before = await page.evaluate(() => {
    const r = document.querySelector('.legend--ribbon').getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y),
      display: getComputedStyle(document.querySelector('.legend--ribbon')).display };
  });
  const killed = await page.evaluate(() => {
    let n = 0; const hits = [];
    for (const ss of document.styleSheets) {
      if (!ss.href || !/chrome\.css/.test(ss.href)) continue;
      for (let i = ss.cssRules.length - 1; i >= 0; i--) {
        const rule = ss.cssRules[i];
        const txt = rule.cssText || '';
        if (/stage__key\s+\.legend|data-mount='legend'|data-mount="legend"|\.legend__colours|\.legend__chip/.test(txt)) {
          hits.push(txt.slice(0, 90)); ss.deleteRule(i); n++;
        }
      }
    }
    return { n, hits };
  });
  await page.evaluate(() => window.BEA.legend && window.BEA.legend.render && window.BEA.legend.render());
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => {
    const root = document.querySelector('.legend--ribbon');
    const r = root.getBoundingClientRect();
    const key = document.querySelector('.stage__key').getBoundingClientRect();
    const list = root.querySelector('.legend__ribbon-list');
    const ribs = [...root.querySelectorAll('.legend__rib')].filter(x => !x.hidden);
    const lb = list.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y),
      display: getComputedStyle(root).display,
      spill: Math.round(r.bottom - key.bottom), shown: ribs.length,
      half: ribs.filter(x => x.getBoundingClientRect().right > lb.right + 0.5).length,
      scrollH: document.documentElement.scrollHeight, vh: innerHeight };
  });
  log('rules deleted: ' + killed.n);
  killed.hits.forEach(h => log('  ' + h));
  log('before ' + JSON.stringify(before));
  log('after  ' + JSON.stringify(after));
  await shot('noshim');
  await shot('noshim-key', '.stage__key');
};
