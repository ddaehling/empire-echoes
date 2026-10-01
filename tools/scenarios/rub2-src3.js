/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1919&sel=punjab-province', {waitUntil:'load'});
  await page.waitForTimeout(2400);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/four questions/.test(x.innerText||'')); if(b) b.click(); });
  await page.waitForTimeout(1500);
  await shot('testimony');
  log(await page.evaluate(()=>{ const e=document.querySelector('.app__dossier')||document.body; return e.innerText.slice(0,5000); }));
};
