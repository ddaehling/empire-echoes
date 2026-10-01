/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.locator('button', { hasText: 'Stitching' }).first().click();
  await page.waitForTimeout(2000);
  const r = await page.evaluate(() => {
    const card = document.querySelector('.map__switch');
    const cs = getComputedStyle(card);
    return { text: card.innerText, overflow: cs.overflow + '/' + cs.overflowY, sh: card.scrollHeight, ch: card.clientHeight,
      rect: JSON.stringify(card.getBoundingClientRect()),
      ringed: [...document.querySelectorAll('.map__target')].filter(e=>/ring|stitch/.test(e.className)).length };
  });
  log(JSON.stringify(r, null, 1));
  await shot('card');
  // zoom into the Mediterranean-to-Asia chain
  await page.mouse.move(900, 380); await page.mouse.wheel(0, -600); await page.waitForTimeout(1500);
  await shot('stitch-zoom');
};
