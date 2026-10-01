/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 — the acceptance tests that are not about the fold.
 *   node tools/inspect.js tools/scenarios/dossier-checks.js --out /tmp/dsr-checks --w 1280 --h 800
 *   add --reduced to check reduced motion.
 */
const sel = (page, id, y) => page.evaluate(([i, yy]) => {
  window.BEA.store.batch(d => { d('setYear', yy); d('select', i); }); window.BEA.store.flush();
}, [id, y]);

module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.addStyleTag({ content: `
    .app { height: 100dvh !important; max-height: 100dvh !important; }
    .app__stage { overflow: hidden !important; min-height: 0 !important; }
    .stage__map { overflow: hidden !important; height: 100% !important; }` });

  /* Record every ledger:append and ask:paintUnits the dossier emits. */
  await page.evaluate(() => {
    window.__ledger = []; window.__paint = []; window.__nav = [];
    BEA.bus.on('ledger:append', p => window.__ledger.push(p));
    BEA.bus.on('ask:paintUnits', p => window.__paint.push(p));
    BEA.bus.on('dossier:navigate', p => window.__nav.push(p));
  });

  /* T6 — an India-shaped dossier opens with a company seal, not a crown. */
  await sel(page, 'british-india', 1800); await page.waitForTimeout(400);
  log('T6 british-india 1800 seal:', await page.evaluate(() => {
    const s = document.querySelector('.dsr__seal'); return s ? s.dataset.seal : 'none'; }));
  log('T6 british-india 1900 seal (crown rule):', await (async () => {
    await sel(page, 'british-india', 1900); await page.waitForTimeout(300);
    return page.evaluate(() => { const s = document.querySelector('.dsr__seal'); return s ? s.dataset.seal : 'none'; });
  })());
  await sel(page, 'bengal-presidency', 1800); await page.waitForTimeout(300);
  log('T6 bengal 1800 seal:', await page.evaluate(() => { const s = document.querySelector('.dsr__seal'); return s ? s.dataset.seal : 'none'; }));
  await shot('bengal-1800');

  /* T11 — the princely-states control lives here. */
  await sel(page, 'british-india', 1900); await page.waitForTimeout(400);
  log('T11 nested block:', await page.evaluate(() => {
    const b = document.querySelector('[data-block="nested"]');
    return b ? { heading: b.querySelector('.dsr__eyebrow').textContent, kids: b.querySelectorAll('.dsr__kids .dsr-chip').length } : null;
  }));
  await page.evaluate(() => { const b = document.querySelector('[data-act="paint-children"]'); if (b) { b.scrollIntoView(); b.click(); } });
  await page.waitForTimeout(300);
  log('T11 ask:paintUnits emitted:', JSON.stringify(await page.evaluate(() => window.__paint.map(p => ({ n: p.unitIds.length, reason: p.reason })))));
  await shot('princely-toggle', '.app__dossier');

  /* Ledger: opening a fact stamps a `found` entry. */
  log('ledger entries after browsing:', await page.evaluate(() => window.__ledger.length));
  log('ledger sample:', JSON.stringify(await page.evaluate(() => window.__ledger.slice(0, 6))));

  /* Keyboard: every chip and control is a real button, focusable, with a ring. */
  await sel(page, 'egypt', 1913); await page.waitForTimeout(400);
  log('interactive elements:', JSON.stringify(await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('.dossier button, .dossier a, .dossier [tabindex]')];
    const bad = nodes.filter(n => n.tagName !== 'BUTTON' && n.tagName !== 'A');
    const small = nodes.filter(n => { const r = n.getBoundingClientRect(); return r.height < 24 || r.width < 24; });
    return { total: nodes.length, notButtons: bad.length, under24px: small.length };
  })));
  const ring = await page.evaluate(() => {
    const c = document.querySelector('.dsr__below .dsr-chip'); c.scrollIntoView(); c.focus();
    const cs = getComputedStyle(c);
    return { focused: document.activeElement === c, outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor };
  });
  log('focus ring on a chip:', JSON.stringify(ring));
  await shot('chip-focus', '.app__dossier');

  /* Keyboard activation of a chip, then Back with the keyboard. */
  const before = await page.evaluate(() => ({ sel: BEA.store.getState().selectedTerritoryId, year: BEA.store.getState().year }));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const mid = await page.evaluate(() => ({ sel: BEA.store.getState().selectedTerritoryId, year: BEA.store.getState().year }));
  await page.evaluate(() => document.querySelector('.dsr__back').focus());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({ sel: BEA.store.getState().selectedTerritoryId, year: BEA.store.getState().year }));
  log('keyboard chip nav:', JSON.stringify(before), '->', JSON.stringify(mid), '-> back ->', JSON.stringify(after),
      '| exact:', JSON.stringify(before) === JSON.stringify(after));

  /* renderSource is the one entry point, and it is published. */
  log('renderSource typeof:', await page.evaluate(() => typeof window.BEA.renderSource));
  log('renderSource on a deliberately broken source:', await page.evaluate(() => {
    const n = window.BEA.renderSource({ author: 'A Historian', work: 'A Book', year: 1999, kind: 'book', quote: 'A sentence somebody said.' });
    return n.innerText.replace(/\n+/g, ' | ').slice(0, 300);
  }));
  log('renderSource with all four fields present:', await page.evaluate(() => {
    const n = window.BEA.renderSource({ nature: 'A speech', origin: 'Cecil Rhodes to W. T. Stead, 1895',
      purpose: 'To persuade a journalist', cannotTell: 'Whether Rhodes meant it', quote: 'A sentence.' });
    return { defects: n.dataset.defect || '0', order: [...n.querySelectorAll('dt')].map(d => d.textContent),
      quoteAfterFields: n.querySelector('dl').compareDocumentPosition(n.querySelector('blockquote')) & Node.DOCUMENT_POSITION_FOLLOWING ? 'quote is after' : 'WRONG ORDER',
      sameSize: getComputedStyle(n.querySelector('dd')).fontSize };
  }).then(JSON.stringify));

  /* mount / destroy leak check: 50 cycles. */
  log('mount-destroy 50x:', await page.evaluate(async () => {
    const mod = (await import('/app/js/panels/dossier/index.js')).default;
    const host = document.createElement('div'); document.body.append(host);
    const ctx = { root: host, store: BEA.store, data: BEA.data, bus: BEA.bus, format: BEA.format, util: BEA.util, url: BEA.url, registry: BEA.registry, id: 'x' };
    const before = BEA.store.history().length;
    for (let i = 0; i < 50; i++) { await mod.mount(ctx); mod.destroy(); }
    host.remove();
    return 'ok, no throw; child nodes left: ' + host.childNodes.length + ' (history len delta ' + (BEA.store.history().length - before) + ')';
  }));

  /* Reduced motion: no transition on anything this piece owns. */
  log('motion attr:', await page.evaluate(() => document.documentElement.dataset.motion));
  log('chip transition under current motion setting:', await page.evaluate(() => {
    const c = document.querySelector('.dsr-chip'); return c ? getComputedStyle(c).transitionDuration : 'none'; }));
};
