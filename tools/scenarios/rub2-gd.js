/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=5', {waitUntil:'load'});
  await page.waitForTimeout(2500);
  const h = await page.evaluate(() => {
    const p = document.querySelector('.fw, .forward, aside, .tr-forward, [class*="forward"]');
    const all = [...document.querySelectorAll('[class*="gate"],[class*="forward"],[class*="fw-"]')].map(e=>e.className).slice(0,40);
    return {classes: all};
  });
  log(JSON.stringify(h,null,1).slice(0,3000));
  const btns = await page.evaluate(()=>[...document.querySelectorAll('button,[role="radio"],input')].filter(b=>b.offsetParent).map(b=>({t:(b.textContent||'').trim().slice(0,40), c:b.className, r:b.getAttribute('role'), al:b.getAttribute('aria-label')})));
  log(JSON.stringify(btns).slice(0,6000));
};
