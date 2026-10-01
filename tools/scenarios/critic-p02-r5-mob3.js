/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — touchscreen.tap: hasTouch must be enabled on the browser context before using the touchscr.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3200);
  await shot('m0');
  log('buttons in howto:', await page.evaluate(()=>[...document.querySelectorAll('.legend button, .byline button, [class*=howto] button')].map(b=>b.innerText.trim()).join(' | ')));
  // try folding via any FOLD/close
  const f = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>/FOLD|Fold|close|Hide/i.test(b.innerText)); if(b){b.click();return b.innerText}return null;});
  log('folded via', f);
  await page.waitForTimeout(1200); await shot('m1');
  log('plate now', await page.evaluate(()=>{const r=document.querySelector('.map__plate').getBoundingClientRect();return JSON.stringify({w:Math.round(r.width),h:Math.round(r.height),y:Math.round(r.y)})}));
  // tap map centre
  const c = await page.evaluate(()=>{const r=document.querySelector('.map__plate').getBoundingClientRect();return{x:r.x+r.width*0.55,y:r.y+r.height*0.45}});
  await page.touchscreen.tap(c.x,c.y); await page.waitForTimeout(1500);
  log('hash after tap', await page.evaluate(()=>location.hash));
  await shot('m2');
};
