/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const openPlate = async () => {
    if (!await page.evaluate(() => !!document.querySelector('.lplate__crit'))) {
      const b = page.locator('button', { hasText: /Open the full key/i }).first();
      if (await b.count()) await b.click(); else await page.getByText(/Three things wrong/i).first().click();
      await page.waitForTimeout(1100);
    }
  };
  const snap = async (tag) => {
    await openPlate();
    const o = await page.evaluate(() => ({
      crit: (document.querySelector('.lplate__crit')||{}).innerText?.replace(/\n+/g,' | ').slice(0,900),
      byline: (document.querySelector('[class*="byline"]')||{}).innerText?.replace(/\n+/g,' | ').slice(0,600),
      view: (window.BEA && window.BEA.state && (window.BEA.state.get ? window.BEA.state.get() : window.BEA.state)) || null,
    }));
    log('### '+tag+'\nCRIT: '+o.crit+'\nBYLINE: '+o.byline+'\nSTATE.stitch/weight/silence: '+JSON.stringify({s:o.view&&o.view.stitch,w:o.view&&o.view.weight,h:o.view&&o.view.silence,p:o.view&&o.view.projection})+'\n');
  };
  await page.keyboard.press('s'); await page.waitForTimeout(1500); await snap('STITCH-from-boot-mercator');
  await shot('stitch');
  await page.keyboard.press('h'); await page.waitForTimeout(600);
  await page.keyboard.press('s'); await page.waitForTimeout(1200);
  await snap('SILENCE-only-mercator');
  await shot('silence');
};
