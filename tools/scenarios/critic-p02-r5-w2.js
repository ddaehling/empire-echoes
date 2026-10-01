/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const S='.map__plate';
  await page.keyboard.press('w'); await page.waitForTimeout(1500);
  const t = await page.evaluate(()=>document.body.innerText);
  log('=== WEIGHT FULL TEXT ===', t.slice(0, 4000));
  await shot('weight-full');
  // find weight controls
  const ctrls = await page.evaluate(()=>[...document.querySelectorAll('button,[role=button],select,option')].map(b=>(b.innerText||b.value||'').trim()).filter(Boolean).slice(0,120));
  log('CONTROLS:', JSON.stringify(ctrls));
};
