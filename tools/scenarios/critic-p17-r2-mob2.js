/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.click('.byline__crit');
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => {
    const el = document.querySelector('#legend-byline');
    const st = document.querySelector('#stage');
    const cp = document.querySelector('#legend-criticism');
    return {
      bylineRect: [Math.round(el.getBoundingClientRect().y), Math.round(el.getBoundingClientRect().height)],
      stageRect: [Math.round(st.getBoundingClientRect().y), Math.round(st.getBoundingClientRect().height)],
      bylineOverflow: getComputedStyle(el).overflowY, sh: el.scrollHeight, ch: el.clientHeight,
      critText: cp ? cp.innerText.length : 0,
      noteOverflow: getComputedStyle(document.querySelector('.stage__note')).overflowY,
      noteSh: document.querySelector('.stage__note').scrollHeight, noteCh: document.querySelector('.stage__note').clientHeight,
    };
  });
  log(JSON.stringify(m,null,1));
  // try to scroll the byline
  await page.evaluate(()=>{ const e=document.querySelector('#legend-byline'); e.scrollTop=9999; const n=document.querySelector('.stage__note'); n.scrollTop=9999; });
  await page.waitForTimeout(400);
  await shot('mob-crit-scrolled');
  log('after scroll top:', await page.evaluate(()=>[document.querySelector('#legend-byline').scrollTop, document.querySelector('.stage__note').scrollTop]));
};
