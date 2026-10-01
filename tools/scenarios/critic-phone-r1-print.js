/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(900);
  for (let i = 1; i <= 26; i++) {
    await page.waitForTimeout(150);
    const b = page.locator('.tr-bar__next').first();
    if (!(await b.count()) || !(await b.isVisible().catch(()=>false))) break;
    if (await b.isDisabled().catch(()=>true)) { const f=page.locator('.tr-field__cell'); if(await f.count()){await f.nth(4).click({force:true}).catch(()=>{});await page.waitForTimeout(200);} else break; }
    await b.click().catch(()=>{});
  }
  await page.waitForTimeout(1200);
  // find sign + print controls
  const ctl = await page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('.cx-sheet__body button, .cx-sheet__body a, .cx-sheet__body textarea, .cx-sheet__body input').forEach(e=>{
      const r=e.getBoundingClientRect();
      out.push(`${e.tagName}.${e.className.toString().slice(0,28)} "${(e.innerText||e.placeholder||'').trim().slice(0,45)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    });
    return out.join('\n');
  });
  log('close controls:\n' + ctl);
  // click Sign it
  const sign = page.locator('.cx-sheet__body button', { hasText: 'Sign it' }).first();
  if (await sign.count()) { await sign.scrollIntoViewIfNeeded().catch(()=>{}); await sign.click({force:true}); await page.waitForTimeout(900); await shot('signed'); log('signed panel: ' + await page.evaluate(()=>document.querySelector('.cx-sheet__body')?.innerText.slice(0,500))); }
  else log('NO SIGN CONTROL');
  // print
  let printed = false;
  page.on('dialog', d=>d.dismiss());
  await page.evaluate(()=>{ window.__p=0; const o=window.print; window.print=function(){window.__p++;}; });
  const pr = page.locator('.cx-sheet__body button', { hasText: 'Print my revision sheet' }).first();
  if (await pr.count()) { await pr.scrollIntoViewIfNeeded().catch(()=>{}); await pr.click({force:true}); await page.waitForTimeout(1500); printed = await page.evaluate(()=>window.__p); log('print() calls: ' + printed); await shot('print'); }
  else log('NO PRINT BUTTON');
};
