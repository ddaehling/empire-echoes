/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const btns = await page.evaluate(() => [...document.querySelectorAll('.map button, .map__controls button, .map__proj, .map__zoom')].map(b => ({cls:b.className, txt:b.innerText.replace(/\n/g,' | '), aria:b.getAttribute('aria-label')})));
  log('MAP BUTTONS ' + JSON.stringify(btns, null, 1));
  const st = await page.$('button.map__plateBtn, .map__stitch, button:has-text("Stitching")');
  const stitch = await page.locator('button', { hasText: 'Stitching' }).first();
  await stitch.click();
  await page.waitForTimeout(2200);
  await shot('stitching');
  log('after: ' + JSON.stringify(await page.evaluate(() => ({
    plate: document.querySelector('.map__plate')?.getAttribute('aria-label'),
    mode: document.querySelector('.map')?.dataset,
    btn: [...document.querySelectorAll('.map button')].map(b=>b.innerText.replace(/\n/g,' | ')).join(' // ').slice(0,400),
    note: document.querySelector('.map__note, .stage-note')?.innerText?.slice(0,600)
  }))));
  // count targets
  log('targets: ' + await page.evaluate(()=>document.querySelectorAll('.map__target').length));
};
