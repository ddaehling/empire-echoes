/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2000);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(1800);
  await shot('beat1');
  log('URL:', page.url());
  log('TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 3000));
  const geo = await page.evaluate(() => {
    const g = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`; };
    return {
      stage: g('.app__stage'), map: g('.stage__map'), svg: g('.stage__map svg'),
      panel: g('.app__panel'), foot: g('.app__foot'), tl: g('.app__time'),
      zoomCluster: g('.map__zooms') || g('.map__zoom')?.toString(),
    };
  });
  log('geo:', JSON.stringify(geo, null, 1));
  const cls = await page.evaluate(() => [...new Set([...document.querySelectorAll('body *')].map(e=>e.className).filter(c=>typeof c==='string'&&c).flatMap(c=>c.split(/\s+/)))].filter(c=>/^(tx|tour|beat|cx|step|nav)/.test(c)).join(' '));
  log('classes:', cls);
};
