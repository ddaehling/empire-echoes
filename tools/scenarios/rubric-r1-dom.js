/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const d = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('button,a[href],[role=button],input,select').forEach(e=>{
      const r=e.getBoundingClientRect();
      out.push([e.tagName, (e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,70), e.className.toString().slice(0,50), Math.round(r.width)+'x'+Math.round(r.height)]);
    });
    return out;
  });
  log('CONTROLS n=' + d.length);
  d.forEach(x=>log(' | ' + x.join(' | ')));
};
