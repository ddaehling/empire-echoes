/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(()=>document.querySelector('.legend__titlerow button').click());
  await page.waitForTimeout(600);
  log('DOM collapsed:', await page.evaluate(()=>document.querySelector('.stage__legend').outerHTML.slice(0,900)));
  log('focusables:', await page.evaluate(()=>[...document.querySelectorAll('.stage__legend button,.stage__legend a,.stage__legend [tabindex]')].map(e=>e.tagName+':'+e.innerText.slice(0,30)).join(' | ')));
  // click the stub
  await page.click('.stage__legend', {force:true});
  await page.waitForTimeout(600);
  log('after clicking stub:', (await page.evaluate(()=>document.querySelector('.stage__legend').innerText)).replace(/\n+/g,' | ').slice(0,200));
  // keyboard L?
  for (const k of ['l','L','k','?']) { await page.keyboard.press(k); await page.waitForTimeout(400); }
  log('after keys:', (await page.evaluate(()=>document.querySelector('.stage__legend').innerText)).replace(/\n+/g,' | ').slice(0,200));
  await shot('stub');
};
