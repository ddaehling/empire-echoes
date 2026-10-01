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
  log(await page.evaluate(() => {
    const walk = (el, d) => {
      if (!el || d > 5) return [];
      const r = el.getBoundingClientRect();
      const a = [...el.attributes].filter(x => x.name !== 'style').map(x => x.name + '=' + x.value.slice(0,40)).join(' ');
      let out = ['  '.repeat(d) + el.tagName.toLowerCase() + ' [' + a + '] ' + Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.x) + ',' + Math.round(r.y) + '  "' + (el.children.length ? '' : (el.textContent||'').trim().slice(0,50)) + '"'];
      if (d < 5) [...el.children].forEach(c => { out = out.concat(walk(c, d + 1)); });
      return out;
    };
    return walk(document.querySelector('.app__lede'), 0).join('\n');
  }));
};
