/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1913&sel=kenya'; });
  await page.waitForTimeout(1800);
  await shot('mobile-dossier');
  const r = await page.evaluate(() => {
    const a = document.querySelector('.app__dossier');
    if (!a) return { found: false };
    const b = a.getBoundingClientRect();
    return {
      found: true, rect: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
      vw: innerWidth, vh: innerHeight, scrollH: a.scrollHeight,
      docScrollW: document.documentElement.scrollWidth,
      text: a.innerText.slice(0, 900),
    };
  });
  log(JSON.stringify(r, null, 1));
  // drag/scroll the sheet
  await page.evaluate(() => { const a = document.querySelector('.app__dossier'); a.scrollTop = 600; });
  await page.waitForTimeout(500);
  await shot('mobile-scrolled');
  // tap a chip
  const h = await page.evaluateHandle(() => [...document.querySelectorAll('.dsr-chip')].filter(b => b.offsetParent)[0]);
  if (h.asElement()) {
    const box = await h.asElement().boundingBox();
    log('CHIP BOX', JSON.stringify(box));
    await h.asElement().click();
    await page.waitForTimeout(1500);
    await shot('mobile-after-chip');
  }
};
