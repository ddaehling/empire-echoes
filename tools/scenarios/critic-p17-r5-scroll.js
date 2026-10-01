/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — TypeError: Cannot read properties of null (reading 'x').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const b = await page.evaluate(() => {
    const m = [...document.querySelectorAll('button,a')].find(e=>/open the full key/i.test(e.innerText));
    if(!m) return null; const r=m.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
  });
  await page.mouse.click(b.x,b.y); await page.waitForTimeout(1000);
  await page.mouse.move(300, 600);
  for (let i=0;i<6;i++){ await page.mouse.wheel(0, 700); await page.waitForTimeout(400); await shot('scroll-'+i); }
  const t = await page.evaluate(() => {
    let best=null;
    for (const e of document.querySelectorAll('section,div,aside')) { const s=(e.innerText||''); if(/How to read this map/.test(s) && (!best||s.length<best.length) && s.length>2000) best=s; }
    return best||'none';
  });
  log('KEY FULL TEXT:\n' + t.slice(0, 12000));
};
