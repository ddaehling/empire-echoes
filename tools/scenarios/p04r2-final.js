/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.evaluate(() => { location.hash = '#year=1913&sel=bengal-presidency'; });
  await page.waitForTimeout(1200);
  await shot('01-fold');
  await page.evaluate(() => { location.hash = '#year=1800&sel=saint-lucia'; });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const b=[...document.querySelectorAll('.dsr__railbtn')].find(n=>n.textContent==='Words'); if(b) b.click(); });
  await page.waitForTimeout(1100);
  await shot('02-words');
  await page.evaluate(() => { location.hash = '#year=1947&sel=british-india'; });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const b=[...document.querySelectorAll('.dsr__railbtn')].find(n=>n.textContent==='The ending'); if(b) b.click(); });
  await page.waitForTimeout(1200);
  await shot('03-chips');
  // provenance counters across the whole atlas
  const ids = await page.evaluate(() => window.BEA.data.territories.map(t => t.id));
  for (const id of ids) { await page.evaluate((i) => { location.hash = '#year=1913&sel=' + i; }, id); await page.waitForTimeout(22); }
  log('unsourced defects shown across all 260: ' + await page.evaluate(() => window.BEA.unsourcedCount()));
  log('class-level-only answers across all 260: ' + await page.evaluate(() => window.BEA.classOnlyCount()));
  // keyboard: escape closes; tab reaches the close button
  await page.evaluate(() => { location.hash = '#year=1913&sel=jamaica'; });
  await page.waitForTimeout(700);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  log('after Escape sel=' + await page.evaluate(() => window.BEA.store.getState().selectedTerritoryId));
  await page.evaluate(() => { location.hash = '#year=1913&sel=jamaica'; });
  await page.waitForTimeout(700);
  log('empty state after deselect renders: ' + await page.evaluate(() => {
    window.BEA.store.dispatch('deselect');
    return new Promise(r => setTimeout(() => r(document.querySelector('.app__dossier').textContent.replace(/\s+/g,' ').slice(0,90)), 300));
  }));
};
