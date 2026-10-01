/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1000);
  await page.keyboard.press('e');
  await page.waitForTimeout(2000);
  const r0 = await page.evaluate(() => { const p=document.querySelector('.byline'); const b=p&&p.getBoundingClientRect(); return {cls:p&&p.className, r:b&&{x:b.x,y:b.y,w:b.width,h:b.height}, disp:p&&getComputedStyle(p).display, vis:p&&getComputedStyle(p).visibility, op:p&&getComputedStyle(p).opacity}; });
  log('after E: ' + JSON.stringify(r0));
  await page.keyboard.press('p');
  await page.waitForTimeout(5000);
  const r1 = await page.evaluate(() => { const p=document.querySelector('.byline'); const b=p&&p.getBoundingClientRect(); return {r:b&&{x:b.x,y:b.y,w:b.width,h:b.height}, disp:p&&getComputedStyle(p).display, op:p&&getComputedStyle(p).opacity, z:p&&getComputedStyle(p).zIndex, pos:p&&getComputedStyle(p).position}; });
  log('after E then P: ' + JSON.stringify(r1));
  await shot('e-then-p');
  // does it clear on interaction?
  await page.mouse.click(700, 400);
  await page.waitForTimeout(2500);
  const r2 = await page.evaluate(() => { const p=document.querySelector('.byline'); const b=p&&p.getBoundingClientRect(); return {r:b&&{x:b.x,y:b.y,w:b.width,h:b.height}}; });
  log('after click: ' + JSON.stringify(r2));
  await shot('after-click');
  // resize/redraw?
  await page.setViewportSize({ width: 1441, height: 900 });
  await page.waitForTimeout(2000);
  const r3 = await page.evaluate(() => { const p=document.querySelector('.byline'); const b=p&&p.getBoundingClientRect(); return {r:b&&{x:b.x,y:b.y,w:b.width,h:b.height}}; });
  log('after resize: ' + JSON.stringify(r3));
  await shot('after-resize');
};
