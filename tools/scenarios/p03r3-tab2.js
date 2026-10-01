/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Forward Tab must leave the time bar, at every stage, on every viewport. */
module.exports = async ({ page, log }) => {
  await page.waitForSelector('.tl', { timeout: 15000 });
  await page.evaluate(() => { location.hash = '#year=1901&filter=stage:apparatus'; });
  await page.waitForTimeout(1200);
  const seen = [];
  for (let i = 0; i < 45; i++) {
    await page.keyboard.press('Tab');
    seen.push(await page.evaluate(() => {
      const a = document.activeElement;
      if (!a) return 'none';
      return (a.closest('.tl') ? 'TL' : a.closest('[data-mount="legend"]') ? 'LEGEND'
        : a.closest('.stage__map, [data-mount="map"], [data-mount="map-overlay"]') ? 'MAP'
        : a.closest('.cx-sheet') ? 'SHEET'
        : a.closest('[data-mount="dossier"]') ? 'DOSSIER'
        : a.closest('.cx-lede') ? 'LEDE' : 'OTHER') + ':' + ((a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 22));
    }));
  }
  const owners = [...new Set(seen.map(s => s.split(':')[0]))];
  const maxRun = seen.reduce((acc, s) => { const o = s.split(':')[0]; if (o === acc.last) { acc.run++; } else { acc.last = o; acc.run = 1; } acc.max = Math.max(acc.max, acc.run); return acc; }, { last: '', run: 0, max: 0 }).max;
  log('owners reached in 45 tabs: ' + owners.join(', '));
  log('longest unbroken run inside one owner: ' + maxRun);
  log(seen.join('\n'));
};
