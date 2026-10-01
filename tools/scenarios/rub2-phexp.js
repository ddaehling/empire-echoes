/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=17', {waitUntil:'load'});
  await page.waitForTimeout(2000);
  const before = await page.evaluate(()=>{const e=document.querySelector('.tr-panel'); const b=e.getBoundingClientRect(); return {h:Math.round(b.height), sh:e.scrollHeight};});
  log('panel before '+JSON.stringify(before));
  const more = page.locator('.tr-panel__more, button:has-text("MORE OF THIS BEAT"), button:has-text("more of this beat")').first();
  if (await more.count()) { await more.click(); await page.waitForTimeout(900); }
  await shot('after-more');
  const after = await page.evaluate(()=>{const e=document.querySelector('.tr-panel'); const b=e.getBoundingClientRect(); return {h:Math.round(b.height), sh:e.scrollHeight, top:Math.round(b.y), scroll:Math.round(e.scrollTop)};});
  log('panel after '+JSON.stringify(after));
  // scroll the panel fully and shot
  await page.locator('.tr-panel').first().evaluate(el=>el.scrollBy(0, 400));
  await page.waitForTimeout(500); await shot('scrolled');
  await page.locator('.tr-panel').first().evaluate(el=>el.scrollBy(0, 400));
  await page.waitForTimeout(500); await shot('scrolled2');
};
