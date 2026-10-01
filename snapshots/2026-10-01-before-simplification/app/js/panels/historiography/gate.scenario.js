/* Mount the dispute gate exactly the way tours will: emit, read payload.gate,
   put the node in a sheet of the caller's own, and watch for the unlock. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.bus && window.BEA.historiography && document.getElementById('app').dataset.rail, null, { timeout: 20000 });
  await page.waitForTimeout(900);

  const contract = await page.evaluate(() => window.BEA.historiography.contract);
  log('CONTRACT v' + contract.version + ' event=' + contract.event);
  log('pathGates: ' + JSON.stringify(await page.evaluate(() => window.BEA.historiography.pathGates())));

  const ready = await page.evaluate(() => {
    const bus = window.BEA.bus || (window.BEA.ctx && window.BEA.ctx.bus);
    if (!bus) return { err: 'no bus on BEA: ' + Object.keys(window.BEA).join(',') };
    window.__gate = null;
    window.__unlocked = false;
    const payload = {
      beatId: 'nationalisation',
      lede: 'The lesson has just watched a company hand a subcontinent to a Crown. Before you go on, say what to call the thing that made it happen.',
      onReady: (g) => { window.__gate = g; },
      onCommit: (rec) => { window.__unlocked = rec; },
      onOpenFull: (id) => { window.__askedFull = id; },
    };
    bus.emit('ask:disputeGate', payload);
    const g = payload.gate;
    if (!g) return { err: 'payload.gate not written' };
    /* the caller owns the surface: mount into the shell's own sheet */
    bus.emit('ask:sheet', { id: 'tourslike:' + g.id, eyebrow: g.eyebrow, title: g.title, node: g.node });
    return {
      id: g.id, disputeId: g.disputeId, committed: g.committed,
      say: g.say, question: g.question.slice(0, 60),
      positions: g.positions.map(p => p.who),
      after: g.after,
      onReadyFired: !!window.__gate,
    };
  });
  log('READY ' + JSON.stringify(ready));
  await page.waitForTimeout(500);
  const shape = await page.evaluate(() => {
    const root = document.querySelector('.hgx--gate');
    return {
      mounted: !!root,
      chaps: [...(root ? root.querySelectorAll('.hgx-chap') : [])].map(c => c.dataset.label),
      verdict: !!document.querySelector('.hgx-verdict'),
      settle: !!document.querySelector('.hgx-settle'),
      lede: !!root.querySelector('.hgx__lede'),
      pagerHidden: root.querySelector('.hgx-pager').hidden,
    };
  });
  log('MOUNTED ' + JSON.stringify(shape));
  await shot('gate-1');

  /* the verdict must not exist before a commitment */
  log('PRE-COMMIT verdict in DOM: ' + await page.evaluate(() => !!document.querySelector('.hgx-verdict, .hgx-settle')));

  /* walk to decide */
  const paged = await page.evaluate(() => !document.querySelector('.hgx--gate .hgx-pager').hidden);
  log('PAGED: ' + paged);
  if (paged) for (let i = 0; i < 8; i++) {
    const at = await page.evaluate(() => document.querySelector('.hgx--gate .hgx-pager__at').textContent);
    if (/decide/.test(at)) break;
    await page.evaluate(() => document.querySelector('.hgx--gate .hgx-pager [data-dir="1"]').click());
    await page.waitForTimeout(180);
  }
  await shot('gate-decide');

  /* try to commit with too few words */
  const short = await page.evaluate(() => {
    document.querySelector('.hgx--gate .hgx-choice').click();
    const ta = document.querySelector('.hgx--gate textarea[data-hgx="why"]');
    ta.value = 'because'; ta.dispatchEvent(new Event('input', { bubbles: true }));
    return { disabled: document.querySelector('.hgx--gate .hgx-ask__go').disabled,
             need: (document.querySelector('.hgx--gate .hgx-ask__need') || {}).textContent };
  });
  log('SHORT SENTENCE ' + JSON.stringify(short));

  const done = await page.evaluate(() => {
    const ta = document.querySelector('.hgx--gate textarea[data-hgx="why"]');
    ta.value = 'Because Stokes reads the revenue records district by district and that is where the pattern of who rose actually is.';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.hgx--gate .hgx-ask__go').click();
    return true;
  });
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => ({
    unlocked: window.__unlocked,
    verdict: !!document.querySelector('.hgx-verdict'),
    settle: !!document.querySelector('.hgx-settle'),
    chaps: [...document.querySelectorAll('.hgx--gate .hgx-chap')].map(c => c.dataset.label),
    at: (document.querySelector('.hgx--gate .hgx-pager__at') || {}).textContent || '(unpaged)',
    gateCommitted: window.__gate && window.__gate.committed,
  }));
  log('AFTER COMMIT ' + JSON.stringify(after));
  await shot('gate-verdict');

  /* the map coupling */
  for (let i = 0; i < 8 && paged; i++) {
    if (await page.evaluate(() => !!document.querySelector('.hgx--gate .hgx-atlas [data-hgx="atlas"]'))) break;
    await page.evaluate(() => document.querySelector('.hgx--gate .hgx-pager [data-dir="1"]').click());
    await page.waitForTimeout(200);
  }
  const onMap = await page.evaluate(() => {
    const b = document.querySelector('.hgx--gate .hgx-atlas [data-hgx="atlas"]');
    if (!b) return 'no atlas button';
    b.click(); return 'clicked';
  });
  await page.waitForTimeout(700);
  log('ATLAS ' + onMap + ' year=' + await page.evaluate(() => (window.BEA.store ? window.BEA.store.getState().year : 'n/a')));
  await shot('gate-atlas');

  /* the route out of a gate must be the caller's */
  const route = await page.evaluate(() => {
    for (let i = 0; i < 12; i++) {
      const b = document.querySelector('.hgx--gate [data-hgx="open"]');
      if (b) { b.click(); return window.__askedFull || 'clicked but callback not fired'; }
      const n = document.querySelector('.hgx--gate .hgx-pager [data-dir="1"]');
      if (!n || n.disabled || n.closest('.hgx-pager').hidden) return 'no open button found';
      n.click();
    }
    return 'not reached';
  });
  log('OPEN-FULL ROUTE: ' + route);

  /* ======================================================================
     ROUND 3. THE BAND IS MEASURED OFF THE CALLER'S OWN SURFACE.
     A path critic measured `.tr-panel__scroll` at 129px inside a beat while
     the shell's rail attribute said `side`, so a width test could not see it.
     This mounts a gate into a scroller of the caller's own, 140px tall,
     exactly the way a letterboxed beat panel would, and then grows it.
     ================================================================== */
  const R = [];
  const t = (id, ok, got) => { R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got); };

  const rot = await page.evaluate(() => ({
    gates: window.BEA.historiography.pathGates().map((g) => g.after + '→' + g.id),
    egypt: (window.BEA.historiography.gateFor('egypt') || {}).id || null,
    compensation: (window.BEA.historiography.gateFor('compensation') || {}).id || null,
    nationalisation: (window.BEA.historiography.gateFor('nationalisation') || {}).id || null,
    nothing: window.BEA.historiography.gateFor('poster'),
    fallback: window.BEA.historiography.defaultGate(),
    version: window.BEA.historiography.contract.version,
  }));
  log('ROTATION ' + JSON.stringify(rot));
  t('P16-gate-rotation', rot.egypt === 'the-scramble' && rot.compensation === 'irish-famine-intent'
    && rot.nationalisation === 'the-1857-name' && rot.nothing === null
    && rot.fallback === 'the-1857-name' && rot.version >= 2, rot.gates.join(' · '));

  const band = await page.evaluate(async () => {
    /* a caller's surface, letterboxed the way a beat panel is */
    const host = document.createElement('div');
    host.id = 'p16-band-probe';
    host.style.cssText = 'position:fixed;left:0;bottom:0;width:320px;height:140px;'
      + 'overflow-y:auto;z-index:99;background:var(--surface-page,#fff)';
    document.body.appendChild(host);
    const payload = { disputeId: 'the-scramble' };
    window.BEA.bus.emit('ask:disputeGate', payload);
    host.appendChild(payload.gate.node);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const root = () => host.querySelector('.hgx');
    const read = () => {
      const r = root();
      const chaps = [...r.querySelectorAll('.hgx-chap')];
      const shown = chaps.filter((c) => !c.hidden);
      return {
        paged: r.dataset.paged,
        window: host.clientHeight,
        visible: shown.length,
        tallest: Math.max(...shown.map((c) => Math.round(c.getBoundingClientRect().height))),
        pager: !r.querySelector('.hgx-pager').hidden,
      };
    };
    const small = read();
    /* now the student taps the map peek strip away and the panel grows */
    host.style.height = '760px';
    await new Promise((r) => setTimeout(r, 260));
    const big = read();
    host.remove();
    return { small, big };
  });
  log('BAND IN A CALLER SURFACE ' + JSON.stringify(band));
  t('P16-band-short-surface', band.small.paged === 'on' && band.small.visible === 1 && band.small.pager,
    '140px window → ' + band.small.visible + ' chapter, tallest ' + band.small.tallest + 'px');
  /* The shell's own hint still wins where it is true: a bottom sheet is a
     bottom sheet whatever a measurement says, so below 62rem a grown surface
     stays chaptered and that is the contract, not a miss. */
  const sheet = await page.evaluate(() => document.getElementById('app').dataset.rail === 'sheet');
  t('P16-band-grows', sheet ? (band.big.paged === 'on' && band.big.visible === 1)
    : (band.big.paged === 'off' && band.big.visible > 1),
    (sheet ? 'rail=sheet, so 760px window stays chaptered: ' : '760px window → ')
      + band.big.visible + (sheet ? ' chapter' : ' chapters, unchaptered'));

  R.forEach((l) => log(l));
  log(R.some((l) => l.startsWith('FAIL')) ? '>>> P16 GATE BROKEN' : '>>> P16 gate holds');
};
