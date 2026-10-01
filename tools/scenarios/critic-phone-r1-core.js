/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Element is not visible.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(1200);
  const go = page.locator('.tr-routes__go').first();
  if (await go.count()) { await go.scrollIntoViewIfNeeded().catch(()=>{}); await go.click({force:true}); log('took the short route'); }
  else log('NO short-route offer');
  await page.waitForTimeout(1500);
  log('hash: ' + page.url().split('#')[1]);
  let chars = 0, n = 0;
  for (let i = 1; i <= 30; i++) {
    await page.waitForTimeout(250);
    for (let p=0;p<3;p++){
      const b = page.locator('.tr-bar__next').first();
      if (!(await b.count()) || !(await b.isDisabled().catch(()=>true))) break;
      const f = page.locator('.tr-field__cell');
      if (await f.count()) { await f.nth(4).click({force:true}).catch(()=>{}); await page.waitForTimeout(250); continue; }
      break;
    }
    const info = await page.evaluate(()=>({
      step:(document.querySelector('.tr-bar__count')||{}).innerText?.replace(/\s+/g,'')||'?',
      title:(document.querySelector('.cx-sheet__title')||{}).innerText?.trim()||'',
      c:(document.querySelector('.cx-sheet__body')||{}).innerText?.length||0 }));
    chars += info.c; n++;
    log(`  ${info.step} "${info.title}" ${info.c} chars`);
    const b = page.locator('.tr-bar__next').first();
    if (!(await b.count()) || !(await b.isVisible().catch(()=>false))) { log('END'); break; }
    await b.click().catch(()=>{});
  }
  await page.waitForTimeout(1000);
  const end = await page.evaluate(()=>document.querySelector('.cx-sheet__body')?.innerText.slice(0,400));
  log('END PANEL: ' + end);
  log(`TOTAL ${n} steps, ${chars} chars ≈ ${Math.round(chars/5.5)} words ≈ ${(chars/5.5/200).toFixed(1)} min pure reading at 200wpm`);
  await shot('core-end');
};
