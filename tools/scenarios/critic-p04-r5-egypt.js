/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push('PE '+e.message));
  const grab = () => page.evaluate(()=>{
    const el=document.querySelector('.dossier');
    const t = el.innerText;
    const i = t.indexOf('LEGAL STATUS');
    return t.slice(i, i+420).replace(/\n+/g,' | ');
  });
  for (const y of [1881,1882,1914,1922,1956,1957]) {
    await page.goto('http://localhost:8777/app/#year='+y+'&sel=egypt', { waitUntil:'load' });
    await page.waitForTimeout(2600);
    log(y+': '+await grab());
  }
  log('ERRS',JSON.stringify(errs));
};
