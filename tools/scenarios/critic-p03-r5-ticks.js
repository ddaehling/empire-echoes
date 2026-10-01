/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const marks = await page.evaluate(()=>Array.from(document.querySelectorAll('.tl-mark')).slice(0,6).map(e=>({cls:e.className, aria:e.getAttribute('aria-label'), t:e.title, txt:e.innerText})));
  log('MARKS:', JSON.stringify(marks, null, 1));
  const ax = await page.evaluate(()=>{const a=document.querySelector('.tl-ax'); return {title:a.title, aria:a.getAttribute('aria-label'), txt:a.innerText.slice(0,400)};});
  log('AX:', JSON.stringify(ax, null, 1));
  // is there a key explaining the numbers/circles?
  const legend = await page.evaluate(()=>{const e=document.querySelector('.tl-ax__key, .tl__axkey, [class*="axkey"]'); return e?e.innerText:'NO AXIS KEY ELEMENT';});
  log('AXIS KEY:', legend);
  // hover a numbered tick
  const b = await page.evaluate(()=>{const m=document.querySelectorAll('.tl-mark')[3]; const r=m.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await page.mouse.move(b.x,b.y); await page.waitForTimeout(900);
  await shot('tick-hover');
  log('after hover, stage note:', await page.evaluate(()=>document.querySelector('.tl-ax__note, .statusbar, .stage-note')?.innerText.slice(0,400)||'none'));
};
