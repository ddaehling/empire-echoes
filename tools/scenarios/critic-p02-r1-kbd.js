/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3200);
  // tab until we reach the map
  const seq = [];
  for (let i=0;i<25;i++){
    await page.keyboard.press('Tab');
    const a = await page.evaluate(()=>{const e=document.activeElement; return (e.className||'')+'|'+(e.getAttribute&&(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40));});
    seq.push(a);
    if (/map__target|map__plate/.test(a)) break;
  }
  log('TAB SEQ:', JSON.stringify(seq));
  // focus the plate/listbox and arrow around
  await page.evaluate(()=>{const t=document.querySelector('.map__targets'); (t.querySelector('.map__target')||t).focus();});
  const before = await page.evaluate(()=>document.activeElement.dataset.unit);
  const moves=[];
  for (const k of ['ArrowRight','ArrowRight','ArrowDown','ArrowLeft']) {
    await page.keyboard.press(k); await page.waitForTimeout(350);
    moves.push(k+'->'+await page.evaluate(()=>document.activeElement.dataset.unit+'|'+(document.activeElement.getAttribute('aria-label')||'').slice(0,60)));
  }
  log('start unit', before); log('MOVES:', JSON.stringify(moves));
  await page.keyboard.press('Enter'); await page.waitForTimeout(700);
  log('after Enter hash', await page.evaluate(()=>location.hash));
  await shot('kbd-selected');
  // focus ring visible?
  const ring = await page.evaluate(()=>{const e=document.activeElement; const cs=getComputedStyle(e); return {outline:cs.outlineWidth+' '+cs.outlineColor+' '+cs.outlineStyle, bs:cs.boxShadow.slice(0,60)};});
  log('focus ring', JSON.stringify(ring));
};
