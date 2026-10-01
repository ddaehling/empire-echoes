/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const { fixGrid } = require('./critic-p04-r4-lib.js');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500); await fixGrid(page, log);
  for (const [id,y] of [['british-india',1800],['british-india',1900],['kenya',1955],['bengal-presidency',1765],['jamaica',1700],['commonwealth-of-australia',1930]]) {
    await page.evaluate(([i,yy]) => { location.hash = `#year=${yy}&sel=${i}`; }, [id,y]);
    await page.waitForTimeout(700);
    const s = await page.evaluate(()=>{
      const m=document.querySelector('#dossier .dsr__seal');
      return m ? {html:m.innerHTML.slice(0,160), aria:m.getAttribute('aria-label')||m.getAttribute('title'), txt:m.textContent.trim()} : null;
    });
    log(`${id}@${y}:`, JSON.stringify(s));
  }
};
