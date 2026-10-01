/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await shot('mob-landing');
  const p = await page.evaluate(() => { const c=document.querySelector('.map__plate'); const b=c.getBoundingClientRect(); return {w:Math.round(b.width),h:Math.round(b.height),x:Math.round(b.x),y:Math.round(b.y), targets:document.querySelectorAll('.map__target').length}; });
  log('plate: ' + JSON.stringify(p));
  // tap a unit
  const el = await page.$('[data-unit="in-bengal-presidency"], [data-unit^="in-"]');
  if (el) { const b = await el.boundingBox(); if (b) { await page.mouse.click(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(1500);} }
  await shot('mob-after-tap');
  log('hash: ' + await page.evaluate(()=>location.hash));
  log('TEXT:\n' + (await page.evaluate(()=>document.body.innerText)).slice(0,1200));
  // pinch/zoom buttons present?
  log('controls: ' + await page.evaluate(()=>[...document.querySelectorAll('.map__mode,.map__def,.map__zoom')].map(e=>e.getAttribute('aria-label')||e.innerText).join(' | ')));
};
