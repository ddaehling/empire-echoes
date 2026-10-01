/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(async () => {
    const { bus } = await import('/app/js/core/bus.js');
    bus.emit('ask:sizeBy', { metric: 'population' });
  });
  await page.waitForTimeout(2500);
  await shot('pop-weight');
  log(JSON.stringify(await page.evaluate(()=>({ w: document.querySelector('.map')?.dataset.weight, card: document.querySelector('.map__switch')?.innerText.slice(0,1400) })), null, 1));
  // zoom to India/Caribbean comparison
  await page.mouse.move(950, 380); await page.mouse.wheel(0, -400); await page.waitForTimeout(1500);
  await shot('pop-zoom');
};
