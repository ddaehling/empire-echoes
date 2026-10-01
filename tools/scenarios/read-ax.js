/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=18', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1600);
  log(await page.evaluate(() => {
    const walk = (el, d) => {
      if (!el || d > 4) return [];
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const cls = (el.className && el.className.baseVal !== undefined) ? el.className.baseVal : el.className;
      let out = ['  '.repeat(d) + el.tagName.toLowerCase() + '.' + cls + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.y) + ' h=' + cs.height + ' mb=' + cs.marginBottom + ' mt=' + cs.marginTop + ' pos=' + cs.position];
      if (d < 4) [...el.children].forEach(c => { out = out.concat(walk(c, d + 1)); });
      return out;
    };
    return walk(document.querySelector('.app__time'), 0).join('\n');
  }));
};
