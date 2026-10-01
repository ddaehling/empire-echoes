/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: not run.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1400);
  await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(1200);
  log(JSON.stringify(await page.evaluate(() => {
    const hits = [];
    document.querySelectorAll('*').forEach(e => {
      const t = (e.childNodes.length && [...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('')) || '';
      if (/materials/i.test(t)) { const r = e.getBoundingClientRect();
        hits.push({ tag: e.tagName, cls: e.className+'', id: e.id, r: [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)], parent: e.parentElement && (e.parentElement.className+''), txt: t.trim().slice(0,60) }); }
    });
    return hits;
  }), null, 1));
};
