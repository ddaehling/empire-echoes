/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1769&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const b = page.locator('.dsr__railbtn', { hasText: /^Disagree$/ }).first();
  log('disagree btn count', await page.locator('.dsr__railbtn', { hasText: /^Disagree$/ }).count());
  await b.click();
  await page.waitForTimeout(800);
  await shot('disagree', '.app__dossier');
  const t = await page.evaluate(() => {
    const txt = document.querySelector('.app__dossier').innerText;
    const i = txt.lastIndexOf('WHERE THE');const j=txt.search(/HISTORIANS DISAGREE|WHO DISAGREES|CONTESTED/i);
    return 'i='+i+' j='+j+'\n'+txt.slice(j<0?Math.max(0,txt.length-3000):j, (j<0?txt.length:j+2500));
  });
  log('DISAGREE BLOCK:\n' + t);
};
