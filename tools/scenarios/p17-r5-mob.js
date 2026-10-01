/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const r = await page.evaluate(() => {
    const rect = e => e ? (({x,y,width,height}) => ({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(e.getBoundingClientRect()) : null;
    const btn = document.querySelector('.legend__open');
    const b = btn && btn.getBoundingClientRect();
    const at = b ? document.elementFromPoint(b.x + b.width/2, b.y + b.height/2) : null;
    const chain = [];
    let n = at; while (n && chain.length < 6) { chain.push(n.tagName + '.' + (n.className||'').toString().slice(0,50)); n = n.parentElement; }
    const ov = document.querySelector('.app__overlay');
    const slot = document.querySelector('.stage__legend') || document.querySelector('[data-mount="legend"]');
    const cs = e => e ? (({position,zIndex,pointerEvents}) => ({position,zIndex,pointerEvents}))(getComputedStyle(e)) : null;
    return {
      legendBtn: rect(btn),
      elementAtCentre: chain,
      overlay: { rect: rect(ov), cs: cs(ov) },
      switchttl: { rect: rect(document.querySelector('.map__switchttl')), cs: cs(document.querySelector('.map__switchttl')) },
      slot: { cls: slot && slot.className, rect: rect(slot), cs: cs(slot) },
      stage: rect(document.querySelector('.app__stage')),
      legend: rect(document.querySelector('.legend')),
      byline: rect(document.querySelector('#legend-byline')),
      legendText: (document.querySelector('.legend')||{}).innerText,
      switchPanel: rect(document.querySelector('.map__switch') || document.querySelector('.map__switchttl')?.parentElement),
    };
  });
  log(JSON.stringify(r, null, 1));
  await shot('mobile');
};
