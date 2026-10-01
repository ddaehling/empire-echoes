/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(600);

  /* renderSource is published for every other piece */
  log('window.BEA.renderSource: ' + await page.evaluate(() => typeof window.BEA.renderSource));
  log('renderSource with an empty object → ' + await page.evaluate(() => window.BEA.renderSource({}).innerText.replace(/\s+/g, ' ').slice(0, 160)));
  log('renderSource on the bus: ' + await page.evaluate(() => new Promise(r => {
    window.BEA.bus.emit('ask:renderSource', { src: { kind: 'book', author: 'X', work: 'Y', year: 1999 }, reply: n => r(n.className) });
    setTimeout(() => r('no reply'), 500);
  })));

  /* who has no named actor at all */
  const actors = await page.evaluate(async () => {
    const { store, data } = window.BEA;
    const wait = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const missing = [], onlyOther = [];
    for (const t of data.territories) {
      store.dispatch('setYear', t.acquiredYear || t.firstYear || 1900);
      store.dispatch('select', t.id); store.flush(); await wait();
      const root = document.querySelector('.dossier');
      if (!root) continue;
      if (root.querySelector('.dsr__missing .defect')) {
        const txt = root.querySelector('.dsr__missing .defect').textContent;
        (txt.includes('missing local actors') ? missing : onlyOther).push(t.id);
      }
    }
    return { missing, onlyOther };
  });
  log('[missing local actors]: ' + JSON.stringify(actors.missing));
  log('[no one from this place is named]: ' + JSON.stringify(actors.onlyOther));

  /* the Ledger */
  const ledger = await page.evaluate(async () => {
    const got = [];
    const off = window.BEA.bus.on('ledger:append', e => got.push(e));
    window.BEA.store.dispatch('setYear', 1857);
    window.BEA.store.dispatch('select', 'british-india');
    window.BEA.store.flush();
    await new Promise(r => setTimeout(r, 2600));
    off();
    return { n: got.length, kinds: [...new Set(got.map(g => g.kind))], sample: got.slice(0, 3) };
  });
  log('ledger:append during 2.6s on British India: ' + JSON.stringify(ledger));
  log('BEA.dossierLedger size: ' + await page.evaluate(() => window.BEA.dossierLedger.size()));

  /* keyboard: D focuses the panel, Escape closes it */
  await page.evaluate(() => { document.getElementById('stage').focus(); });
  await page.keyboard.press('d');
  await page.waitForTimeout(300);
  log('after D, focus is: ' + await page.evaluate(() => document.activeElement.className));
  const stops = await page.evaluate(() => {
    const root = document.querySelector('.dossier');
    return [...root.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])')]
      .slice(0, 6).map(n => (n.innerText || n.getAttribute('aria-label') || '').replace(/\s+/g, ' ').slice(0, 40));
  });
  log('first six tab stops in the panel: ' + JSON.stringify(stops));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  log('after Escape, selection is: ' + await page.evaluate(() => String(window.BEA.store.getState().selectedTerritoryId)));
  log('ERRORS ' + JSON.stringify(errs.slice(0, 10)));
};
