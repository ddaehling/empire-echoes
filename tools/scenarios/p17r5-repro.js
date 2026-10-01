/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — TypeError: Cannot read properties of undefined (reading 'snapshot').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 5 — reproduce: (a) the ribbon's sentence over legal-status chips on
   every fill layer, (b) the accessible name of every legend control and swatch,
   (c) the map rectangle. */
const ready = async (page) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(900);
};

const measure = (page) => page.evaluate(() => {
  const q = (s) => { const n = document.querySelector(s); if (!n) return null;
    const r = n.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) }; };
  return { map: q('.stage__map') || q('[data-mount="map"]'), key: q('.stage__key'), lede: q('.app__lede') || q('[data-mount="lede"]') };
});

module.exports = async ({ page, shot, log }) => {
  await ready(page);
  const layers = ['status', 'exit', 'mechanism', 'slavery', 'resistance', 'taken-from', 'tenure', 'system', 'weight'];
  for (const L of layers) {
    await page.evaluate((l) => { location.hash = '#year=1900&layer=' + l; }, L);
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => {
      const rib = document.querySelector('.legend--ribbon');
      if (!rib) return { missing: true };
      const say = rib.querySelector('.legend__say');
      const chips = [...rib.querySelectorAll('.legend__rib')].map(li => ({
        t: li.textContent.trim().replace(/\s+/g, ' '),
        hidden: li.hidden,
        label: li.getAttribute('aria-label'),
      }));
      return {
        activeLayer: window.BEA.store.getState().activeLayer,
        say: say ? say.textContent.trim() : null,
        sayHidden: say ? say.hidden : null,
        chips,
        groupLabel: rib.getAttribute('aria-label'),
      };
    });
    log('LAYER ' + L + ' :: say=' + JSON.stringify(r.say) + ' chips=' + JSON.stringify((r.chips || []).filter(c => !c.hidden).map(c => c.t)));
  }
  await page.evaluate(() => { location.hash = '#year=1900&layer=exit'; });
  await page.waitForTimeout(700);
  await shot('ribbon-exit-1900');
  try { await shot('ribbon-crop', '.stage__key'); } catch (e) { log('no .stage__key'); }

  /* the accessible-name audit — every control and every swatch in the module */
  await page.evaluate(() => { location.hash = '#year=1700&layer=status'; });
  await page.waitForTimeout(700);
  const rib = await page.$('.legend--ribbon');
  if (rib) {
    const snap = await page.accessibility.snapshot({ root: rib, interestingOnly: false });
    log('RIBBON AX (cold):\n' + JSON.stringify(snap, null, 1).slice(0, 6000));
  }
  /* open the sheet */
  const route = await page.$('.legend__route');
  if (route) {
    const box = await route.boundingBox();
    log('route box: ' + JSON.stringify(box));
    await route.click();
    await page.waitForTimeout(900);
    await shot('sheet-open');
    const sheet = await page.$('.cx-sheet, [role="dialog"]');
    if (sheet) {
      const snap2 = await page.accessibility.snapshot({ root: sheet, interestingOnly: false });
      log('SHEET AX:\n' + JSON.stringify(snap2, null, 1).slice(0, 24000));
    }
  } else { log('NO .legend__route on screen'); }
  log('MEASURE ' + JSON.stringify(await measure(page)));
};
