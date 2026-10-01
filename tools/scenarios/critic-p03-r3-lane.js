/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const lanes = await page.$$('.tl-lane');
  log('lanes:', lanes.length);
  for (let i=0;i<lanes.length;i++) log('lane'+i, (await lanes[i].evaluate(n=>n.outerHTML)).slice(0,300));
  await lanes[1].click();
  await page.waitForTimeout(800);
  await shot('lanepop');
  log('pop:', await page.evaluate(() => {
    const ps = [...document.querySelectorAll('[class*="pop"]')].filter(p=>!p.hidden);
    return ps.map(p=>({c:p.className, t:p.innerText.slice(0,2200)}));
  }));
};
