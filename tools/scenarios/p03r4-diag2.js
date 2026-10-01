/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1882));
  await page.waitForTimeout(500);
  log(await page.evaluate(() => {
    const out = [];
    const cw = document.documentElement.clientWidth;
    for (const e of document.querySelectorAll('*')) {
      const r = e.getBoundingClientRect();
      if (r.right > cw + 2 && r.width > 0) out.push(e.tagName + '.' + (e.className && e.className.baseVal !== undefined ? e.className.baseVal : String(e.className||'')).slice(0,50) + ' w=' + Math.round(r.width) + ' right=' + Math.round(r.right));
      if (out.length > 25) break;
    }
    return JSON.stringify(out, null, 1);
  }));
  log('heights:', await page.evaluate(() => {
    const h = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().height) : null; };
    return JSON.stringify({ tl: h('.tl'), deck: h('.tl__deck'), body: h('.tl__body'), changes: h('.tl__changes'), track: h('.tl__track'), ax: h('.tl-ax'), spine: h('.tl-spine'), caption: h('.tl-spine__caption'), foot: h('.tl-spine__foot') });
  }));
};
