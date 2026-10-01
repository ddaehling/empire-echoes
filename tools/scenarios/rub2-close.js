/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(900);
  for (let i = 0; i < 30; i++) {
    for (let k=0;k<4;k++){
      const next = page.locator('.tr-bar__next');
      if (!(await next.isDisabled().catch(()=>true))) break;
      const cands = ['.tr-field__cell', '.tr-choice', '.dsr__choice', '.qz-choice', '.tr-gate__decline'];
      let did=false;
      for (const c of cands){ const l = page.locator(c).first(); if (await l.count() && await l.isVisible().catch(()=>false)) { await l.click({timeout:1500}).catch(()=>{}); did=true; break; } }
      await page.waitForTimeout(350);
      if(!did) break;
    }
    const next = page.locator('.tr-bar__next');
    if (await next.isDisabled().catch(()=>true)) { log('STUCK', await page.locator('.tr-bar__count').innerText()); break; }
    await next.click({timeout:3000}).catch(()=>{});
    await page.waitForTimeout(400);
    const c = await page.locator('.tr-bar__count').innerText().catch(()=>'');
    if (/END/i.test(c)) { log('reached end at iteration', i); break; }
  }
  await shot('end-state');
  // find Finish
  const fin = page.locator('a:has-text("Finish here"), button:has-text("Finish here")').first();
  if (await fin.count()) { await fin.click(); await page.waitForTimeout(1500); }
  await shot('close');
  const t = await page.evaluate(()=>document.body.innerText);
  log('CLOSE TEXT:', t.slice(0, 6000));
};
