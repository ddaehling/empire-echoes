/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p04-accept.js — FEATURE_SPEC §2 P04 acceptance tests plus this round's two
 * must-fixes, as PASS/FAIL lines. Run at every contract viewport.
 */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  // --- ROUND 7 E: a cold deep link must not steal focus (no key pressed yet)
  await page.evaluate(() => { location.hash = '#year=1857&sel=bengal-presidency'; });
  await page.waitForTimeout(1600);
  const cold = await page.evaluate(() => document.activeElement.tagName + '.' + String(document.activeElement.className).slice(0, 30));
  t('R7-E a cold deep link does not steal focus', cold === 'BODY.', cold, 'BODY (a mouse reader sees no ring)');

  // --- P04-1: four answers above the fold, franchise present ---------------
  await page.evaluate(() => { location.hash = '#year=1900&sel=egypt'; });
  await page.waitForTimeout(1600);
  const fold = await page.evaluate(() => {
    const sc = document.querySelector('.app__dossier');
    const f = document.querySelector('.dsr__fold');
    const bot = sc.getBoundingClientRect().bottom;
    const blocks = [...document.querySelectorAll('.dossier [data-block]')].map((b) => ({ k: b.dataset.block, in: b.getBoundingClientRect().bottom <= bot + 1 }));
    return {
      name: !!document.querySelector('.dsr__name'),
      status: blocks.find((b) => b.k === 'status'),
      taken: blocks.find((b) => b.k === 'taken'),
      ended: blocks.find((b) => b.k === 'ended'),
      thesis: !!document.querySelector('.dsr__thesisline'),
      franchise: /WHO COULD VOTE|unknown/i.test(f ? f.innerText : ''),
      foldBottom: Math.round(f ? f.getBoundingClientRect().bottom : 0), panelBottom: Math.round(bot),
    };
  });
  t('P04-1 fold: name+status+taken+ended, no scroll',
    fold.name && fold.status && fold.status.in && fold.taken && fold.taken.in && fold.ended && fold.ended.in,
    JSON.stringify(fold), 'all four above the fold');
  t('P04-1 franchise line', fold.franchise, String(fold.franchise), 'present or "unknown"');
  t('P04-1 argument above the fold', fold.thesis, String(fold.thesis), 'the thesis line is in the header');

  // --- P04-2: banned words -------------------------------------------------
  const banned = await page.evaluate(() => {
    const art = document.querySelector('.dossier');
    const quotes = new Set([...art.querySelectorAll('blockquote, q, cite, .src__quote')]);
    const walk = document.createTreeWalker(art, NodeFilter.SHOW_TEXT);
    let n, hits = [];
    const re = /\b(acquired|pacified|natives?|unrest|mixed legacy)\b/i;
    while ((n = walk.nextNode())) {
      let inQ = false;
      for (let p = n.parentElement; p; p = p.parentElement) if (quotes.has(p)) { inQ = true; break; }
      if (inQ) continue;
      const m = n.nodeValue.match(re);
      if (m) hits.push(m[0] + ' :: ' + n.nodeValue.trim().slice(0, 60));
    }
    return hits;
  });
  t('P04-2 banned strings', banned.length === 0, banned.slice(0, 3).join(' | ') || 'none', 'zero outside quotation');

  // --- P04-3: a named non-British actor, defects shown ---------------------
  const actors = await page.evaluate(() => ({
    names: document.querySelectorAll('.dossier .dsr__actor-name, .dossier .dsr__promoline').length,
    text: (document.querySelector('[data-block="actors-promo"]') || {}).innerText || '',
    danger: document.querySelectorAll('.dossier .dsr__missing, .dossier .dsr__nobody').length,
  }));
  t('P04-3 named local actors', actors.names > 0 && actors.text.length > 10, actors.text.replace(/\s+/g, ' ').slice(0, 70), 'at least one named person or institution');

  // --- P04-4: Egypt 1882/1914/1922/1956 gives four labels ------------------
  const labels = [];
  for (const y of [1882, 1914, 1922, 1956]) {
    await page.evaluate((yy) => { window.BEA.store.dispatch('setYear', yy); }, y);
    await page.waitForTimeout(500);
    labels.push(await page.evaluate(() => {
      const w = document.querySelector('.dsr__statusword'); const l = document.querySelector('.dsr__statuslabel');
      return ((w ? w.textContent : '') + (l ? l.textContent : '')).replace(/\s+/g, ' ').trim();
    }));
  }
  t('P04-4 Egypt four labels', new Set(labels).size === 4, JSON.stringify(labels), '4 distinct legal labels');

  // --- P04-5: a because-chip navigates and Back returns --------------------
  await page.evaluate(() => { location.hash = '#year=1857&sel=bengal-presidency'; });
  await page.waitForTimeout(1600);
  const chip = await page.evaluate(() => {
    const c = document.querySelector('.dossier .dsr-chip[data-target]');
    if (!c) return null;
    const to = c.dataset.target; c.click(); return to;
  });
  await page.waitForTimeout(900);
  const afterChip = await page.evaluate(() => ({ sel: window.BEA.store.getState().selectedTerritoryId, back: !!document.querySelector('.dsr__back') }));
  await page.evaluate(() => { const b = document.querySelector('.dsr__back'); if (b) b.click(); });
  await page.waitForTimeout(800);
  const afterBack = await page.evaluate(() => window.BEA.store.getState().selectedTerritoryId);
  t('P04-5 chip navigates + Back returns', !!chip && afterChip.sel === chip && afterChip.back && afterBack === 'bengal-presidency',
    JSON.stringify({ chip, afterChip, afterBack }), 'chip -> target, Back -> bengal-presidency');

  // --- ROUND 7 A: keyboard entry -------------------------------------------
  await page.evaluate(() => { location.hash = '#year=1900'; window.BEA.store.dispatch('deselect'); });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const m = document.querySelector('.map__target'); if (m) m.focus(); });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1400);   // past the 120ms reflow debounce
  const kb = await page.evaluate(() => {
    const a = document.activeElement;
    return { tag: a.tagName, cls: String(a.className).slice(0, 40), inDossier: !!(a.closest && a.closest('.app__dossier')), isHead: a.classList && a.classList.contains('dsr__name') };
  });
  t('R7-A Enter on a map target focuses the dossier heading', kb.inDossier && kb.isHead, JSON.stringify(kb), 'H2.dsr__name inside .app__dossier');

  // --- ROUND 7 B: the trap holds at both ends ------------------------------
  const trap = await page.evaluate(async () => {
    const root = document.querySelector('#dossier') || document.querySelector('.app__dossier');
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
    const items = [...root.querySelectorAll(sel)].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 || r.height > 0; });
    return { n: items.length, firstCls: items.length ? String(items[0].className).slice(0, 30) : null };
  });
  // walk to the last stop, then one more Tab
  for (let i = 0; i < trap.n + 2; i++) await page.keyboard.press('Tab');
  const wrapped = await page.evaluate(() => { const a = document.activeElement; return { inDossier: !!(a.closest && a.closest('.app__dossier')), cls: String(a.className).slice(0, 40) }; });
  await page.keyboard.down('Shift');
  for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
  await page.keyboard.up('Shift');
  const wrappedBack = await page.evaluate(() => ({ inDossier: !!(document.activeElement.closest && document.activeElement.closest('.app__dossier')) }));
  t('R7-B Tab stays in the panel (' + trap.n + ' stops, +2 forward, 3 back)', wrapped.inDossier && wrappedBack.inDossier,
    JSON.stringify({ wrapped, wrappedBack }), 'focus never leaves .app__dossier');

  // --- ROUND 7 C: Escape releases ------------------------------------------
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  const esc = await page.evaluate(() => ({ sel: window.BEA.store.getState().selectedTerritoryId, onStage: !!(document.activeElement.closest && document.activeElement.closest('.app__stage')) }));
  t('R7-C Escape closes and returns to the map', esc.sel === null && esc.onStage, JSON.stringify(esc), 'deselected, focus on the stage');

  // --- ROUND 7 D: the header is reachable, the close target is 44 ----------
  await page.evaluate(() => { location.hash = '#year=1900&sel=egypt'; });
  await page.waitForTimeout(1600);
  const head = await page.evaluate(() => {
    const h = document.querySelector('.dsr__head'); const c = document.querySelector('.dsr__close');
    const hr = h.getBoundingClientRect(); const cr = c.getBoundingClientRect();
    const at = (el, x, y) => { const e = document.elementFromPoint(x, y); return e ? !!(e === el || el.contains(e) || (e.closest && e.closest('.app__dossier'))) : false; };
    // the 44x44 target is the button's ::before, so probe the four corners of it
    const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
    return {
      titleHit: at(h, hr.left + hr.width / 2, hr.top + 12),
      closeHit: at(c, cx, cy),
      closeCorner: at(c, cx - 20, cy - 20) && at(c, cx + 20, cy + 20),
      box: [Math.round(cr.width), Math.round(cr.height)],
      target: (() => { const b = getComputedStyle(c, '::before'); return [b.width, b.height]; })(),
      sticky: getComputedStyle(document.querySelector('.dsr__head')).position,
    };
  });
  t('R7-D dossier header is on top (title + ✕ hit-testable)', head.titleHit && head.closeHit, JSON.stringify(head), 'elementFromPoint lands in the dossier');
  t('R7-D close target >= 44x44', parseFloat(head.target[0]) >= 44 && parseFloat(head.target[1]) >= 44, head.target.join('x') + ' (drawn ' + head.box.join('x') + ')', '>= 44x44');
  t('R7-D header sticky', head.sticky === 'sticky', head.sticky, 'sticky');

  // --- ROUND 7 F: the answers sheet ----------------------------------------
  const ans = await page.evaluate(async () => {
    const b = document.querySelector('.dossier .cx-ask button, .dossier .dsr__askbtn, .dossier [data-act="ask"]');
    if (!b) return { err: 'no question' };
    b.click();
    await new Promise((r) => setTimeout(r, 700));
    const route = document.querySelector('[data-act="sheet"][data-sheet="answers"]');
    if (!route) return { err: 'no route to answers' };
    route.click();
    await new Promise((r) => setTimeout(r, 700));
    const s = document.querySelector('.app__sheet');
    return {
      title: (document.querySelector('.cx-sheet__title') || {}).textContent,
      rows: document.querySelectorAll('.app__sheet .dsr__ansrow').length,
      q: (document.querySelector('.app__sheet .dsr__ansq') || {}).textContent,
      h: Math.round(s.getBoundingClientRect().height),
      figs: document.querySelectorAll('.app__sheet .cx-fig').length,
    };
  });
  t('R7-F the session answers sheet', !ans.err && ans.rows >= 1 && ans.h >= 280, JSON.stringify(ans), '>=1 row, >=280px surface');

  // --- chrome adoption ------------------------------------------------------
  const cx = await page.evaluate(() => ({
    panel: document.querySelectorAll('.dossier .cx-panel').length,
    ask: document.querySelectorAll('.dossier .cx-ask, .app__sheet .cx-ask').length,
    more: document.querySelectorAll('.dossier .cx-more').length,
    note: document.querySelectorAll('.dossier .cx-note, .app__sheet .cx-note').length,
    cta: document.querySelectorAll('.dossier .cx-cta, .app__sheet .cx-cta').length,
    ownBox: document.querySelectorAll('.dossier .dsr__card, .dossier .dsr__pill, .dossier .chip--warn').length,
  }));
  t('CX no .cx-cta from this piece', cx.cta === 0, cx.cta, '0 (shell only)');
  t('CX shared classes in use', cx.panel > 0 && cx.more > 0 && cx.note > 0, JSON.stringify(cx), 'cx-panel/cx-more/cx-note present');

  log(R.join('\n'));
  log(R.some((r) => r.startsWith('FAIL')) ? '>>> P04 FAILING' : '>>> P04 holds');
  await shot('p04');
};
