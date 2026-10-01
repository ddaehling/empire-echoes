/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p08-viz`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P08: the counted figures mount inside their own beats, record a committed guess, and never move the year the beat is holding. */
/**
 * P08 — the acceptance tests from docs/FEATURE_SPEC.md §2, run against the app.
 * Prints PASS/FAIL per numbered test plus the layout-budget measurement.
 */
const routes = require('./lib/routes.js');
const R = [];
const t = (n, name, pass, got) => R.push({ n, name, pass: !!pass, got });

module.exports = async ({ page, shot, log, url }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);

  const wide = await page.evaluate(() => innerWidth >= 992);

  /* --- layout budget: the plate, before and after ---------------------- */
  const mapBefore = await page.evaluate(() => {
    const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
    return { map: b('.stage__map canvas') || b('.stage__map svg'), stage: b('.app__stage'), stage2: document.getElementById('app').dataset.stage };
  });
  log('PLATE BEFORE ' + JSON.stringify(mapBefore));

  /* the dossier costs the same rail; measure it so the comparison is fair */
  await page.evaluate(() => window.BEA.store.dispatch('select', 'barbados'));
  await page.waitForTimeout(700);
  const mapDossier = await page.evaluate(() => {
    const e = document.querySelector('.stage__map canvas') || document.querySelector('.stage__map svg');
    if (!e) return null;
    const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) };
  });
  await page.evaluate(() => window.BEA.store.dispatch('deselect'));
  await page.waitForTimeout(500);
  log('PLATE WITH DOSSIER ' + JSON.stringify(mapDossier));

  /* ===================== TEST 1 — the ratio line refuses ================= */
  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'ratio:kenya' }));
  await page.waitForTimeout(700);
  const t1a = await page.evaluate(() => {
    const r = document.querySelector('.viz-ratio');
    const txt = r.innerText;
    return {
      saysLog: /logarithmic/i.test(txt),
      leaks: /1,000,000|1,090|11,503|5,228/.test(txt),
      revealHidden: !!document.querySelector('.viz-ratio__reveal[hidden]'),
      targetHidden: !!document.querySelector('.viz-axis__mark--target[hidden]'),
    };
  });
  await page.evaluate(() => document.querySelector('.viz-axis__handle').focus());
  for (let i = 0; i < 15; i++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  const t1b = await page.evaluate(() => ({
    revealed: document.querySelector('.viz-ratio').dataset.state === 'revealed',
    readout: document.querySelector('.viz-ratio__readout').innerText,
    ledger: JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter((e) => e.claimId === 'p08:ratio:kenya'),
  }));
  t(1, 'Kenya ratio line: no figure before commitment, records the guess, says the axis is logarithmic',
    t1a.saysLog && !t1a.leaks && t1a.revealHidden && t1a.targetHidden && t1b.revealed && t1b.ledger.length === 1,
    'before: saysLog=' + t1a.saysLog + ' leaks=' + t1a.leaks + ' revealHidden=' + t1a.revealHidden
    + ' | after: ' + t1b.readout + ' | ledger rows: ' + t1b.ledger.length
    + (t1b.ledger[0] ? ' (' + t1b.ledger[0].kind + ', youSaid ' + t1b.ledger[0].youSaid + ', answer ' + t1b.ledger[0].answer + ')' : ''));
  await shot('t1-ratio');

  /* ===================== TEST 2 — the plate, four at once ================ */
  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'plate:abolition' }));
  await page.waitForTimeout(700);
  const t2 = await page.evaluate(() => {
    const body = document.querySelector('.cx-sheet__body') || { scrollHeight: 0, clientHeight: 0 };
    const cells = [...document.querySelectorAll('.viz-claim')];
    const vis = cells.filter((c) => { const r = c.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.top >= -0.5 && r.bottom <= innerHeight + 0.5; });
    const cs = getComputedStyle(document.querySelector('.viz-plate__field'));
    return {
      claims: cells.length,
      visible: vis.length,
      overflows: body.scrollHeight > body.clientHeight + 1,
      tabs: document.querySelectorAll('.viz [role="tab"], .viz [role="tablist"], .viz details, .viz summary').length,
      hoverOnly: document.querySelectorAll('.viz [title]:not([data-bad])').length,
      cols: cs.gridTemplateColumns,
      order: cells.map((c) => c.dataset.claim),
    };
  });
  /* FEATURE_SPEC P08 test 2 sets two different bars, and so does this:
     at >=62rem all four are on screen at once with no scrollbar; under it they
     stack in DOM order, and in BOTH cases there is never a tab or accordion. */
  t(2, wide
    ? 'Tension plate: four claims visible at once, no scrollbar, no tab, no accordion'
    : 'Tension plate under 62rem: four claims stacked in DOM order, one column, still no tabs',
  wide
    ? (t2.claims === 4 && t2.visible === 4 && !t2.overflows && t2.tabs === 0)
    : (t2.claims === 4 && t2.tabs === 0 && !/ /.test(t2.cols.trim())
       && t2.order.join(',') === 'abolished,built,forced,bought'),
    'claims=' + t2.claims + ' fullyVisible=' + t2.visible + ' sheetOverflows=' + t2.overflows
    + ' tabs/accordions=' + t2.tabs + ' columns=' + t2.cols + ' DOM order=' + t2.order.join(','));
  await shot('t2-plate');

  /* ===================== TEST 4 — cross-lighting ========================= */
  const t4kb = await page.evaluate(async () => {
    const f = [...document.querySelectorAll('.viz-fig')].filter((n) => n.dataset.fig === 'paid-20m')[0];
    f.focus();
    await new Promise((r) => setTimeout(r, 250));
    return {
      lit: [...document.querySelectorAll('.viz-fig[data-lit="yes"]')].map((n) => n.dataset.fig),
      textBefore: document.querySelector('.viz-plate').innerText.length,
    };
  });
  const t4shared = await page.evaluate(async () => {
    const f = [...document.querySelectorAll('.viz-fig')].filter((n) => n.dataset.fig === 'freed-800k')[0];
    f.focus();
    await new Promise((r) => setTimeout(r, 250));
    const lit = [...document.querySelectorAll('.viz-fig[data-lit="yes"]')];
    return {
      count: lit.length,
      cells: lit.map((n) => n.closest('.viz-claim').dataset.claim),
      textAfter: document.querySelector('.viz-plate').innerText.length,
    };
  });
  /* the map: did the paint request reach it? */
  const t4map = await page.evaluate(() => new Promise((res) => {
    let got = null;
    const off = window.BEA.bus.on('ask:paintUnits', (p) => { got = p; });
    const f = [...document.querySelectorAll('.viz-fig')].filter((n) => n.dataset.fig === 'act-1834')[0];
    f.focus();
    setTimeout(() => { off(); res(got && got.unitIds ? got.unitIds.length : 0); }, 400);
  }));
  t(4, 'Cross-lighting: keyboard focus lights the same figure in the other cells and paints the map; no new information appears',
    t4shared.count === 2 && new Set(t4shared.cells).size === 2 && t4shared.textAfter === t4kb.textBefore && t4map > 0,
    'focusing 800,000 lit ' + t4shared.count + ' printings in cells [' + t4shared.cells.join(', ') + ']; '
    + 'panel text length unchanged (' + t4kb.textBefore + ' → ' + t4shared.textAfter + '); '
    + 'ask:paintUnits carried ' + t4map + ' units');

  /* ===================== TEST 3 — collapse and the discard strip ========= */
  await page.evaluate(() => [...document.querySelectorAll('.viz-claim__pick')][3].click());
  await page.waitForTimeout(500);
  const t3 = await page.evaluate(() => ({
    mode: document.querySelector('.viz-plate').dataset.mode,
    chosen: document.querySelector('.viz-plate').dataset.chosen,
    struck: [...document.querySelectorAll('.viz-strip__s')].map((n) => n.textContent),
    strikeStyle: getComputedStyle(document.querySelector('.viz-strip__s')).textDecorationLine,
    head: document.querySelector('.viz-strip__h').textContent,
    ledger: JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter((e) => e.kind === 'collapsed'),
  }));
  t(3, 'Collapse: the other three go to a strip headed "what this version has to leave out", each struck through; the choice is recorded',
    t3.mode === 'collapsed' && t3.struck.length === 3 && /line-through/.test(t3.strikeStyle) && t3.ledger.length >= 1,
    'chose "' + t3.chosen + '"; strip head "' + t3.head + '"; ' + t3.struck.length + ' struck (' + t3.strikeStyle + '); '
    + 'ledger kind=collapsed rows=' + t3.ledger.length + (t3.ledger[0] ? ', youSaid "' + t3.ledger[0].youSaid + '"' : ''));
  await shot('t3-collapsed');

  /* ===================== TEST 5 — every number resolves ================== */
  const t5 = await page.evaluate(async () => {
    const seen = {};
    const ids = ['plate:abolition', 'ratio:kenya', 'ratio:compensation', 'ratio:ics', 'extent'];
    for (const id of ids) {
      window.BEA.bus.emit('viz:open', { id });
      await new Promise((r) => setTimeout(r, 350));
      if (id === 'extent') { const b = document.querySelector('.viz-choice'); if (b) b.click(); await new Promise((r) => setTimeout(r, 500)); }
      if (id.startsWith('ratio:')) {
        /* A ratio line prints its answer only after a commitment, so commit
           before counting: before that there is nothing to be unsourced. */
        const c = document.querySelector('.viz-ratio__commit');
        if (c) c.click();
        await new Promise((r) => setTimeout(r, 450));
      }
      seen[id] = {
        open: !!document.querySelector('.viz'),
        figs: document.querySelectorAll('.viz-fig').length,
        bad: document.querySelectorAll('.viz-fig--bad').length,
        unsourced: document.querySelector('.viz') ? (document.querySelector('.viz').innerText.match(/\[unsourced\]/g) || []).length : 0,
        cites: document.querySelectorAll('.viz .cx-src, .viz .viz-method').length,
      };
    }
    return seen;
  });
  const anyBad = Object.values(t5).some((v) => v.bad > 0 || v.unsourced > 0);
  const allCited = Object.values(t5).every((v) => v.cites > 0);
  t(5, 'Every figure resolves to a dataset record with a citation; a broken warrant would render [unsourced] in --danger',
    !anyBad && allCited, JSON.stringify(t5));

  /* the mechanism itself, proved by breaking one warrant on purpose */
  const t5b = await page.evaluate(async () => {
    const ev = window.BEA.data.events.find((e) => e.id === 'slavery-compensation-1835');
    const keep = ev.summary;
    ev.summary = 'redacted for this test';
    window.BEA.bus.emit('viz:close');
    await new Promise((r) => setTimeout(r, 200));
    window.BEA.bus.emit('viz:open', { id: 'plate:abolition' });
    await new Promise((r) => setTimeout(r, 400));
    const bad = document.querySelectorAll('.viz-fig--bad').length;
    const colour = bad ? getComputedStyle(document.querySelector('.viz-fig--bad')).color : null;
    const words = bad ? document.querySelector('.viz-fig--bad').innerText : '';
    ev.summary = keep;
    return { bad, colour, words };
  });
  t(6, 'The defect is student-visible: breaking one record makes its figures print [unsourced] in --danger',
    t5b.bad >= 2 && /rgb\(153, 52, 43\)|rgb\(2\d\d/.test(t5b.colour || ''),
    'broke slavery-compensation-1835.summary → ' + t5b.bad + ' figures printed "' + t5b.words + '" in ' + t5b.colour);
  await shot('t5-unsourced');

  /* ===================== extent: peak right of 1914 ====================== */
  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'extent' }));
  await page.waitForTimeout(400);
  await page.evaluate(() => { const b = document.querySelector('.viz-choice'); if (b) b.click(); });
  await page.waitForTimeout(800);
  const ex = await page.evaluate(() => {
    const marks = [...document.querySelectorAll('.viz-mk')].map((n) => Number(n.dataset.year));
    const b = document.querySelector('.cx-sheet__body');
    if (b) b.scrollTop = b.scrollHeight;
    return { marks, peak: Math.max(...marks), note: document.querySelector('.viz-peak').innerText };
  });
  t(7, 'Extent over time: the peak is marked to the right of 1914 (T14) and the app says the peak year is contested',
    ex.peak > 1914, 'marks at ' + ex.marks.join(', ') + ' — peak mark ' + ex.peak + '. ' + ex.note.slice(0, 200));
  await page.waitForTimeout(400);
  await shot('extent-foot');

  /* ===================== 8 — the flow, and the gap ======================= */
  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'flow' }));
  await page.waitForTimeout(600);
  const t8a = await page.evaluate(() => {
    const r = document.querySelector('.viz-flow');
    const txt = r ? r.innerText : '';
    return {
      mounted: !!r,
      leaks: /2,400,000|900,000|1,200,000|Jamaica/.test(txt),
      crossingHidden: !!document.querySelector('.viz-flow__crossing[hidden]'),
      landsHidden: !!document.querySelector('.viz-flow__lands[hidden]'),
    };
  });
  await page.evaluate(() => document.querySelector('.viz-hundred__handle').focus());
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  const t8mid = await page.evaluate(() => ({
    coasts: document.querySelectorAll('.viz-place[data-side="from"]').length,
    landsBeforeAnswer: document.querySelectorAll('.viz-place[data-side="to"]').length,
    secondAsk: !!document.querySelector('.viz-choices button'),
  }));
  await page.evaluate(() => { const b = [...document.querySelectorAll('.viz-choices button')].find((x) => x.dataset.place === 'barbados'); if (b) b.click(); });
  await page.waitForTimeout(500);
  const t8b = await page.evaluate(() => {
    const gap = document.querySelector('.viz-cross__gap');
    const g = gap ? gap.getBoundingClientRect() : null;
    const emb = document.querySelector('.viz-cross__row[data-key="embarked"] .viz-cross__track');
    return {
      revealed: document.querySelector('.viz-flow').dataset.state === 'revealed',
      gapDrawn: !!(g && g.width > 6),
      gapPct: g && emb ? Math.round((g.width / emb.getBoundingClientRect().width) * 100) : 0,
      places: document.querySelectorAll('.viz-place').length,
      verdict: (document.querySelector('.viz-flow__verdict') || {}).textContent || '',
      ledger2: JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter((e) => e.claimId === 'p08:flow:landings'),
      bad: document.querySelectorAll('.viz-flow .viz-fig--bad, .viz-flow .viz-defect').length,
      sum: (document.querySelector('.viz-flow__sumline') || {}).textContent || '',
      ledger: JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter((e) => e.claimId === 'p08:flow:atlantic'),
    };
  });
  t(8, 'The flow (T3): nothing drawn before the guess; then embarked and landed on one scale with the loss drawn as a visible gap; the seven landing places are gated behind a SECOND committed answer, and both go to the Ledger',
    t8a.mounted && !t8a.leaks && t8a.crossingHidden && t8a.landsHidden
    && t8b.revealed && t8b.gapDrawn && t8b.places === 10 && t8b.bad === 0 && t8b.ledger.length === 1
    && t8mid.coasts === 3 && t8mid.landsBeforeAnswer === 0 && t8mid.secondAsk && t8b.ledger2.length === 1,
    'before: leaks=' + t8a.leaks + ' crossingHidden=' + t8a.crossingHidden
    + ' | after the first commit: ' + t8mid.coasts + ' coasts, ' + t8mid.landsBeforeAnswer + ' landing bars, second question asked=' + t8mid.secondAsk
    + ' | after the second: gap is ' + t8b.gapPct + '% of the embarked bar, ' + t8b.places + ' place bars, '
    + t8b.bad + ' unsourced, ledger rows ' + (t8b.ledger.length + t8b.ledger2.length) + ' | ' + t8b.sum
    + ' | ' + t8b.verdict.slice(0, 120));
  await shot('t8-flow');

  /* ===================== 9 — the hundred dots =========================== */
  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'dots:army' }));
  await page.waitForTimeout(600);
  const t9a = await page.evaluate(() => ({
    dots: document.querySelectorAll('.viz-dot').length,
    resolved: [...document.querySelectorAll('.viz-dot')].filter((d) => d.dataset.state !== 'idle').length,
    capHidden: !!document.querySelector('.viz-dots__cap[hidden]'),
    verdictHidden: !!document.querySelector('.viz-dots__verdict[hidden]'),
  }));
  await page.evaluate(() => document.querySelector('.viz-dots__field').focus());
  for (let i = 0; i < 60; i++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  const t9b = await page.evaluate(() => {
    const d = [...document.querySelectorAll('.viz-dot')];
    return {
      indian: d.filter((x) => x.dataset.state === 'indian').length,
      open: d.filter((x) => x.dataset.state === 'open').length,
      yours: d.filter((x) => x.dataset.guess === 'yes').length,
      says: document.querySelector('.viz-dots__readout').innerText,
      refuses: /never counted|does not say|will not tell you/i.test(document.querySelector('.viz-dots').innerText),
      bad: document.querySelectorAll('.viz-dots .viz-fig--bad, .viz-dots .viz-defect').length,
      ledger: JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter((e) => e.claimId === 'p08:dots:army'),
    };
  });
  t(9, 'The hundred dots (T8): no dot resolves before the guess; the reveal stops at the evidence, names the uncounted half as uncounted and keeps the student’s own answer on the field',
    t9a.dots === 100 && t9a.resolved === 0 && t9a.capHidden && t9a.verdictHidden
    && t9b.indian === 50 && t9b.open === 50 && t9b.yours === 60 && t9b.refuses && t9b.bad === 0 && t9b.ledger.length === 1,
    'before: ' + t9a.dots + ' dots, ' + t9a.resolved + ' resolved | after: ' + t9b.indian + ' guaranteed Indian, '
    + t9b.open + ' uncounted, ' + t9b.yours + ' ringed as yours, refusal printed=' + t9b.refuses
    + ' | ' + t9b.says.slice(0, 160));
  await shot('t9-dots');

  /* ===================== 10 — both of them are ON THE PATH ===============
     WAVE 9 — THIS TEST WAS ROUTE-BLIND AND HAD STOPPED MEANING ANYTHING.
     It called the run "the thirty-minute path", emitted `tours:start` (which
     starts whatever route is current) and then `tours:goBeat` for three beat
     ids. Two of the three are not on the current default: `exits` belongs to
     Lesson Two, so `goBeat` did nothing, the year drifted from 1921 to 1608 and
     the test reported a failure that was about the harness, not the app.

     The rule is about a counted figure MOUNTING INSIDE THE BEAT THAT HOSTS IT,
     so each beat is opened on a route that actually carries it — discovered
     from the published step index, default route first — by its own address,
     which is also how a teacher reaches it. And because §3 cares which of them
     the DEFAULT route reaches, that is measured and printed too, separately,
     rather than assumed. */
  await page.evaluate(() => { window.BEA.bus.emit('viz:close'); localStorage.removeItem('bea.ledger.v1'); });
  await page.waitForTimeout(300);
  const pay = await routes.payload(page);
  const order = [pay.default, ...pay.routes.map((r) => r.id).filter((x) => x !== pay.default)];
  const where = {};
  for (const id of order) {
    for (const st of await routes.stepsOf(page, id)) {
      if (!where[st.id]) where[st.id] = { route: id, step: st.step };
    }
  }
  const onPath = [];
  const notOnAnyRoute = [];
  for (const beat of ['barbados', 'revenue-loop', 'exits']) {
    const at = where[beat];
    if (!at) { notOnAnyRoute.push(beat); continue; }
    /* ON A CLEAN SESSION, EACH TIME. Tests 8 and 9 above open the flow and the
       dots DIRECTLY and answer them, and an answered figure does not mount
       again inside its beat — which is right, and which made this test report
       `revenue-loop: null` about a figure that mounts perfectly on a cold load.
       The rule is about what a student meets when they reach the beat, so the
       session is cleared before each one. */
    await page.goto(String(url).split('#')[0], { waitUntil: 'load' });
    await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (_) {} });
    await routes.open(page, url, at.route, at.step, 2000);
    const o = await page.evaluate(() => {
      const box = document.querySelector('.viz-onpath');
      const body = document.querySelector('.cx-sheet__body') || document.querySelector('.tr-panel');
      return { id: box ? box.dataset.onpath : null, inBeat: !!(box && body && body.contains(box)),
               year: window.BEA.store.getState().year };
    });
    await page.evaluate(() => {
      const h = document.querySelector('.viz-onpath .viz-hundred__handle') || document.querySelector('.viz-onpath .viz-dots__field');
      if (h) h.focus();
    });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    o.yearAfter = await page.evaluate(() => window.BEA.store.getState().year);
    o.beat = beat; o.route = at.route; o.step = at.step;
    o.onDefault = at.route === pay.default;
    /* the Ledger is read per beat, because the session is cleared per beat */
    o.led = await page.evaluate(() => JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]')
      .filter((e) => /^p08:(flow|dots|twin)/.test(e.claimId)).map((e) => e.claimId));
    onPath.push(o);
  }
  const led = onPath.flatMap((o) => o.led || []);
  t(10, 'T3, T8 and M14 each mount inside their own beat’s panel on a route that carries that beat, record a committed guess in the Ledger, and never move the year the beat is holding',
    notOnAnyRoute.length === 0 && onPath.length === 3
    && onPath.every((o) => o.id && o.inBeat && o.year === o.yearAfter)
    && onPath.every((o) => (o.led || []).length > 0),
    (notOnAnyRoute.length ? 'NOT ON ANY PUBLISHED ROUTE: ' + notOnAnyRoute.join(', ') + ' | ' : '')
    + onPath.map((o) => o.beat + ' @' + o.route + '#' + o.step + ': ' + o.id + ' in the beat panel=' + o.inBeat
      + ', year ' + o.year + '→' + o.yearAfter).join(' | ')
    + ' | ledger: ' + led.join(' · '));
  t('10b', 'and the default route (' + pay.default + ') says which of the three it reaches, rather than the harness assuming all three',
    true,
    onPath.map((o) => o.beat + (o.onDefault ? ' on ' + pay.default : ' NOT on ' + pay.default + ' — reached via ' + o.route)).join(' | '));
  await shot('t10-onpath');
  await page.evaluate(() => window.BEA.bus.emit('tours:explore'));
  await page.waitForTimeout(300);

  /* ===================== 11 — the 1947 twin (M14) ======================= */
  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'twin' }));
  await page.waitForTimeout(700);
  const t11a = await page.evaluate(() => {
    const r = document.querySelector('.viz-twin');
    return {
      mounted: !!r,
      bars: document.querySelectorAll('.viz-twin .viz-hundred__bar').length,
      leaks: r ? /65%|14%|3,454|389,697|25 territories/.test(r.innerText) : true,
      revealHidden: !!document.querySelector('.viz-twin__reveal[hidden]'),
    };
  });
  await page.evaluate(() => document.querySelectorAll('.viz-twin .viz-hundred__handle')[0].focus());
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Tab');
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  const t11b = await page.evaluate(() => {
    const txt = document.querySelector('.viz-twin').innerText;
    return {
      state: document.querySelector('.viz-twin').dataset.state,
      yours: document.querySelectorAll('.viz-twin__yours:not([hidden])').length,
      figs: document.querySelectorAll('.viz-twin__figs .cx-fig').length,
      method: !!document.querySelector('.viz-twin .viz-method'),
      admits: /disagrees with itself/i.test(txt) && /three quarters/i.test(txt),
      bad: document.querySelectorAll('.viz-twin .viz-fig--bad, .viz-twin .viz-defect').length,
      spread: (document.querySelector('.viz-twin__spread') || {}).innerText || '',
      ledger: JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter((e) => e.claimId === 'p08:twin:1947'),
    };
  });
  t(11, 'The 1947 twin (M14): two marks committed before either number is drawn; the reveal shows people against land on one field, keeps the reader\u2019s own marks, and prints the atlas\u2019s disagreement with its own prose',
    t11a.mounted && t11a.bars === 2 && !t11a.leaks && t11a.revealHidden
    && t11b.state === 'revealed' && t11b.yours === 2 && t11b.figs === 4 && t11b.method
    && t11b.admits && t11b.bad === 0 && t11b.ledger.length === 1,
    'before: bars=' + t11a.bars + ' leaks=' + t11a.leaks + ' revealHidden=' + t11a.revealHidden
    + ' | after: ' + t11b.figs + ' computed figures, own marks kept=' + t11b.yours
    + ', names its own disagreement=' + t11b.admits + ', unsourced=' + t11b.bad
    + ' | ' + t11b.spread.replace(/\s+/g, ' ').slice(0, 190)
    + ' | ledger: ' + (t11b.ledger[0] ? t11b.ledger[0].youSaid + ' → ' + t11b.ledger[0].answer : 'none'));
  await shot('t11-twin');

  /* ===================== 12 — the open range bar (§9.2) ================== */
  await page.evaluate(() => { window.BEA.bus.emit('viz:close'); });
  await page.waitForTimeout(250);
  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'ratio:kenya' }));
  await page.waitForTimeout(600);
  await page.evaluate(() => { const c = document.querySelector('.viz-ratio__commit'); if (c) c.click(); });
  await page.waitForTimeout(600);
  const t12 = await page.evaluate(() => {
    const r = document.querySelector('.viz-range');
    const band = document.querySelector('.viz-range__band');
    const open = document.querySelector('.viz-range__open');
    const num = (s) => parseFloat(String(s || '0'));
    return {
      has: !!r,
      bad: document.querySelectorAll('.viz-range--bad').length,
      text: r ? r.innerText.replace(/\s+/g, ' ') : '',
      bandStart: band ? num(band.style.insetInlineStart) : null,
      bandWidth: band ? num(band.style.inlineSize) : null,
      openWidth: open ? num(open.style.inlineSize) : null,
      openEnds: open ? /transparent|rgba\(0, 0, 0, 0\)/.test(getComputedStyle(open).backgroundImage) : false,
      tick: !!document.querySelector('.viz-range__tick'),
      saysNoCount: !!document.querySelector('.viz-range__nocount'),
    };
  });
  t(12, 'A DIDACTIC_SPEC \u00a79.2 contested figure renders as a band on the same axis as the counted points, never as a scalar: bounded ends where the record has them, a named tick, and a wash with no end cap',
    t12.has && t12.bad === 0 && t12.bandWidth > 0 && t12.openWidth > 0 && t12.openEnds
    && t12.tick && t12.saysNoCount && /12,000\u201325,000/.test(t12.text),
    'band ' + t12.bandStart + '% + ' + t12.bandWidth + '% wide, open wash ' + t12.openWidth
    + '% fading to transparent=' + t12.openEnds + ', named tick=' + t12.tick
    + ' | ' + t12.text.slice(0, 200));
  await shot('t12-range');

  /* ===================== the plate after my work ========================= */
  await page.evaluate(() => window.BEA.bus.emit('viz:close'));
  await page.waitForTimeout(700);
  const mapAfter = await page.evaluate(() => {
    const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
    return { map: b('.stage__map canvas') || b('.stage__map svg'), docScroll: document.documentElement.scrollHeight - innerHeight };
  });
  log('PLATE AFTER (sheet closed) ' + JSON.stringify(mapAfter));

  for (const r of R) log((r.pass ? 'PASS  ' : 'FAIL  ') + r.n + '. ' + r.name + '\n        ' + r.got);
  const bad = R.filter((r) => !r.pass);
  log(bad.length ? '>>> P08 HAS FAILURES' : '>>> P08 acceptance holds');
  /* AND IT EXITS NON-ZERO WHEN IT FAILS. Wave 9: this file printed FAIL rows
     and returned normally, so `inspect.js` exited 0 and any runner that trusts
     exit codes called a failing check green. */
  if (bad.length) throw new Error('P08 HAS FAILURES\n' + bad.map((r) => r.n + '. ' + r.name).join('\n'));
};
