/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1600&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const t0 = Date.now();
  for (let y = 1600; y <= 1997; y += 1) {
    await page.evaluate((yy) => window.BEA.store.act.setYear(yy), y);
  }
  log('scrub done in', Date.now()-t0, 'ms');
  await page.waitForTimeout(1200);
  await shot('after-scrub');
  const t = await page.evaluate(() => document.querySelector('.app__dossier').innerText.slice(0,700).replace(/\n/g,' | '));
  log('AT 1997:', t);
  // rail overflow
  const rail = await page.evaluate(() => {
    const r = document.querySelector('.dsr__rail, [class*=rail]');
    if (!r) return 'none';
    const cs = getComputedStyle(r);
    return { cls:r.className, sw: r.scrollWidth, cw: r.clientWidth, overflowX: cs.overflowX };
  });
  log('RAIL:', JSON.stringify(rail));
  // more buttons
  const m = page.locator('.dsr__more').first();
  await m.click(); await page.waitForTimeout(600);
  await shot('after-more');
  log('after more scrollTop', await page.evaluate(()=>document.querySelector('.app__dossier').scrollTop));
};
