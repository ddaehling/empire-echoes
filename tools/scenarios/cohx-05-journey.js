/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// The 15-minute journey. Land, scrub, click, read, switch, reload, back.
const R = async (page) => page.evaluate(() => { const s = window.BEA?.store?.getState?.()||{};
  const legendYear = (document.querySelector('.legend')||{}).innerText||'';
  return { year:s.year, def:(new URL(location.href)).hash, sel:s.selectedTerritoryId, layer:s.activeLayer,
    hash: location.hash,
    bigYear: (document.querySelector('.tl__year, .timeline__year, [class*=year]')||{}).innerText,
    legendHead: legendYear.split('\n').slice(0,4).join(' / '),
    dossierOpen: document.querySelector('.app')?.dataset.dossier };
});
module.exports = async ({ page, shot, log }) => {
  const ready = () => page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 }).catch(()=>{});
  await ready(); await page.waitForTimeout(1500);

  log('STEP 1 landed:', JSON.stringify(await R(page)));

  // 2. scrub back to 1783 by keyboard on the scrubber
  await page.keyboard.press('Home');
  await page.waitForTimeout(900);
  await shot('a-home-1200');
  log('STEP 2 Home:', JSON.stringify(await R(page)));
  const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g,' ').slice(0,1400));
  log('  body@1200:', t);

  // set to 1783 via URL-ish: use the scrubber input if present
  await page.evaluate(() => window.BEA.store.act.setYear(1783));
  await page.waitForTimeout(900);
  await shot('b-1783');
  log('STEP 3 1783:', JSON.stringify(await R(page)));

  // 4. click a territory: find India on the map
  const hit = await page.evaluate(() => {
    const els = [...document.querySelectorAll('[data-unit-id]')];
    const t = els.find(e => /india|bengal/i.test(e.getAttribute('data-unit-id')||''));
    if (!t) return null; const r = t.getBoundingClientRect();
    return { id: t.getAttribute('data-unit-id'), x: r.x + r.width/2, y: r.y + r.height/2, w:r.width,h:r.height };
  });
  log('  india hit:', JSON.stringify(hit));
  if (hit) { await page.mouse.click(hit.x, hit.y); await page.waitForTimeout(1200); }
  await shot('c-selected');
  log('STEP 4 selected:', JSON.stringify(await R(page)));
  log('  dossier text:', await page.evaluate(() => (document.querySelector('[data-mount=dossier]')||{}).innerText?.replace(/\s+/g,' ').slice(0,2500)));

  // 5. move the year past its end
  await page.evaluate(() => window.BEA.store.act.setYear(1990));
  await page.waitForTimeout(1200);
  await shot('d-1990-after-death');
  log('STEP 5 1990 w/ selection:', JSON.stringify(await R(page)));
  log('  dossier text:', await page.evaluate(() => (document.querySelector('[data-mount=dossier]')||{}).innerText?.replace(/\s+/g,' ').slice(0,1200)));

  // 6. definition switch
  await page.keyboard.press('4');
  await page.waitForTimeout(1000);
  await shot('e-def4');
  log('STEP 6 def4:', JSON.stringify(await R(page)));
  log('  legend says:', await page.evaluate(() => (document.querySelector('.legend')||{}).innerText?.replace(/\s+/g,' ').slice(0,700)));

  // 7. open full key
  const k = await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(b=>/full key/i.test(b.innerText)); if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
  if (k) { await page.mouse.click(k.x,k.y); await page.waitForTimeout(1200); }
  await shot('f-fullkey');
  log('STEP 7 full key open:', JSON.stringify(await R(page)));

  // 8. back
  await page.goBack(); await page.waitForTimeout(1200); await shot('g-back');
  log('STEP 8 back:', JSON.stringify(await R(page)));
};
