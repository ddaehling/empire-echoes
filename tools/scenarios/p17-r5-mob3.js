/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const r = await page.evaluate(() => {
    const ov = document.querySelector('.app__overlay');
    const kids = ov ? [...ov.children].map(n => { const cs=getComputedStyle(n); const b=n.getBoundingClientRect();
      return { c: n.className, tag:n.tagName, pe: cs.pointerEvents, z: cs.zIndex, pos: cs.position, op: cs.opacity, vis: cs.visibility,
        r: [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)] }; }) : null;
    const can = ov ? [...ov.querySelectorAll('canvas')].map(n => { const cs=getComputedStyle(n); const b=n.getBoundingClientRect();
      return { c:n.className, pe:cs.pointerEvents, op:cs.opacity, vis:cs.visibility, z:cs.zIndex, parent:n.parentElement.className,
        r:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)] }; }) : null;
    return { kids, can, ovCs: ov ? (({pointerEvents,zIndex,position})=>({pointerEvents,zIndex,position}))(getComputedStyle(ov)) : null };
  });
  log(JSON.stringify(r, null, 1));
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(900);
  const r2 = await page.evaluate(() => {
    const c = document.querySelector('.lplate__close');
    const b = c.getBoundingClientRect();
    const n = document.elementFromPoint(b.x+b.width/2, b.y+b.height/2);
    return { close: [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)], hit: n ? n.tagName+'.'+n.className : null };
  });
  log('plate close: ' + JSON.stringify(r2));
  await shot('mob-plate');
};
