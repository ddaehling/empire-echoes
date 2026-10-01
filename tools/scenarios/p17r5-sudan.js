/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => { location.hash = '#year=1900&layer=status'; });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const api = window.__map;
    const out = [];
    for (const [uid, rec] of api.plate.paint) {
      if (/sudan|hebrides|weihai/i.test(uid)) out.push({ uid, key: rec.key, label: rec.label, entryStatus: rec.entry && rec.entry.status });
    }
    const heads = [...document.querySelectorAll('.legend__family-name')].map(n => n.textContent);
    return { out, heads };
  });
  log('UNITS ' + JSON.stringify(r.out));
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(900);
  const heads = await page.evaluate(() => [...document.querySelectorAll('.legend__family-name')].map(n => n.textContent.trim()));
  log('FAMILY HEADS ' + JSON.stringify(heads));
  const chip = await page.evaluate(() => {
    const li = [...document.querySelectorAll('.legend__rib')].find(n => /Leased/.test(n.textContent));
    return li ? { text: li.textContent.trim(), label: li.getAttribute('aria-label') } : null;
  });
  log('CHIP ' + JSON.stringify(chip));
};
