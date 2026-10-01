/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const led = [];
  await page.waitForTimeout(2400);
  await page.evaluate(() => { window.__led = []; window.BEA.bus.on('ledger:append', p => window.__led.push(p)); });
  await page.evaluate(() => { location.hash = '#year=1913&sel=bengal-presidency'; });
  await page.waitForTimeout(1200);
  const chips = await page.evaluate(() => [...document.querySelectorAll('.dsr-chip')].map(c => ({
    txt: c.innerText.replace(/\n/g,' / '), target: c.dataset.target, ty: c.dataset.targetYear,
    title: c.getAttribute('title'), aria: c.getAttribute('aria-label'), tag: c.tagName })));
  log('CHIPS on bengal@1913 (' + chips.length + '):\n' + JSON.stringify(chips, null, 1));
  const st0 = await page.evaluate(() => ({ ...window.BEA.store.getState(), }) );
  log('state before: sel=' + st0.selectedTerritoryId + ' year=' + st0.year + ' hash=' + await page.evaluate(()=>location.hash));
  // click first chip via JS (it may be offscreen)
  const clicked = await page.evaluate(() => { const c = document.querySelector('.dsr-chip'); if(!c) return null;
    const t = c.innerText; c.click(); return t; });
  await page.waitForTimeout(900);
  const st1 = await page.evaluate(() => { const s = window.BEA.store.getState();
    return { sel: s.selectedTerritoryId, year: s.year, hash: location.hash,
      back: !!document.querySelector('[data-act=back]'),
      backTxt: (document.querySelector('[data-act=back]')||{}).innerText,
      name: (document.querySelector('.dsr__name,.app__dossier h2')||{}).innerText }; });
  log('clicked chip: ' + JSON.stringify(clicked) + '\nafter: ' + JSON.stringify(st1));
  await shot('after-chip');
  // back
  const b = await page.evaluate(() => { const n = document.querySelector('[data-act=back]'); if(!n) return 'NO BACK CONTROL'; n.click(); return 'clicked'; });
  await page.waitForTimeout(800);
  const st2 = await page.evaluate(() => { const s = window.BEA.store.getState(); return { sel: s.selectedTerritoryId, year: s.year, hash: location.hash }; });
  log('back: ' + b + ' -> ' + JSON.stringify(st2));
  const l = await page.evaluate(() => window.__led.slice(0, 30));
  log('LEDGER entries (' + (await page.evaluate(()=>window.__led.length)) + '): ' + JSON.stringify(l).slice(0, 1200));
};
