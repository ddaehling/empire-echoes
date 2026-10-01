/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const st = (page) => page.evaluate(() => {
  const by = document.querySelector('.byline');
  const leg = document.querySelector('.legend');
  const vis = e => { if(!e) return false; const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return r.width>4&&r.height>4&&s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>0.05; };
  return { byline: vis(by), bylineText:(by&&by.innerText||'').split('\n').slice(0,2).join(' / '),
    legend: vis(leg), hash: location.hash };
});
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  log('default', JSON.stringify(await st(page)));
  const routes = ['#panel=evidence','#panel=methods','#panel=historiography','#compare=1830,1914','#tour=1','#close=1','#panel=close','#quiz=1','#panel=mechanism','#plate=1'];
  for (const r of routes) {
    await page.evaluate(h => { location.hash = h; }, r);
    await page.waitForTimeout(1500);
    log(r, JSON.stringify(await st(page)));
  }
  // try a real tour entry via UI
  await page.evaluate(()=>{location.hash='#year=1900';}); await page.waitForTimeout(1200);
  const tourBtn = page.locator('button,a').filter({ hasText: /tour|guided|path|start/i });
  log('tour-ish controls:', (await tourBtn.allInnerTexts()).slice(0,10).join(' || '));
  await shot('end');
};
