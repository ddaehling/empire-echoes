/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1600);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(1200);
  for (let i = 1; i <= 26; i++) {
    await page.waitForTimeout(300);
    for (let p=0;p<3;p++){
      const n = page.locator('.tr-bar__next').first();
      if (!(await n.count())) break;
      if (!(await n.isDisabled().catch(()=>true))) break;
      const f = page.locator('.tr-field__cell');
      if (await f.count()) { await f.nth(4).click({force:true}).catch(()=>{}); await page.waitForTimeout(300); continue; }
      break;
    }
    const n = page.locator('.tr-bar__next').first();
    if (!(await n.count()) || !(await n.isVisible().catch(()=>false))) { log('end reached at iter ' + i); break; }
    await n.click().catch(e=>log('click fail ' + e.message));
  }
  await page.waitForTimeout(1500);
  const b = page.locator('.cx-sheet__body').first();
  log('CLOSE scroll: ' + await b.evaluate(e => e.clientHeight + '/' + e.scrollHeight));
  const txt = await b.evaluate(e=>e.innerText);
  log('CLOSE len=' + txt.length + '\n' + txt);
  const H = await b.evaluate(e=>e.clientHeight), S = await b.evaluate(e=>e.scrollHeight);
  for (let i=0;i*H*0.9 < S; i++){
    await b.evaluate((e,y)=>e.scrollTop=y, i*H*0.9);
    await page.waitForTimeout(280);
    await shot('close'+String(i).padStart(2,'0'));
    if (i>28) break;
  }
};
