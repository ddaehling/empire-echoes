/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** shellr3-css — does chrome.css parse as written? Lists every selector in it,
 *  flattened, and reports any rule whose selector contains prose (the round-3
 *  defect: a mis-closed comment turned seven lines of English into a selector). */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const sels = [];
    const walk = (list) => { for (const r of list) {
      if (r.selectorText != null) { sels.push(r.selectorText); continue; }
      if (r.cssRules) walk(r.cssRules);
    } };
    const out = {};
    for (const name of ['chrome.css', 'layout.css']) {
      const sh = [...document.styleSheets].find(s => (s.href || '').endsWith(name));
      sels.length = 0;
      if (sh) walk(sh.cssRules);
      out[name] = {
        rules: sels.length,
        prose: sels.filter(s => /[a-z] [a-z]{3,} [a-z]{3,}/i.test(s) && !/^[.#:\[a-z*]/.test(s.trim()[0] === '.' ? 'x' : s)).slice(0, 3),
        clbar: sels.filter(s => s.includes('cl-bar')),
        dock: sels.filter(s => s.includes('tr-dock')),
      };
    }
    return out;
  });
  log(JSON.stringify(r, null, 1));
};
