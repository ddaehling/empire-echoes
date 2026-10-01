/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.waitForFunction: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// Renders the geo build inspection page and screenshots each section.
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.body.dataset.ready === '1', { timeout: 120000 });
  log(await page.textContent('#status'));
  const secs = await page.$$('h2');
  await page.locator('.grid').first().scrollIntoViewIfNeeded();
  await shot('world', '.grid');
  const grids = await page.$$('.grid');
  for (let i = 1; i < grids.length; i++) {
    await grids[i].scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await shot('section-' + i, `.grid >> nth=${i}`);
  }
  log('sections: ' + secs.length + ', grids: ' + grids.length);
};
