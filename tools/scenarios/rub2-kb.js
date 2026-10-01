/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=5', {waitUntil:'load'});
  await page.waitForTimeout(2200);
  // tab until a field cell is focused
  let hit=null;
  for(let i=0;i<80;i++){
    await page.keyboard.press('Tab');
    const f = await page.evaluate(()=>{const a=document.activeElement; return {c:(a.className||'').toString(), al:a.getAttribute('aria-label')||'', role:a.getAttribute('role')||''};});
    if(/tr-field__cell/.test(f.c)){ hit=f; break; }
  }
  log('reached field cell after tabbing: '+JSON.stringify(hit));
  if(hit){
    // arrow keys within grid?
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200);
    const f2 = await page.evaluate(()=>{const a=document.activeElement; return a.getAttribute('aria-label')||a.className;});
    log('after ArrowRight: '+f2);
    await page.keyboard.press('Enter'); await page.waitForTimeout(700);
    const dis = await page.locator('.tr-bar__next').isDisabled().catch(()=>true);
    log('next disabled after Enter: '+dis);
    await shot('kb-gate');
  }
};
