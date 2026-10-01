/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot set properties of null (setting 'scrollTop').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  // NAME THEM
  const btn = page.locator('#legend-body').getByText('NAME THEM').first();
  await page.evaluate(() => { const b=document.querySelector('#legend-body'); b.scrollTop = 0; });
  await btn.scrollIntoViewIfNeeded().catch(()=>{});
  await btn.click({ force: true });
  await page.waitForTimeout(900);
  await shot('name-them');
  log('AFTER NAME THEM legend:', (await page.evaluate(()=>document.querySelector('.stage__legend').innerText)).slice(0,900));
  log('statusbar:', await page.evaluate(()=>document.querySelector('.foot__slot')?.innerText||''));
  // painted?
  log('map units painted:', await page.evaluate(()=>document.querySelectorAll('.map svg path, #map svg path, svg path').length));
  // FOLD
  const fold = page.getByRole('button', { name: /fold/i }).first();
  await fold.click({force:true});
  await page.waitForTimeout(600);
  await shot('folded');
  log('FOLDED legend text:', await page.evaluate(()=>document.querySelector('.stage__legend').innerText));
  await fold.click({force:true}).catch(()=>{});
  await page.waitForTimeout(400);
  log('UNFOLDED ok:', (await page.evaluate(()=>document.querySelector('.stage__legend').innerText)).slice(0,120));
};
