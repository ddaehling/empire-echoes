/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.scrollIntoViewIfNeeded: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// Specimen sheet inspection for the design system.
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(900);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  log('title:', await page.title());
  log('fonts loaded:', await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight + ' ' + f.style).join(' | ')));
  log('status cards:', await page.locator('#status-grid .swatch-card').count());
  log('plate shapes:', await page.locator('#plate-shapes g').count());

  await shot('01-top');
  await page.locator('.plate-frame').scrollIntoViewIfNeeded();
  await shot('02-plate', '.plate-frame');
  await page.locator('#status-grid').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await shot('03-statuses', '#status-grid');
  await page.locator('#type-scale').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await shot('04-type', '#type-scale');
  await page.evaluate(() => document.querySelectorAll('section')[2].scrollIntoView());
  await page.waitForTimeout(150);
  await shot('05-ink');
  await page.evaluate(() => document.querySelectorAll('section')[3].scrollIntoView());
  await page.waitForTimeout(150);
  await shot('06-controls');
  await page.evaluate(() => document.querySelectorAll('section')[4].scrollIntoView());
  await page.waitForTimeout(150);
  await shot('07-space');
  await page.locator('.dossier-grid').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await shot('07b-dossier', '.dossier-grid');

  // deuteranopia over the plate
  await page.locator('[data-cvd="deutan"]').click();
  await page.locator('.plate-frame').scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await shot('08-plate-deutan', '.plate-frame');
  await page.locator('[data-cvd="tritan"]').click();
  await page.waitForTimeout(250);
  await shot('09-plate-tritan', '.plate-frame');
  await page.locator('[data-cvd="normal"]').click();

  // the lamplit theme
  await page.goto(page.url().split('#')[0] + '#theme=lamplit');
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await shot('10-night-top');
  await page.locator('.plate-frame').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await shot('11-night-plate', '.plate-frame');
  await page.locator('#status-grid').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await shot('12-night-statuses', '#status-grid');
  await page.evaluate(() => document.querySelectorAll('section')[3].scrollIntoView());
  await page.waitForTimeout(200);
  await shot('13-night-controls');
};
