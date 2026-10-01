/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=17', {waitUntil:'load'});
  await page.waitForTimeout(2200);
  const b = page.locator('button:has-text("Read them, with the four questions")').first();
  if (await b.count()) { await b.click(); await page.waitForTimeout(1400); }
  await shot('src');
  log(await page.evaluate(()=>{
    const e=document.querySelector('.app__dossier')||document.body; return e.innerText.slice(0,4000);
  }));
};
