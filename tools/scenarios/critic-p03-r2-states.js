/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const check = async (hash, tag) => {
    await page.evaluate((h) => { location.hash = h; }, hash);
    await page.waitForTimeout(1400);
    const r = await page.evaluate(() => {
      const b = document.querySelector('.tl-spine, [class*="spine"]');
      const t = document.querySelector('.time__slot');
      const rb = b ? b.getBoundingClientRect() : null;
      const rt = t ? t.getBoundingClientRect() : null;
      return { spine: rb ? {w:Math.round(rb.width),h:Math.round(rb.height),vis:rb.height>0} : null,
               time: rt ? {w:Math.round(rt.width),h:Math.round(rt.height)} : null,
               spineText: b ? b.innerText.replace(/\n/g,' | ').slice(0,120) : '' };
    });
    log(tag + ' ' + hash + ' => ' + JSON.stringify(r));
    await shot(tag);
  };
  await check('#year=1857&compare=1914', 'compare');
  await check('#year=1765&tour=company-rule&step=2', 'tour');
  await check('#panel=close', 'close');
  await check('#panel=evidence', 'evidence');
  await check('#year=1900&sel=bengal', 'sel');
};
