/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  await page.waitForTimeout(900);
  log('map DOM sample:', await page.evaluate(() => {
    const m = document.querySelector('[data-mount=map]');
    const walk = (el, d=0) => { if (d>3) return ''; return [...el.children].slice(0,14).map(c => '  '.repeat(d) + '<' + c.tagName.toLowerCase() + [...c.attributes].map(a=>' '+a.name+'="'+String(a.value).slice(0,40)+'"').join('') + '>' + '\n' + walk(c, d+1)).join(''); };
    return walk(m);
  }));
  log('unit attr candidates:', await page.evaluate(() => {
    const s = new Set(); document.querySelectorAll('[data-mount=map] *').forEach(e => [...e.attributes].forEach(a => { if (a.name.startsWith('data-')) s.add(a.name); })); return [...s].join(', ');
  }));
  log('clickable unit count:', await page.evaluate(() => document.querySelectorAll('[data-mount=map] [data-id],[data-mount=map] [data-unit]').length));
};
