/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1866&sel=new-zealand');
  await page.waitForTimeout(3500);
  const fold = await page.$('text=FOLD'); if (fold) { await fold.click(); await page.waitForTimeout(400); }
  const box = await page.evaluate(()=>{ const o=[...document.querySelectorAll('.map__targets [role="option"]')].find(e=>e.getAttribute('data-unit')==='new-zealand'); if(!o) return null; const b=o.getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2}; });
  log('nz box', JSON.stringify(box));
  if (box) { await page.mouse.move(box.x, box.y); await page.waitForTimeout(800);
    log('TIP:', await page.evaluate(()=>document.querySelector('.map__tip')?.innerText||'(none)')); }
  await shot('nz-1866');
  // and 1830 (before treaty)
  await page.goto('http://localhost:8777/app/#year=1830');
  await page.waitForTimeout(2600);
  const b2 = await page.evaluate(()=>{ const o=[...document.querySelectorAll('.map__targets [role="option"]')].find(e=>e.getAttribute('data-unit')==='new-zealand'); if(!o) return 'none'; const b=o.getBoundingClientRect(); return JSON.stringify({x:b.x,y:b.y}); });
  log('nz target 1830:', b2);
  // 1990
  await page.goto('http://localhost:8777/app/#year=1990'); await page.waitForTimeout(2600);
  await shot('y1990');
};
