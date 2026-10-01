/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('landing-full');
  const tl = await page.$('.tl');
  log('tl present:', !!tl);
  if (tl) {
    const box = await tl.boundingBox();
    log('tl box:', JSON.stringify(box));
    await shot('timeline-strip', '.tl');
  }
  log('TL TEXT >>>', (await page.evaluate(() => {
    const t = document.querySelector('.tl'); return t ? t.innerText : '(none)';
  })));
  log('BODY TEXT (2000) >>>', (await page.evaluate(() => document.body.innerText)).slice(0, 2000));
  log('URL:', page.url());
};
