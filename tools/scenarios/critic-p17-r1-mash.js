/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[];
  page.on('pageerror', e=>errs.push(e.stack||String(e)));
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  for (let i=0;i<24;i++){ await page.keyboard.press(String(1+(i%4))); }
  await page.waitForTimeout(1500);
  log('after def mash errors: '+errs.length+'\n'+errs.slice(0,2).join('\n---\n').slice(0,2000));
  errs.length=0;
  for (let i=0;i<12;i++){ await page.keyboard.press('p'); await page.waitForTimeout(60); }
  await page.waitForTimeout(2000);
  log('after projection mash errors: '+errs.length+'\n'+errs.slice(0,2).join('\n---\n').slice(0,2000));
  await shot('after-mash');
  log('byline now: '+ await page.evaluate(()=>document.querySelector('#legend-byline').innerText.replace(/\n/g,' ').slice(0,200)));
};
