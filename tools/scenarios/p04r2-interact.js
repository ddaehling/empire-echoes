/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'querySelector').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const ledger = [];
  await page.exposeFunction('__note', (e) => ledger.push(e));
  await page.evaluate(() => { window.BEA.bus.on('ledger:append', (e) => window.__note({ k: e.kind, c: e.claimId, at: e.at, d: e.dwellMs })); });

  /* --- TEST 6 substance: the ledger fires on reading, not on rendering ---- */
  await page.evaluate(() => { location.hash = '#year=1913&sel=bengal-presidency'; });
  await page.waitForTimeout(300);
  log('ledger 300ms after select: ' + ledger.length);
  await page.waitForTimeout(1600);
  log('ledger 1.9s after select: ' + ledger.length + ' → ' + ledger.map(x => x.c).join(', '));
  const t0 = ledger.length;
  await page.mouse.move(1150, 400);
  await page.mouse.wheel(0, 2500);
  await page.waitForTimeout(2200);
  log('ledger after scrolling to 2500: ' + ledger.length + ' (+' + (ledger.length - t0) + ')');
  const spread = ledger.length > 1 ? Math.max(...ledger.map(x => x.at)) - Math.min(...ledger.map(x => x.at)) : 0;
  log('timestamp spread across entries: ' + spread + 'ms; dwell values: ' + ledger.map(x => x.d).join(','));

  /* --- TEST 5: because-chip navigates and Back returns ------------------- */
  await page.evaluate(() => { location.hash = '#year=1913&sel=bengal-presidency'; });
  await page.waitForTimeout(800);
  const before = await page.evaluate(() => ({ hash: location.hash, name: document.querySelector('.dsr__name').textContent }));
  const chip = await page.evaluate(() => {
    const c = document.querySelector('.app__dossier .dsr__because .dsr-chip');
    if (!c) return null;
    const basis = c.closest('.dsr__becausewrap').querySelector('.dsr__bases li');
    return { label: c.textContent.replace(/\s+/g, ' '), aria: c.getAttribute('aria-label'),
      visibleBasis: basis ? basis.textContent.replace(/\s+/g, ' ') : null,
      hasTitle: c.hasAttribute('title') };
  });
  log('chip: ' + JSON.stringify(chip));
  await page.evaluate(() => { document.querySelector('.app__dossier .dsr__because .dsr-chip').click(); });
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => ({ hash: location.hash, name: document.querySelector('.dsr__name').textContent,
    year: document.querySelector('.dsr__year') ? document.querySelector('.dsr__year').textContent : null,
    back: !!document.querySelector('.dsr__back'), backText: document.querySelector('.dsr__back') ? document.querySelector('.dsr__back').textContent.replace(/\s+/g,' ') : null }));
  log('BEFORE ' + JSON.stringify(before));
  log('AFTER CHIP ' + JSON.stringify(after));
  await shot('after-chip');
  await page.evaluate(() => { document.querySelector('.dsr__back').click(); });
  await page.waitForTimeout(900);
  const back = await page.evaluate(() => ({ hash: location.hash, name: document.querySelector('.dsr__name').textContent }));
  log('AFTER BACK ' + JSON.stringify(back) + '  restored=' + (back.hash === before.hash));

  /* --- T11: princely states, direct rule -------------------------------- */
  let painted = null;
  await page.evaluate(() => { window.BEA.bus.on('ask:paintUnits', (p) => { window.__painted = { n: p.unitIds.length, reason: p.reason }; }); });
  await page.evaluate(() => { location.hash = '#year=1930&sel=british-india'; });
  await page.waitForTimeout(900);
  const t11 = await page.evaluate(() => {
    const b = document.querySelector('[data-block="nested"]');
    return b ? b.textContent.replace(/\s+/g, ' ').slice(0, 400) : null;
  });
  log('T11 block: ' + t11);
  await page.evaluate(() => { const b = document.querySelector('[data-act="paint-direct"]'); if (b) b.click(); });
  await page.waitForTimeout(400);
  painted = await page.evaluate(() => window.__painted);
  log('painted direct: ' + JSON.stringify(painted));
  await page.evaluate(() => { const b = document.querySelector('[data-act="paint-children"]'); if (b) b.click(); });
  await page.waitForTimeout(400);
  log('painted children: ' + JSON.stringify(await page.evaluate(() => window.__painted)));

  /* --- close control ----------------------------------------------------- */
  const closed = await page.evaluate(() => {
    document.querySelector('.dsr__close').click();
    return new Promise(r => setTimeout(() => r({ sel: window.BEA.store.getState().selectedTerritoryId, hash: location.hash }), 400));
  });
  log('CLOSE → ' + JSON.stringify(closed));
};
