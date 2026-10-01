/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1500);
  log(JSON.stringify(await page.evaluate(() => {
    const R = e => { const r=e.getBoundingClientRect(); return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]; };
    const dump = (sel) => [...document.querySelectorAll(sel)].map(e => ({ c:(typeof e.className==='string'?e.className:''), r:R(e), bg:getComputedStyle(e).backgroundColor, bd:getComputedStyle(e).borderTopWidth+' '+getComputedStyle(e).borderTopColor, t:(e.innerText||'').replace(/\s+/g,' ').slice(0,20)}));
    return { furniture: dump('.map__furniture'), controls: dump('.map__controls'), modes: dump('.map__modes'), zooms: dump('.map__zooms'), zoomkids: dump('.map__zooms > *') };
  }), null, 1));
};
