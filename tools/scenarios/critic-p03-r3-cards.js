/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1858));
  await page.waitForTimeout(900);
  const more = await page.$('.tl-chg--more');
  log('more btn:', more ? await more.evaluate(n=>n.innerText) : 'none');
  if (more) { await more.click(); await page.waitForTimeout(900); await shot('allcards'); }
  log('cards after expand:', await page.evaluate(()=>document.querySelectorAll('.tl-chg').length));
  // click a change card
  const c = await page.$('.tl-chg');
  if (c) { await c.click(); await page.waitForTimeout(1000); await shot('cardclick');
    log('selected:', await page.evaluate(()=>window.BEA.store.getState().selectedTerritoryId));
    log('card html:', await c.evaluate(n=>n.outerHTML.slice(0,1500))); }
  // 1997 & 1947
  for (const y of [1947, 1997, 1783, 1834]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(800);
    await shot('y'+y);
    log(y+':', await page.evaluate(()=>{const e=document.querySelector('.tl'); return e?e.innerText.slice(0,900):'none';}));
  }
};
