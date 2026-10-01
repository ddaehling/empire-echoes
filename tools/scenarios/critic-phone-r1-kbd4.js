/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1800);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(1500);
  await page.locator('.tr-bar__next').first().click(); await page.waitForTimeout(700);
  await page.locator('.tr-bar__next').first().click(); await page.waitForTimeout(1200);
  log('step: ' + await page.evaluate(()=>document.querySelector('.tr-bar__count')?.innerText.replace(/\s+/g,'')));
  let occ = 0;
  for (let i = 0; i < 24; i++) {
    await page.keyboard.press('Tab');
    const a = await page.evaluate(() => {
      const e = document.activeElement; if (!e) return null;
      const r = e.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2);
      return { t:(e.innerText||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,32), cls:e.className.toString().slice(0,22), y:Math.round(r.y), occ: !!(top && !e.contains(top) && top!==e), topEl: top?top.className.toString().slice(0,24):'null' };
    });
    if (a) { if (a.occ) occ++; log(`${i}: y=${a.y} OCC=${a.occ} top="${a.topEl}" .${a.cls} "${a.t}"`); }
  }
  log('occluded stops: ' + occ);
  await shot('tab-end');
};
