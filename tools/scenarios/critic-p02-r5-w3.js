/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const mapText = () => page.evaluate(()=>document.querySelector('.map').innerText);
  log('=== BASE MAP TEXT ===\n' + await mapText());
  await page.keyboard.press('w'); await page.waitForTimeout(1600);
  log('=== WEIGHT MAP TEXT ===\n' + await mapText());
  await shot('w', '.map');
  await page.keyboard.press('w'); await page.waitForTimeout(1000);
  await page.keyboard.press('s'); await page.waitForTimeout(1600);
  log('=== STITCHING MAP TEXT ===\n' + await mapText());
  await shot('stitch', '.map__plate');
  await page.keyboard.press('s'); await page.waitForTimeout(1000);
  await page.keyboard.press('h'); await page.waitForTimeout(1600);
  log('=== SILENCES MAP TEXT ===\n' + await mapText());
  await shot('silence', '.map__plate');
  // hidden dialog?
  const dlg = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>/Reload the atlas|Continue without it/.test(b.innerText)).map(b=>{const r=b.getBoundingClientRect();return {t:b.innerText,vis:r.width>0&&r.height>0, r:{x:r.x,y:r.y,w:r.width,h:r.height}, par:b.closest('[hidden],[aria-hidden=true]')?'HIDDEN-ANCESTOR':'shown'}}));
  log('DIALOG:', JSON.stringify(dlg));
};
