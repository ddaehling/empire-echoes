/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'children').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1800);
  log(JSON.stringify(await page.evaluate(() => {
    const h = document.querySelector('.tl__changehead');
    return [...h.children].map(c => { const r=c.getBoundingClientRect(); const cs=getComputedStyle(c);
      return {c:c.className, hidden:c.hidden, y:Math.round(r.y), h:Math.round(r.height), disp:cs.display, fs:cs.fontSize, t:(c.innerText||'').replace(/\s+/g,' ').slice(0,40)}; });
  }), null, 1));
};
