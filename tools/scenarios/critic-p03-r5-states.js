/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const check = async (page, log, label) => {
  const o = await page.evaluate(() => {
    const s = document.querySelector('.tl-spine, [class*="tl-spine"]');
    const tl = document.querySelector('.tl');
    const vis = e => { if (!e) return false; const b = e.getBoundingClientRect(); return b.height > 4 && b.width > 4 && getComputedStyle(e).visibility !== 'hidden'; };
    return { spine: !!s, spineVisible: vis(s), spineH: s ? Math.round(s.getBoundingClientRect().height) : 0, tlVisible: vis(tl), tlH: tl ? Math.round(tl.getBoundingClientRect().height) : 0, cap: s ? s.innerText.split('\n').filter(Boolean).slice(-2).join(' / ').slice(0,120) : '' };
  });
  log(label + ': ' + JSON.stringify(o));
};
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await check(page, log, 'default');
  const tries = ['#year=1914&compare=1860', '#year=1857&tour=company-rule&step=2', '#panel=close', '#panel=evidence', '#quiz=1', '#year=1857&sel=bengal', '#panel=mechanism'];
  for (const h of tries) {
    await page.evaluate((hh) => { location.hash = hh; }, h);
    await page.waitForTimeout(1400);
    await check(page, log, h);
  }
  await page.evaluate(() => { location.hash = '#year=1914&compare=1860'; });
  await page.waitForTimeout(1500);
  await shot('compare');
  await page.evaluate(() => { location.hash = '#panel=close'; });
  await page.waitForTimeout(1600);
  await shot('close');
};
