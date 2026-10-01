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
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const walk = (el, d) => {
      if (!el || d > 5) return [];
      const rect = el.getBoundingClientRect();
      const attrs = [...el.attributes].filter(a => a.name !== 'style' && a.name !== 'aria-label').map(a => a.name + '=' + a.value.slice(0,50)).join(' ');
      let out = ['  '.repeat(d) + el.tagName.toLowerCase() + ' [' + attrs + '] ' +
        Math.round(rect.width) + 'x' + Math.round(rect.height) + '@' + Math.round(rect.x) + ',' + Math.round(rect.y)];
      if (d < 5) [...el.children].forEach(c => { out = out.concat(walk(c, d + 1)); });
      return out;
    };
    return walk(document.querySelector('.app__time'), 0).join('\n');
  });
  log(r);
};
