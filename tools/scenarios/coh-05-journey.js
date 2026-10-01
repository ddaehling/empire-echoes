/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1000);
  const click = async (unit) => {
    const ok = await page.evaluate(u => { const e = document.querySelector('[data-unit="'+u+'"]'); if(!e) return false; e.scrollIntoView(); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2, y:r.y+r.height/2}; }, unit);
    if (!ok) { log('no target', unit); return; }
    await page.mouse.click(ok.x, ok.y);
  };
  await click('in-bengal-presidency');
  await page.waitForTimeout(1400);
  await shot('20-dossier-bengal');
  log('sel:', await page.evaluate(()=>BEA.store.getState().selectedTerritoryId));
  log('DOSSIER TEXT:\n' + (await page.evaluate(() => document.querySelector('[data-mount=dossier]')?.innerText||'NONE')).slice(0,4000));
  log('GEOM:', await page.evaluate(()=>{const p=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];};return JSON.stringify({stage:p('.app__stage'),dossier:p('.app__dossier'),frame:p('.map__frame'),legend:p('.stage__legend'),note:p('.stage__note')});}));

  // scrub past independence
  await page.evaluate(()=>BEA.store.act.setYear(1970));
  await page.waitForTimeout(1400);
  await shot('21-selection-after-independence');
  log('DOSSIER 1970:\n' + (await page.evaluate(() => document.querySelector('[data-mount=dossier]')?.innerText||'NONE')).slice(0,1800));

  // open full key
  await page.evaluate(()=>BEA.store.act.setYear(1913));
  await page.waitForTimeout(600);
  const openBtn = await page.$('.legend__open');
  if (openBtn) { await openBtn.click(); await page.waitForTimeout(1200); await shot('22-full-key'); }
  log('after open key GEOM:', await page.evaluate(()=>{const p=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];};return JSON.stringify({plate:p('.lplate'),colb:p('.lplate__col--b'),frame:p('.map__frame')});}));
  log('plate scroll:', await page.evaluate(()=>{const e=document.querySelector('.lplate__col--b');return e? e.clientHeight+' / '+e.scrollHeight : 'none';}));
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);

  // enlarge + mode key (P02 reported bug)
  await page.keyboard.press('e'); await page.waitForTimeout(900); await shot('23-enlarge');
  await page.keyboard.press('w'); await page.waitForTimeout(1100); await shot('24-enlarge-weight');
  log('byline rect in enlarge+weight:', await page.evaluate(()=>{const e=document.querySelector('.byline');const r=e?.getBoundingClientRect();return r?JSON.stringify([Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]):'none';}));
  await page.keyboard.press('w'); await page.keyboard.press('e'); await page.waitForTimeout(800);
};
