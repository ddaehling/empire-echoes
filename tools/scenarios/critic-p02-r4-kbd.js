/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  // Tab until we land in the map listbox
  let found=null;
  for (let i=0;i<60;i++){
    await page.keyboard.press('Tab');
    const a = await page.evaluate(()=>{const e=document.activeElement; return {tag:e.tagName, cls:e.className, unit:e.dataset&&e.dataset.unit, label:(e.getAttribute&&e.getAttribute('aria-label')||'').slice(0,90)};});
    if (a.cls && /map__/.test(a.cls)) { found=a; log('tab#'+i, JSON.stringify(a)); break; }
    if (i<12) log('tab#'+i, JSON.stringify(a));
  }
  log('FOUND:', JSON.stringify(found));
  if (found) {
    const seen=[];
    for (let i=0;i<12;i++){ await page.keyboard.press('ArrowRight'); await page.waitForTimeout(120);
      seen.push(await page.evaluate(()=>{const e=document.activeElement;return (e.dataset&&e.dataset.unit)+' :: '+(e.getAttribute('aria-label')||'').slice(0,70);}));}
    log('ARROWS:', JSON.stringify(seen, null, 1));
    await shot('kbd-focus');
    await page.keyboard.press('Enter'); await page.waitForTimeout(1000);
    log('selected after Enter:', await page.evaluate(()=>window.BEA.store.getState().selectedTerritoryId));
    await shot('kbd-enter');
  }
  // can we reach a tiny unit by keyboard?
  const tinies = await page.evaluate(()=>[...document.querySelectorAll('.map__target.is-tiny')].length);
  log('tiny targets in DOM:', tinies, 'total:', await page.evaluate(()=>document.querySelectorAll('.map__target').length));
  const tabbable = await page.evaluate(()=>[...document.querySelectorAll('.map__target')].filter(t=>t.tabIndex===0).map(t=>t.dataset.unit));
  log('tabIndex=0 targets:', JSON.stringify(tabbable));
};
