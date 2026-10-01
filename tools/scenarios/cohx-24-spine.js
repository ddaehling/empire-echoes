/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1400);
  const probe = () => page.evaluate(() => [...document.querySelectorAll('.tl-spine__band, [class*="spine"] button, [class*="spine__"]')]
    .filter(e => e.offsetParent && (e.innerText||'').trim())
    .map(e => ({ c:(typeof e.className==='string'?e.className:'').slice(0,44), t:(e.innerText||'').replace(/\s+/g,' ').slice(0,50), cw:e.clientWidth, sw:e.scrollWidth, ovf: e.scrollWidth>e.clientWidth+2 })));
  for (const y of [1900, 1990, 1700]) {
    await page.evaluate((yy)=>window.BEA.store.act.setYear(yy), y);
    await page.waitForTimeout(700);
    log('year', y, JSON.stringify(await probe()));
  }
  await page.evaluate(()=>window.BEA.store.act.setYear(1990));
  await page.waitForTimeout(400);
  const k = await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(b=>/full key/i.test(b.innerText)); if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
  if (k) await page.mouse.click(k.x,k.y);
  await page.waitForTimeout(1400);
  log('plate open 1990:', JSON.stringify(await probe()));
  await shot('spine-1990-plate');
};
