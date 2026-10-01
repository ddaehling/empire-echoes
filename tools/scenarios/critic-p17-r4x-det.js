/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.locator('button', { hasText: 'Open the full key' }).first().click();
  await page.waitForTimeout(1400);
  await page.evaluate(()=>{ document.querySelectorAll('.app__overlay details').forEach(d=>d.open=true); });
  await page.waitForTimeout(900);
  const t = await page.locator('.app__overlay').innerText();
  const i = t.indexOf('WHY THESE COLOURS ARE GROUPED');
  log(t.slice(i, i+5200));
  await shot('details-open');
};
