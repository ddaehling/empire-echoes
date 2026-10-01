/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'focus').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1860');
  await page.waitForTimeout(3200);
  const r = await page.evaluate(()=>{
    const m=document.querySelector('.map__more'); if(!m) return 'missing';
    const b=m.getBoundingClientRect();
    const pts=[[b.x+b.width/2,b.y+b.height/2],[b.x+8,b.y+b.height/2],[b.x+b.width-8,b.y+b.height/2]];
    return { text:m.innerText, box:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)],
      hits: pts.map(p=>{const t=document.elementFromPoint(p[0],p[1]); return t?(t.className||t.tagName):'null';}) };
  });
  log('more button:', JSON.stringify(r));
  // keyboard reach?
  const kb = await page.evaluate(()=>{ const m=document.querySelector('.map__more'); m.focus(); return document.activeElement.className; });
  log('focus by script:', kb);
  await page.keyboard.press('Enter'); await page.waitForTimeout(700);
  log('after Enter, more text:', await page.evaluate(()=>document.querySelector('.map__more')?.innerText||'(gone)'));
  await shot('more-expanded');
};
