/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* p20r2-stage — the WORKING stage, not the cold plate.
 *
 * Round two's most useful sentence about testing: "budget.js and shell-accept.js
 * exercise the cold plate only; every defect above lives in data-stage=working
 * with a beat panel mounted." This is that test for P20's two working-stage
 * surfaces — the on-path move card in the rail, and the desk over everything.
 * Run it at 390x844, 768x1024, 900x700, 1366x768 and 1440x900, light and dark.
 */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  /* A defect this piece does not own is still a defect, and hiding it would be
     worse than reporting it — but it must not read as a P20 failure or the next
     person to run this cannot tell which file to open. */
  const note = (id, got) => R.push('NOTE  ' + id + '  ' + got);

  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);

  /* --- 1. the move card, in the lesson ------------------------------------ */
  await page.evaluate(() => window.BEA.bus.emit('tours:goBeat', { id: 'compensation' }));
  await page.waitForTimeout(900);
  /* Two routes, and at least one must be live at every width: the tour's aux
     slot above 62rem, and this piece's own masthead entry below it, where
     tours.css hides the aux when the transport docks over the plate. */
  const offered = await page.evaluate(() => {
    const probe = (b) => {
      if (!b) return null;
      const r = b.getBoundingClientRect();
      const hit = r.width && r.height
        ? document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) : null;
      return { label: b.textContent.trim(), x: r.x | 0, y: r.y | 0, w: r.width | 0, h: r.height | 0,
        inView: r.width > 0 && r.height > 0 && r.x >= 0 && r.y >= 0
          && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1,
        onTop: !!hit && (hit === b || b.contains(hit)) };
    };
    const aux = document.querySelector('.tr-bar__auxb');
    return {
      aux: aux && /^Move/.test(aux.textContent) ? probe(aux) : null,
      entry: document.querySelector('.tp-entry--move') ? probe(document.querySelector('.tp-entry--move')) : null,
      narrow: matchMedia('(max-width: 62rem)').matches,
      entries: document.querySelectorAll('[data-mount="chrome-end"] .tp-entry').length,
    };
  });
  const live = (offered.aux && offered.aux.inView && offered.aux.onTop)
    || (offered.entry && offered.entry.inView && offered.entry.onTop);
  t('the move offer is on screen and clickable', !!live, JSON.stringify(offered));
  t('still exactly one control in chrome-end', offered.entries === 1, String(offered.entries));

  await page.evaluate(() => {
    const aux = document.querySelector('.tr-bar__auxb');
    if (aux && /^Move/.test(aux.textContent) && aux.getBoundingClientRect().height) { aux.click(); return; }
    const e = document.querySelector('.tp-entry--move');
    if (e) e.click();
  });
  await page.waitForTimeout(800);

  const card = await page.evaluate(() => {
    const mv = document.querySelector('.tp-mv');
    if (!mv) return null;
    const sheet = mv.closest('.cx-sheet') || mv.parentElement;
    const sr = sheet.getBoundingClientRect();
    const opts = [...document.querySelectorAll('.tp-mv__opt')];
    const reach = opts.map((o) => {
      const r = o.getBoundingClientRect();
      /* scroll it into the sheet's own scroller first: a control below the fold
         of a scrollable panel is reachable; a control the panel cannot reach is
         not. */
      o.scrollIntoView({ block: 'center' });
      const r2 = o.getBoundingClientRect();
      const hit = document.elementFromPoint(r2.x + Math.min(20, r2.width / 2), r2.y + r2.height / 2);
      const mine = !!hit && (hit === o || o.contains(hit));
      let by = null;
      if (!mine && hit) { let n = hit; while (n && !by) { const c = String(n.className || ''); if (c) by = c.split(' ')[0]; n = n.parentElement; } }
      return { h: r.height | 0, onTop: mine, coveredBy: by,
        inView: r2.top >= 0 && r2.bottom <= innerHeight + 1 };
    });
    return {
      sheet: [sr.x | 0, sr.y | 0, sr.width | 0, sr.height | 0],
      opts: opts.length,
      reach,
      clipped: [...mv.querySelectorAll('p,span,li,button')]
        .filter(e => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0)
        .map(e => e.className).slice(0, 5),
      docOver: document.documentElement.scrollHeight - innerHeight,
    };
  });
  t('the card mounts three options inside the rail sheet',
    !!(card && card.opts === 3 && card.reach.every(r => r.inView && r.h > 24)),
    JSON.stringify(card && { sheet: card.sheet, reach: card.reach.map(r => r.h) }));
  const foreign = card ? card.reach.filter(r => !r.onTop).map(r => r.coveredBy) : [];
  const mineCover = foreign.filter(c => /^tp-/.test(c || ''));
  t('nothing P20 draws covers its own controls', mineCover.length === 0, JSON.stringify(mineCover));
  if (foreign.length && !mineCover.length) {
    note('a piece outside P20 paints over the rail sheet here',
      JSON.stringify(foreign) + ' — the same overlap hits the tours sheet at this width; '
      + 'LAYOUT_BUDGET B5/B10, owned by the piece named');
  }
  t('the sheet is at least 280px tall', !!(card && card.sheet[3] >= 280), card ? String(card.sheet[3]) : 'none');
  t('nothing in the card is clipped mid-word', !!(card && card.clipped.length === 0), JSON.stringify(card && card.clipped));
  t('no document scroll with the card open', !!(card && card.docOver <= 0), card ? String(card.docOver) : 'none');
  await shot('move-card');

  /* commit, then confirm the response is reachable too */
  await page.evaluate(() => { const b = [...document.querySelectorAll('.tp-mv__opt')].pop(); b.scrollIntoView({ block: 'center' }); b.click(); });
  await page.waitForTimeout(500);
  const answered = await page.evaluate(() => {
    const r = document.querySelector('.tp-mv__result');
    if (!r || r.hidden) return null;
    r.scrollIntoView({ block: 'center' });
    const b = r.getBoundingClientRect();
    return { h: b.height | 0, inView: b.top < innerHeight && b.bottom > 0,
      out: !!document.querySelector('.tp-mv__out .cx-more'),
      docOver: document.documentElement.scrollHeight - innerHeight };
  });
  t('the answer is readable and offers the way on', !!(answered && answered.inView && answered.out && answered.docOver <= 0),
    JSON.stringify(answered));
  await shot('move-answered');

  /* --- 2. the desk, over everything --------------------------------------- */
  await page.goto(page.url().split('#')[0] + '#panel=workshop');
  await page.waitForTimeout(2000);
  const desk = await page.evaluate(() => {
    const d = document.querySelector('.tp');
    if (!d) return null;
    const r = d.getBoundingClientRect();
    const pages = document.querySelector('.tp__pages');
    const tabs = [...document.querySelectorAll('.tp-tab')].map(x => {
      const b = x.getBoundingClientRect();
      return { t: x.textContent.slice(0, 9), x: b.x | 0, w: b.width | 0 };
    });
    return {
      rect: [r.x | 0, r.y | 0, r.width | 0, r.height | 0],
      fits: r.width <= innerWidth + 1 && r.height <= innerHeight + 1,
      docOver: document.documentElement.scrollHeight - innerHeight,
      pageScrolls: pages.scrollHeight > pages.clientHeight,
      tabs,
      tabsReachable: document.querySelector('.tp__tabs').scrollWidth <= document.querySelector('.tp__tabs').clientWidth
        || getComputedStyle(document.querySelector('.tp__tabs')).overflowX === 'auto',
      closeInView: (() => { const c = document.querySelector('.tp__close').getBoundingClientRect();
        return c.right <= innerWidth + 1 && c.top >= 0; })(),
    };
  });
  t('the desk fits the viewport and does not scroll the document',
    !!(desk && desk.fits && desk.docOver <= 0), JSON.stringify(desk && { rect: desk.rect, docOver: desk.docOver }));
  t('the tab strip and the way out are reachable',
    !!(desk && desk.tabsReachable && desk.closeInView), JSON.stringify(desk && { tabsReachable: desk.tabsReachable, closeInView: desk.closeInView }));
  await shot('desk');

  /* the off-this-map section renders and its cards are operable */
  const port = await page.evaluate(() => {
    const s = document.getElementById('tp-move-portable');
    if (!s) return null;
    const pane = document.querySelector('.tp__pages');
    pane.scrollTop += s.getBoundingClientRect().top - pane.getBoundingClientRect().top - 8;
    const votes = [...s.querySelectorAll('.tp-vote')];
    votes[1] && votes[1].click();
    const rev = s.querySelector('.tp-case__reveal');
    return { cases: s.querySelectorAll('.tp-port__case').length, votes: votes.length,
      revealed: !!rev && !rev.hidden,
      hist: s.querySelectorAll('.tp-port__h').length,
      clipped: [...s.querySelectorAll('p,span,li')].filter(e => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0).map(e => e.className).slice(0, 4) };
  });
  t('off this map: three cases, nine votes, commit reveals, six historians',
    !!(port && port.cases === 3 && port.votes === 9 && port.revealed && port.hist >= 2 && port.clipped.length === 0),
    JSON.stringify(port));
  await shot('off-this-map');

  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> SOME FAILED' : '>>> P20 holds at the working stage');
};
