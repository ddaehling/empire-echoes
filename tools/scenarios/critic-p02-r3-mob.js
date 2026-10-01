/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3500);
  await shot('mobile-landing');
  const r = await page.evaluate(()=>{
    const p=document.querySelector('.map__plate'); const b=p?p.getBoundingClientRect():null;
    const opts=[...document.querySelectorAll('.map__targets [role="option"]')];
    const small = opts.filter(o=>{const q=o.getBoundingClientRect(); return q.width<40||q.height<40;}).length;
    return { plate: b&&{w:Math.round(b.width),h:Math.round(b.height)}, options: opts.length, under40: small,
      sizes: opts.slice(0,5).map(o=>{const q=o.getBoundingClientRect(); return Math.round(q.width)+'x'+Math.round(q.height);}) };
  });
  log(JSON.stringify(r));
  // tap a tiny unit
  const box = await page.evaluate(()=>{ const o=[...document.querySelectorAll('.map__targets [role="option"]')].find(e=>e.getAttribute('data-unit')==='gibraltar'); if(!o) return null; const b=o.getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2}; });
  log('gibraltar box', JSON.stringify(box));
  if (box) { await page.mouse.click(box.x, box.y); await page.waitForTimeout(900);
    log('sel:', await page.evaluate(()=>location.hash)); }
  await shot('mobile-after-tap');
  await page.keyboard.press('w'); await page.waitForTimeout(1400); await shot('mobile-weight');
  log('ERR', JSON.stringify(errs));
};
