/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate(()=>{location.hash='#year=1882';});
  await page.waitForTimeout(1000);
  const grab = () => page.evaluate(()=>({
    head: document.querySelector('.tl__changehead')?.innerText.replace(/\n/g,' · '),
    count: document.querySelector('.tl__count')?.textContent,
    def: document.querySelector('.tl')?.dataset.definition,
    ds: document.querySelector('.tl__defswitch')?.innerText,
    cards: Array.from(document.querySelectorAll('.tl__changes .tl-chg')).filter(e=>!e.hidden).map(e=>e.innerText.replace(/\n/g,' | ').slice(0,140)),
  }));
  log('1882 claimed:', JSON.stringify(await grab(), null, 1));
  await page.keyboard.press('4');
  await page.waitForTimeout(1200);
  await shot('def4');
  log('1882 influenced:', JSON.stringify(await grab(), null, 1));
  await page.keyboard.press('3');
  await page.waitForTimeout(1200);
  log('1882 controlled:', JSON.stringify(await grab(), null, 1));
  await shot('def3');
};
