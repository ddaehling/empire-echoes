/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 }).catch(()=>{});
  await page.waitForTimeout(1800);
  const t = await page.evaluate(() => {
    const walk = (el, d) => {
      const out = [];
      for (const c of el.children) {
        const r = c.getBoundingClientRect();
        out.push('  '.repeat(d) + '<' + c.tagName.toLowerCase() + ' class="' + (typeof c.className==='string'?c.className:'') + '"> ' +
          [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)].join(',') +
          ' sh=' + c.scrollHeight + ' ch=' + c.clientHeight + ' ov=' + getComputedStyle(c).overflow +
          ' :: ' + (c.innerText||'').replace(/\s+/g,' ').slice(0,80));
        if (d < 4) out.push(...walk(c, d+1));
      }
      return out;
    };
    const mo = document.querySelector('[data-mount="map-overlay"]');
    return walk(mo, 0).join('\n');
  });
  log('MAP-OVERLAY TREE:\n' + t);
  await shot('over', '[data-mount="map-overlay"]');
};
