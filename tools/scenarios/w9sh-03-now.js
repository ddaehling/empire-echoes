/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const M = () => {
  const rr = e => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
  const dump = (sel) => { const el = document.querySelector(sel); if (!el) return null;
    return { self: rr(el), kids: [...el.children].map(c => ({ c: (c.className||c.tagName)+'', r: rr(c), t: (c.textContent||'').trim().slice(0,50) })) }; };
  return { now: dump('.tl__now'), key: dump('.tl__key'), ax: dump('.tl-ax'), spine: dump('.tl-spine'),
           deckCS: (()=>{const d=getComputedStyle(document.querySelector('.tl__deck'));return {gap:d.rowGap, jc:d.justifyContent};})() };
};
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.BEA.store.dispatch('setPlaying', false));
  for (const level of ['plate', 'working', 'apparatus']) {
    await page.evaluate(l => window.BEA.bus.emit('ask:stage', { level: l }), level);
    await page.waitForTimeout(1000);
    log('--- ' + level + ' --- ' + JSON.stringify(await page.evaluate(M)));
  }
};
