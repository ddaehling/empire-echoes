/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=17', {waitUntil:'load'});
  await page.waitForTimeout(2000);
  const st = await page.evaluate(()=>{const a=document.getElementById('app'); return {...a.dataset};});
  log('app dataset: '+JSON.stringify(st));
  // find any control that grows the sheet
  const ctl = await page.evaluate(()=>[...document.querySelectorAll('button,[role="button"]')].filter(e=>e.offsetParent).map(e=>((e.innerText||'')+'|'+(e.getAttribute('aria-label')||'')).replace(/\s+/g,' ').slice(0,60)));
  log(JSON.stringify(ctl,null,0));
  // try dragging the sheet handle up
  const head = page.locator('.cx-sheet__head, .cx-sheet').first();
  const b = await head.boundingBox();
  if (b) { await page.mouse.move(b.x+b.width/2, b.y+6); await page.mouse.down(); await page.mouse.move(b.x+b.width/2, 200, {steps:12}); await page.mouse.up(); await page.waitForTimeout(700); }
  await shot('dragged');
  const after = await page.evaluate(()=>{const e=document.querySelector('.tr-panel'); const b=e.getBoundingClientRect(); return {h:Math.round(b.height)};});
  log('after drag panel h '+JSON.stringify(after));
};
