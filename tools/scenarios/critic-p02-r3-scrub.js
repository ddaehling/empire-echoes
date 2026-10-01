/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; const fails=[];
  page.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,220)); });
  page.on('pageerror', e=>errs.push('PAGEERROR '+e.message));
  page.on('requestfailed', r=>fails.push(r.url()));
  await page.goto('http://localhost:8777/app/#year=1600');
  await page.waitForTimeout(3200);
  const t0 = Date.now();
  for (let y=1600; y<=1997; y+=1) {
    await page.evaluate((y)=>{ location.hash = location.hash.replace(/year=\d+/, 'year='+y); }, y);
    if (y % 60 === 0) await page.waitForTimeout(30);
  }
  await page.waitForTimeout(2500);
  log('scrub 1600->1997 elapsed ms', Date.now()-t0);
  log('year now:', await page.evaluate(()=>location.hash));
  await shot('after-scrub');
  log('console errors:', JSON.stringify(errs.slice(0,10)));
  log('failed requests:', JSON.stringify(fails.slice(0,10)));
};
