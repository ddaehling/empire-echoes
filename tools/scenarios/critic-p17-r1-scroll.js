/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const d = await page.evaluate(() => ({
    docH: document.documentElement.scrollHeight, bodyH: document.body.scrollHeight,
    scrollY: window.scrollY, appOverflow: getComputedStyle(document.querySelector('.app')||document.body).overflow,
    stage: (()=>{const e=document.querySelector('.stage'); if(!e) return null; const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return {h:Math.round(r.height), y:Math.round(r.y), disp:cs.display, pos:cs.position, overflow:cs.overflow, gtr:cs.gridTemplateRows, gtc:cs.gridTemplateColumns};})(),
  }));
  log('DOC: ' + JSON.stringify(d));
  await page.evaluate(() => window.scrollTo(0, 99999));
  await page.waitForTimeout(400);
  log('after scroll y=' + await page.evaluate(()=>window.scrollY));
  await shot('scrolled-bottom');
  const r = await page.evaluate(()=>{const e=document.querySelector('[data-mount="legend"]'); const b=e.getBoundingClientRect(); return {y:Math.round(b.y), x:Math.round(b.x)};});
  log('legend rect after scroll: ' + JSON.stringify(r));
};
