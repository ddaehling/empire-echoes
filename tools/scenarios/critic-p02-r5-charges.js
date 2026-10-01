/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1866&sel=new-zealand', {waitUntil:'load'});
  await page.waitForTimeout(3800);
  await shot('nz-full');
  log('NZ page text (map+dossier):', (await page.evaluate(()=>document.body.innerText)).slice(0,200));
  log('UNDRAWABLE?', await page.evaluate(()=>{
    const t=document.body.innerText;
    const i=t.search(/no line here|confiscat|undrawable|counted here instead/i);
    return i>=0? t.slice(Math.max(0,i-500), i+1200) : 'NOT FOUND';
  }));
};
