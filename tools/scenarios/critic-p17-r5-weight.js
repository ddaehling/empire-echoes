/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.keyboard.press('w'); await page.waitForTimeout(1600);
  const t = await page.evaluate(()=>document.body.innerText);
  log('MENTIONS metric names? ' + JSON.stringify({
    population: /population|people/i.test(t),
    trade: /trade|£|value/i.test(t),
    sizedBy: (t.match(/size[^.\n]{0,120}/gi)||[]).slice(0,6),
    quantity: (t.match(/[^.\n]{0,90}cited quantity[^.\n]{0,90}/gi)||[]).slice(0,6)
  },null,1));
  await shot('01-weight');
  // open key in weight mode
  const b = await page.evaluate(()=>{const e=document.querySelector('.byline__crit'); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await page.mouse.click(b.x,b.y); await page.waitForTimeout(1200);
  const k = await page.evaluate(()=>{let best=null;for(const e of document.querySelectorAll('div,section')){const s=(e.innerText||'');if(/^How to read this map/.test(s.trim())&&(!best||s.length<best.length))best=s;}return best||'none';});
  log('KEY IN WEIGHT (0-2500): '+k.replace(/\s+/g,' ').slice(0,2500));
  await shot('02-weight-key');
};
