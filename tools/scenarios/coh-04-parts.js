/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1000);
  log('timeline parts:', await page.evaluate(() => {
    const t = document.querySelector('[data-mount=timeline]');
    const out = [];
    const walk = (el, d=0) => { for (const c of el.children) { const r = c.getBoundingClientRect(); if (r.height < 1) continue; out.push('  '.repeat(d) + (c.className||c.tagName) + ' :: y=' + Math.round(r.y) + ' h=' + Math.round(r.height) + ' w=' + Math.round(r.width)); if (d < 2) walk(c, d+1); } };
    walk(t); return out.join('\n');
  }));
  log('legend parts:', await page.evaluate(() => {
    const t = document.querySelector('[data-mount=legend]');
    const out = []; const walk = (el, d=0) => { for (const c of el.children) { const r = c.getBoundingClientRect(); if (r.height<1) continue; out.push('  '.repeat(d)+(c.className||c.tagName)+' :: y='+Math.round(r.y)+' h='+Math.round(r.height)+' w='+Math.round(r.width)); if (d<2) walk(c,d+1); } }; walk(t); return out.join('\n');
  }));
  log('note parts:', await page.evaluate(() => {
    const t = document.querySelector('[data-mount=stage-note]');
    const out = []; const walk = (el, d=0) => { for (const c of el.children) { const r = c.getBoundingClientRect(); if (r.height<1) continue; out.push('  '.repeat(d)+(c.className||c.tagName)+' :: y='+Math.round(r.y)+' h='+Math.round(r.height)+' w='+Math.round(r.width)); if (d<2) walk(c,d+1); } }; walk(t); return out.join('\n');
  }));
  log('map rail:', await page.evaluate(() => {
    const els = [...document.querySelectorAll('[data-mount=map] > *, [data-mount=map-overlay] > *')];
    return els.map(e => (e.className||e.tagName) + ' :: ' + JSON.stringify(e.getBoundingClientRect().toJSON())).join('\n');
  }));
};
