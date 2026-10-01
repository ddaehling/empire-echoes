/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  // navigate by hash
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(1400);
  await shot('y1820-full');
  const band = await page.evaluate(() => {
    const el = document.querySelector('.tl-spine, .spine-band, [class*="spine"]');
    return el ? { cls: el.className, text: el.innerText } : null;
  });
  log('SPINE:', JSON.stringify(band));
  const lit = await page.evaluate(() => Array.from(document.querySelectorAll('[class*="spine"] [class*="lane"],[class*="spine"] li,[class*="spine"] .tl-spine__bar')).map(e => ({t: e.innerText.replace(/\n/g,' | '), cls: e.className, aria: e.getAttribute('aria-current')||e.getAttribute('data-live')||'' })));
  log('LANES:', JSON.stringify(lit, null, 1));
  await shot('y1820-band', '.tl');
  // 1820 caption
  log('CAPTION:', await page.evaluate(() => {
    const c = document.querySelector('[class*="spine"]');
    return c ? c.innerText : 'none';
  }));
};
