/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  await page.evaluate(() => { location.hash = '#year=1930&sel=british-india'; });
  await page.waitForTimeout(1200);
  const t = await page.evaluate(() => {
    const h = document.querySelector('.app__dossier');
    const seal = h.querySelector('.dsr__seal');
    const nested = h.querySelector('[data-block=nested]');
    return { seal: seal && seal.dataset.seal, sealTitle: seal && seal.getAttribute('title'),
      nested: nested ? nested.innerText.slice(0,420) : 'NO NESTED BLOCK' };
  });
  log('BRITISH INDIA 1930: ' + JSON.stringify(t, null, 1));
  const painted = await page.evaluate(() => new Promise(res => {
    window.BEA.bus.on('ask:paintUnits', p => res({ n: p.unitIds.length, reason: p.reason }));
    const b = document.querySelector('[data-act=paint-children]'); if (!b) return res('NO BUTTON'); b.click();
    setTimeout(()=>res('no event'), 1500);
  }));
  log('paint-children -> ' + JSON.stringify(painted));
  await page.waitForTimeout(800);
  await shot('t11-painted');
  // seal at 1770 bengal (company)
  await page.evaluate(() => { location.hash = '#year=1770&sel=bengal-presidency'; });
  await page.waitForTimeout(900);
  const s = await page.evaluate(() => { const x = document.querySelector('.dsr__seal'); return x && {d:x.dataset.seal,t:x.getAttribute('title')}; });
  log('BENGAL 1770 seal: ' + JSON.stringify(s));
  await shot('seal-1770');
};
