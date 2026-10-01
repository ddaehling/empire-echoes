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
  await page.waitForTimeout(1200);
  // hunt for the poster entry point
  const found = await page.evaluate(() => {
    const els = [...document.querySelectorAll('button,a,[role="button"]')];
    return els.map(e=>({t:(e.innerText||'').trim().slice(0,90), c:e.className})).filter(x=>x.t);
  });
  log('CONTROLS: ' + JSON.stringify(found, null, 0).slice(0, 4000));
};
