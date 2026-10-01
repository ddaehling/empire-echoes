/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  // projection
  await page.keyboard.press('p'); await page.waitForTimeout(1400); await shot('proj');
  log('proj btn: '+await page.evaluate(()=>{const b=document.querySelector('.map__proj'); return b? b.getAttribute('aria-label'):'none';}));
  await page.keyboard.press('p'); await page.waitForTimeout(900);
  // weight = people
  await page.keyboard.press('w'); await page.waitForTimeout(1400); await shot('weight');
  await page.keyboard.press('w'); await page.waitForTimeout(700);
  // silences
  await page.goto('http://localhost:8777/app/#year=1955',{waitUntil:'load'}); await page.waitForTimeout(2200);
  await page.keyboard.press('h'); await page.waitForTimeout(1400); await shot('silences');
  const sil = await page.evaluate(()=>{const b=document.querySelector('.map__silence'); return b? b.getAttribute('aria-label'):'none';});
  log('silence: '+sil);
  // what this leaves out
  await page.evaluate(()=>{const b=document.querySelector('.map__sheetlink'); if(b)b.click();});
  await page.waitForTimeout(1400); await shot('leaves-out');
  log('LEAVESOUT>>'+await page.evaluate(()=>{const s=document.querySelector('.cx-sheet'); return s? s.innerText.replace(/\s+/g,' ').slice(0,2200):'none';}));
};
