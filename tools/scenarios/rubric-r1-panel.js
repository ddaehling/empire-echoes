/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const s = process.env.STEP||'17';
  await page.goto('http://localhost:8777/app/#tour=thirty&step='+s, {waitUntil:'load'});
  await page.waitForTimeout(2500);
  const txt = await page.evaluate(()=>{
    const p = document.querySelector('.cx-sheet, .tr-beat, aside[class*=beat], [class*=beatpanel]') ||
      [...document.querySelectorAll('*')].filter(e=>/MORE OF THIS BEAT/.test(e.innerText||'')).pop();
    return p ? p.innerText : document.body.innerText;
  });
  log('FULL>>>\n' + txt.slice(0, 9000));
};
