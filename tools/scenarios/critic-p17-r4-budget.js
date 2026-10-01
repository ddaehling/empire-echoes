/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const st = () => { const leg=document.querySelector('.stage__legend'); const lr=leg.getBoundingClientRect();
  const stage=document.querySelector('.app__stage').getBoundingClientRect();
  const time=document.querySelector('.app__time');
  return {stageH:Math.round(stage.height), timeH: time?Math.round(time.getBoundingClientRect().height):null,
    legendH:Math.round(lr.height), colours:/COLOURS/.test(leg.innerText)}; };
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  log('base ' + JSON.stringify(await page.evaluate(st)));
  await page.keyboard.press('2'); await page.waitForTimeout(1500);
  log('after2 ' + JSON.stringify(await page.evaluate(st)));
  await page.keyboard.press('1'); await page.waitForTimeout(1500);
  log('after1 ' + JSON.stringify(await page.evaluate(st)));
  await page.waitForTimeout(9000);
  log('after wait 9s ' + JSON.stringify(await page.evaluate(st)));
  await shot('budget');
};
