/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05r3-years.js — the one-place-many-labels widget on T9 and T12. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.removeItem('bea.ledger.v1'); } catch (_) {} });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.waitForTimeout(1300);
  for (const id of ['nationalisation', 'egypt']) {
    await page.evaluate((b) => window.BEA.bus.emit('tours:goBeat', { id: b }), id);
    await page.waitForTimeout(1100);
    const before = await page.evaluate(() => ({
      year: window.BEA.store.getState().year,
      buttons: [...document.querySelectorAll('.tr-years__b')].map((n) => n.textContent),
      read: (document.querySelector('.tr-years__read') || {}).textContent || '',
    }));
    log(id + ' initial: year=' + before.year + ' buttons=' + JSON.stringify(before.buttons) + '\n   read: ' + before.read.replace(/\s+/g, ' ').slice(0, 300));
    await shot(id + '-a');
    // press the second-to-last button
    await page.evaluate(() => { const b = [...document.querySelectorAll('.tr-years__b')]; if (b.length) b[b.length - 2].click(); });
    await page.waitForTimeout(900);
    const after = await page.evaluate(() => ({
      year: window.BEA.store.getState().year,
      read: (document.querySelector('.tr-years__read') || {}).textContent || '',
    }));
    log(id + ' pressed: year=' + after.year + '\n   read: ' + after.read.replace(/\s+/g, ' ').slice(0, 320));
    await shot(id + '-b');
  }
};
