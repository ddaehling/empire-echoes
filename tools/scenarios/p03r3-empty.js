/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  for (const y of [1996, 1925, 1750]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(120);
    const t = await page.evaluate(() => {
      const tl = document.querySelector('.tl');
      const n = tl.querySelector('.tl__nothing');
      return { head: tl.querySelector('.tl__changehead').innerText.replace(/\n/g,' | '), nothing: n && !n.hidden ? n.innerText.replace(/\n/g,' | ') : null };
    });
    log(y + ' :: ' + JSON.stringify(t, null, 1));
  }
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1996));
  await page.waitForTimeout(150);
  await shot('empty-1996');
  const hits = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.tl-mark:not([hidden])')];
    let bad=0, small=0, gaps=[]; let prev=null;
    for (const b of btns) { const r=b.getBoundingClientRect();
      if (r.width<24||r.height<24) small++;
      const e=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
      if (!(e===b||b.contains(e))) bad++;
      if (prev!=null) gaps.push(+(r.left-prev).toFixed(1)); prev=r.right; }
    gaps.sort((a,b)=>a-b);
    return { n:btns.length, failHitTest:bad, underMin:small, minGap:gaps[0], medianGap:gaps[Math.floor(gaps.length/2)] };
  });
  log('marks: ' + JSON.stringify(hits));
};
