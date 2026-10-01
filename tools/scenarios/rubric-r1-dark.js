/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await shot('cold');
  await page.click('.cx-cta'); await page.waitForTimeout(1200);
  await shot('beat1');
  for(let i=0;i<8;i++){
    await page.evaluate(()=>{const c=document.querySelector('.tr-field__cell'); if(c)c.click();});
    await page.waitForTimeout(250);
    await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled)n.click();});
    await page.waitForTimeout(550);
  }
  await shot('beat9');
  // matrix
  await page.goto('http://localhost:8777/app/',{waitUntil:'load'}); await page.waitForTimeout(2200);
  await page.evaluate(()=>{const b=document.querySelector('.mx-entry'); if(b)b.click();});
  await page.waitForTimeout(1600);
  await shot('matrix');
  const m = await page.evaluate(()=>{
    const t=document.querySelector('[class*=mx-]'); return t? t.innerText.replace(/\s+/g,' ').slice(0,1500):'no matrix';
  });
  log('MATRIX>>'+m);
};
