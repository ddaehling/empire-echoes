/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  await page.evaluate(()=>{
    window.__ev = [];
    const b = [...document.querySelectorAll('.map__def')][1];
    for (const t of ['pointerdown','pointerup','click','mousedown','mouseup']) {
      b.addEventListener(t, e=>window.__ev.push('BTN:'+t+' target='+(e.target.className||e.target.tagName)));
      document.querySelector('.map').addEventListener(t, e=>window.__ev.push('MAP:'+t+' target='+(e.target.className||e.target.tagName)), true);
    }
  });
  const p = await page.evaluate(()=>{const b=[...document.querySelectorAll('.map__def')][1];const r=b.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};});
  await page.mouse.move(p.x,p.y); await page.mouse.down(); await page.waitForTimeout(50); await page.mouse.up();
  await page.waitForTimeout(500);
  log('EVENTS:', JSON.stringify(await page.evaluate(()=>window.__ev)));
};
