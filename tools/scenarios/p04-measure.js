/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p04-measure.js — P04 dossier, measured. Run at every contract viewport.
 *   node tools/inspect.js tools/scenarios/p04-measure.js --out /tmp/d1366 --w 1366 --h 768
 */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  // --- deep link straight to a dossier, as the critic did ---------------
  await page.evaluate(() => { location.hash = '#year=1900&sel=egypt'; });
  await page.waitForTimeout(1800);

  const geom = await page.evaluate(() => {
    const B = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom) }; };
    const dos = document.querySelector('.app__dossier');
    const art = document.querySelector('.dossier');
    const head = document.querySelector('.dsr__head');
    const close = document.querySelector('.dsr__close, [data-act="close"]');
    const plate = B('.stage__map') || B('.app__stage');
    const scr = dos;
    // does the plate cover the header?
    let coverArea = 0;
    if (head && plate) {
      const r = head.getBoundingClientRect();
      const ox = Math.max(0, Math.min(r.right, plate.x + plate.w) - Math.max(r.left, plate.x));
      const oy = Math.max(0, Math.min(r.bottom, plate.y + plate.h) - Math.max(r.top, plate.y));
      coverArea = Math.round(ox * oy);
    }
    // what is painted at the header's centre point?
    let topAtHead = null;
    if (head) { const r = head.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(10, r.height / 2)); topAtHead = el ? (el.className || el.tagName) + '' : null; }
    let topAtClose = null, closeBox = null;
    if (close) { const r = close.getBoundingClientRect(); closeBox = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); topAtClose = el ? (el.className || el.tagName) + '' : null; }
    const fold = document.querySelector('.dsr__fold');
    return {
      vp: innerWidth + 'x' + innerHeight,
      dossier: B('.app__dossier'), article: B('.dossier'), head: B('.dsr__head'),
      plate, closeBox, topAtHead, topAtClose, headCoveredByPlate: coverArea,
      scrollH: scr ? scr.scrollHeight : 0, clientH: scr ? scr.clientHeight : 0,
      screenfuls: scr && scr.clientHeight ? +(scr.scrollHeight / scr.clientHeight).toFixed(2) : 0,
      chars: art ? (art.innerText || '').length : 0,
      foldChars: fold ? (fold.innerText || '').length : 0,
      blocks: document.querySelectorAll('.dossier [data-block]').length,
      sheetsAvail: document.querySelectorAll('.dossier [data-act="sheet"]').length,
      cxPanel: document.querySelectorAll('.dossier .cx-panel').length,
      cxAsk: document.querySelectorAll('.dossier .cx-ask, .cx-sheet .cx-ask').length,
      cxMore: document.querySelectorAll('.dossier .cx-more').length,
      cxFig: document.querySelectorAll('.dossier .cx-fig').length,
      cxSrc: document.querySelectorAll('.dossier .cx-src').length,
      ownAsk: document.querySelectorAll('.dossier .dsr__ask').length,
      docScroll: document.documentElement.scrollHeight - innerHeight,
      stage: document.getElementById('app').dataset.stage,
    };
  });
  log('GEOM ' + JSON.stringify(geom));
  await shot('dossier-open');

  // --- keyboard: focus a map target and press Enter ----------------------
  await page.evaluate(() => { location.hash = '#year=1900'; });
  await page.waitForTimeout(1200);
  const kb = await page.evaluate(async () => {
    const t = document.querySelector('.stage__map [tabindex="0"], .stage__map [role="option"], .map__target');
    if (!t) return { seeded: null, err: 'no keyboard map target' };
    t.focus();
    return { seeded: (t.getAttribute('aria-label') || t.textContent || t.id || '').trim().slice(0, 60), before: document.activeElement.tagName + '.' + document.activeElement.className };
  });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => {
    const a = document.activeElement;
    return {
      tag: a ? a.tagName : null, cls: a ? String(a.className).slice(0, 60) : null,
      inDossier: !!(a && a.closest && a.closest('.app__dossier')),
      sel: window.BEA.store.getState().selectedTerritoryId,
    };
  });
  log('KBD ' + JSON.stringify({ ...kb, after }));

  // Tab three times from there; must stay inside the dossier (trap)
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  const trapped = await page.evaluate(() => { const a = document.activeElement; return { inDossier: !!(a && a.closest && a.closest('.app__dossier')), cls: a ? String(a.className).slice(0, 50) : null }; });
  log('TRAP ' + JSON.stringify(trapped));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const esc = await page.evaluate(() => ({ sel: window.BEA.store.getState().selectedTerritoryId, active: document.activeElement ? document.activeElement.tagName + '.' + String(document.activeElement.className).slice(0, 40) : null }));
  log('ESC ' + JSON.stringify(esc));
  await shot('after-escape');
};
