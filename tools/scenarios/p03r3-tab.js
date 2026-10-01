/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Reproduce the reported keyboard trap: 60 forward Tabs from a cold load. */
module.exports = async ({ page, log }) => {
  await page.waitForSelector('.tl', { timeout: 15000 });
  await page.waitForTimeout(900);
  const seq = [];
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const d = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a) return 'none';
      const owner = a.closest('.tl') ? 'TL' : (a.closest('[data-mount="legend"]') ? 'LEGEND'
        : a.closest('.stage__map, [data-mount="map"], [data-mount="map-overlay"]') ? 'MAP'
        : a.closest('[data-mount="dossier"]') ? 'DOSSIER'
        : a.closest('.cx-lede, [data-mount="lede"]') ? 'LEDE'
        : a.closest('.app__bar, header') ? 'BAR' : 'OTHER');
      return owner + ':' + (a.tagName.toLowerCase()) + '.' + (a.className || '').split(' ').slice(0,2).join('.') + ' «' + ((a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 28)) + '»';
    });
    seq.push(i + ' ' + d);
  }
  log(seq.join('\n'));
};
