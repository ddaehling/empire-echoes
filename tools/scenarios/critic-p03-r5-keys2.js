/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const yr = () => page.evaluate(() => document.querySelector('.tl__year')?.textContent);
  const focus = () => page.evaluate(() => document.activeElement.tagName + '.' + (document.activeElement.className||'') + ' [' + (document.activeElement.getAttribute('aria-label')||'') + ']');
  await page.evaluate(() => { location.hash = '#year=1856'; });
  await page.waitForTimeout(900);
  log('focus at start:', await focus());
  await page.mouse.click(700, 400); // click on map area maybe
  await page.waitForTimeout(400);
  log('after body click focus:', await focus(), 'year', await yr());
  for (const k of ['ArrowRight','ArrowRight','ArrowLeft']) {
    await page.keyboard.press(k); await page.waitForTimeout(400);
    log(k, '->', await yr(), 'focus', await focus());
  }
  // now focus the scrubber explicitly
  const sc = await page.evaluate(() => {
    const e = document.querySelector('.tl-ax, [role="slider"], input[type=range]');
    return e ? e.outerHTML.slice(0,400) : 'none';
  });
  log('SLIDER EL:', sc);
};
