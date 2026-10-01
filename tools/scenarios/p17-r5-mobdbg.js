/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  for (const t of [1500, 2800, 4200]) {
    await page.waitForTimeout(t === 1500 ? 1500 : 1400);
    const r = await page.evaluate(() => {
      const b = document.getElementById('legend-byline');
      if (!b) return { none: true };
      const cs = getComputedStyle(b); const rr = b.getBoundingClientRect();
      const kb = b.querySelector('.byline__key');
      const kr = kb && kb.getBoundingClientRect();
      const hit = kr && document.elementFromPoint(kr.x+kr.width/2, kr.y+kr.height/2);
      const hitEl = hit;
      const chain = []; let n = hitEl; while (n && chain.length<7) { const c=getComputedStyle(n); chain.push(n.tagName+'.'+n.className+' z'+c.zIndex+' pos'+c.position+' pe'+c.pointerEvents); n=n.parentElement; }
      return { pe: cs.pointerEvents, inlinePe: b.style.pointerEvents, chain, float: b.dataset.float, parent: b.parentElement.className, z: cs.zIndex, pos: cs.position,
        rect: [Math.round(rr.x),Math.round(rr.y),Math.round(rr.width),Math.round(rr.height)],
        hit: hit ? hit.tagName+'.'+hit.className : null,
        keyRect: kr ? [Math.round(kr.x),Math.round(kr.y),Math.round(kr.width),Math.round(kr.height)] : null };
    });
    log('t' + t + ' ' + JSON.stringify(r));
  }
};
