/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const m = await page.evaluate(() => {
    const R = (sel) => { const n = document.querySelector(sel); if (!n) return null; const r = n.getBoundingClientRect(); return {top:Math.round(r.top),bot:Math.round(r.bottom),left:Math.round(r.left),w:Math.round(r.width),h:Math.round(r.height)}; };
    const bands = [...document.querySelectorAll('.tl-rate__band')].map(b=>({dir:b.dataset.dir, ...(()=>{const r=b.getBoundingClientRect();return{top:Math.round(r.top),bot:Math.round(r.bottom),left:Math.round(r.left),w:Math.round(r.width)};})()}));
    const bn = [...document.querySelectorAll('.tl-rate__band-n')].map(b=>{const r=b.getBoundingClientRect();return{t:b.textContent,top:Math.round(r.top),bot:Math.round(r.bottom),left:Math.round(r.left)};});
    const lbl = [...document.querySelectorAll('.tl-rate__lbl')].map(b=>{const r=b.getBoundingClientRect();return{t:b.textContent,dir:b.dataset.dir,top:Math.round(r.top),bot:Math.round(r.bottom),left:Math.round(r.left)};});
    return { tl:R('.tl'), deck:R('.tl__deck'), changes:R('.tl__changes'), body:R('.tl__body'), ax:R('.tl-ax'), rate:R('.tl-rate'), plot:R('.tl-rate__plot'), cap:R('.tl-rate__caption'), spine:R('.tl-spine'), map:R('#stage')||R('.map'), bands, bn, lbl };
  });
  log(JSON.stringify(m, null, 1));
};
