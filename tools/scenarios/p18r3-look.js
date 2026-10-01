/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  const boot = async (hash, w, h) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:8777/app/' + hash, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
    await page.waitForTimeout(1700);
  };
  const L = '#year=1770&compare=1820&filter=cmp:america,cmpr:1,cmpg:a,stage:working';
  await boot(L, 390, 844);
  await shot('390-fresh');
  await page.evaluate(() => { document.querySelector('.cmp__grid').scrollTop = 250; });
  await page.waitForTimeout(300);
  const seam = await page.evaluate(() => {
    const p = document.querySelector('.cmp__plates');
    const cs = getComputedStyle(p);
    return { border: cs.borderBottom, shadow: cs.boxShadow, rect: p.getBoundingClientRect().bottom };
  });
  log('seam: ' + JSON.stringify(seam));
  await page.screenshot({ path: '/tmp/p18r3-seam.png', clip: { x: 0, y: Math.round(seam.rect) - 40, width: 390, height: 90 } });
  log('seam crop: /tmp/p18r3-seam.png');
  await shot('390-scrolled');
  // 1024x640 — the narrowest three-column
  await boot(L, 1024, 640);
  await shot('1024');
  // dark + reduced already handled by flags; do a picker overflow check at 1366
  await boot(L, 1366, 768);
  await shot('1366');
};
