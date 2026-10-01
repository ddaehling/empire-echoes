/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const btns = await page.evaluate(()=>Array.from(document.querySelectorAll('button,[role=button]')).map(b=>(b.innerText||'').replace(/\s+/g,' ').slice(0,50)).filter(Boolean));
  log('ALL BUTTONS: ' + JSON.stringify(btns));
  // try layer hashes
  for (const h of ['#layer=tenure','#layer=mechanism','#layer=pressure','#layer=status']) {
    await page.goto('http://localhost:8777/app/'+h, {waitUntil:'load'});
    await page.waitForTimeout(2200);
    const t = await page.evaluate(()=>document.querySelector('.byline')?.innerText.replace(/\s+/g,' ').slice(0,300));
    log(h + ' :: ' + t);
  }
  // fold
  await page.goto('http://localhost:8777/app/', {waitUntil:'load'}); await page.waitForTimeout(2500);
  const f = page.getByRole('button',{name:/FOLD/i}).first();
  if (await f.count()) { await f.click(); await page.waitForTimeout(700); await shot('folded');
    log('AFTER FOLD legend: ' + await page.evaluate(()=>document.querySelector('.legend')?.innerText.replace(/\s+/g,' ').slice(0,300))); }
};
