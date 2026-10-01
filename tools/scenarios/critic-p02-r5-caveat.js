/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1866&sel=new-zealand', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  log('caveats:', await page.evaluate(()=>[...document.querySelectorAll('.map__caveat')].map(e=>{const r=e.getBoundingClientRect();return {vis:r.width>0&&r.height>0, y:Math.round(r.y), t:e.innerText.slice(0,400)}})).then(x=>JSON.stringify(x,null,1)));
  // expand "more"
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>/^more ↓/.test(b.innerText)); if(b)b.click();});
  await page.waitForTimeout(1200);
  log('after more, caveats:', await page.evaluate(()=>[...document.querySelectorAll('.map__caveat')].map(e=>{const r=e.getBoundingClientRect();return {vis:r.width>0&&r.height>0,y:Math.round(r.y),t:e.innerText.slice(0,500)}})).then(x=>JSON.stringify(x,null,1)));
  await shot('caveats');
  await shot('caveats-full');
};
