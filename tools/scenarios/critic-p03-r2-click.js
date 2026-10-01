/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1858'; });
  await page.waitForTimeout(800);
  // click a phase lane
  const lane = await page.$('.tl-lane');
  await lane.click(); await page.waitForTimeout(600);
  await shot('lane-pop');
  log('pop:', await page.evaluate(()=>{const p=document.querySelector('.tl-pop,[class*="pop"]'); return p&&!p.hidden?p.innerText.slice(0,700):'(hidden/none)';}));
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  // click a change chip
  const chg = await page.$('.tl-chg');
  await chg.click(); await page.waitForTimeout(900);
  await shot('chg-click');
  log('hash after chip click: ' + await page.evaluate(()=>location.hash));
  log('dossier?', await page.evaluate(()=>{const d=document.querySelector('[class*="dossier"]'); return d?d.innerText.slice(0,300):'(none)';}));
  // click a mark
  await page.evaluate(() => { location.hash = '#year=1858'; });
  await page.waitForTimeout(600);
  const mk = await page.$('.tl-mark');
  if (mk) { await mk.click({force:true}); await page.waitForTimeout(600); await shot('mark-pop');
    log('mark pop:', await page.evaluate(()=>{const p=document.querySelector('.tl-pop'); return p&&!p.hidden?p.innerText.slice(0,600):'(hidden)';})); }
};
