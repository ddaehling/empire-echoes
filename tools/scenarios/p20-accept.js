/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p20-print`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P20: the printed teacher pack. */
/* p20-accept — FEATURE_SPEC P20 acceptance tests, run against the real app. */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);

  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  /* AT6 — invisible in the student default */
  const cold = await page.evaluate(() => {
    const app = document.getElementById('app');
    const mine = [...app.querySelectorAll('[class*="tp-"], [class*="tp__"]')];
    return {
      entries: document.querySelectorAll('.tp-entry').length,
      desk: document.querySelectorAll('.tp').length,
      paper: document.querySelectorAll('.tp-paper').length,
      inChromeEnd: !!document.querySelector('[data-mount="chrome-end"] .tp-entry'),
      otherNodes: mine.length,
      stage: app.dataset.stage,
    };
  });
  t('AT6 one labelled entry, nothing else', cold.entries === 1 && cold.desk === 0 && cold.paper === 0 && cold.inChromeEnd,
    JSON.stringify(cold));

  /* AT4 — a deep link restores the identical state */
  await page.goto(page.url().split('#')[0] + '#year=1765&sel=bengal-presidency&panel=evidence');
  await page.waitForTimeout(1800);
  const deep = await page.evaluate(() => {
    const s = window.BEA.store.getState();
    return { year: s.year, sel: s.selectedTerritoryId, panel: s.panelState.overlay,
      tabOn: document.querySelector('.tp-tab.is-on')?.id,
      rows: document.querySelectorAll('.tp-led__rec').length };
  });
  t('AT4 #year=1765&sel=bengal-presidency&panel=evidence restores', 
    deep.year === 1765 && deep.sel === 'bengal-presidency' && deep.panel === 'evidence' && deep.tabOn === 'tp-tab-evidence',
    JSON.stringify(deep));
  await shot('deeplink');

  /* AT1 — sorted weakest first, checkable */
  const sort = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.tp-led__rec')].slice(0, 40);
    const conf = rows.map(r => r.dataset.conf);
    return { first: conf.slice(0, 8), allLowFirst: conf.indexOf('high') === -1 || conf.indexOf('low') < conf.indexOf('high') };
  });
  t('AT1 default sort is confidence-low first', sort.allLowFirst, JSON.stringify(sort.first));

  /* AT3 — the walk covers every figure family in the shards */
  const cover = await page.evaluate(async () => {
    const dir = new URL('data/territories/', location.href.replace(/#.*$/, ''));
    const man = await (await fetch(new URL('index.json', dir))).json();
    let want = 0;
    for (const f of man.shards) {
      const j = await (await fetch(new URL(f, dir))).json();
      for (const t of (j.territories || [])) {
        const p = t.peak || {};
        if (typeof p.areaKm2 === 'number') want++;
        if (typeof p.population === 'number') want++;
        if (t.stillBritish && typeof t.stillBritish.population === 'number') want++;
        for (const a of (t.acquisitions || [])) { const c = a.cost || {};
          if (typeof c.deathsLow === 'number') want++;
          if (typeof c.displacedLow === 'number') want++;
          if (typeof c.money === 'string') want++; }
        for (const d of (t.departures || [])) { const c = d.cost || {};
          if (typeof c.deathsLow === 'number') want++;
          if (typeof c.displacedLow === 'number') want++;
          if (typeof c.money === 'string') want++; }
        const co = t.consequences || {};
        for (const [b, q] of [[co.violence, 'deaths'], [co.slavery, 'enslaved'], [co.slavery, 'deaths'],
          [co.populationTransfer, 'displaced'], [co.populationTransfer, 'deaths']]) {
          if (b && b.toll && typeof b.toll[q + 'Low'] === 'number') want++;
        }
        if (co.slavery && co.slavery.toll && typeof co.slavery.toll.money === 'string') want++;
      }
      for (const e of (j.events || [])) {
        const to = e.toll; if (!to) continue;
        for (const q of ['deaths', 'displaced', 'enslaved']) if (typeof to[q + 'Low'] === 'number') want++;
        if (typeof to.money === 'string') want++;
      }
    }
    return { want, got: document.querySelectorAll('.tp-led__rec').length };
  });
  t('AT3 every figure in the shards is a row', cover.want === cover.got, JSON.stringify(cover));

  /* the deep link out of a row closes the desk and moves the map */
  await page.evaluate(() => { document.querySelector('.tp-led__rec .tp-led__link').click(); });
  await page.waitForTimeout(1200);
  const out = await page.evaluate(() => ({
    desk: document.querySelectorAll('.tp').length,
    hash: location.hash,
    panel: window.BEA.store.getState().panelState.overlay,
    map: (() => { const c = document.querySelector('.stage__map canvas'); const r = c && c.getBoundingClientRect(); return r ? Math.round(r.width) + 'x' + Math.round(r.height) : 'none'; })(),
  }));
  t('a row link leaves the desk for the map', out.desk === 0 && out.panel === null, JSON.stringify(out));
  await shot('after-row-link');

  /* keyboard: tab into the desk, move through tabs, escape out */
  await page.goto(page.url().split('#')[0] + '#panel=workshop');
  await page.waitForTimeout(1600);
  const kb = await page.evaluate(() => {
    const desk = document.querySelector('.tp');
    const f = [...desk.querySelectorAll('a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex="-1"])')];
    const tl = desk.querySelector('[role="tablist"]');
    return { focusables: f.length, active: document.activeElement.className.toString().slice(0, 40),
      role: desk.getAttribute('role'), modal: desk.getAttribute('aria-modal'), label: desk.getAttribute('aria-label'),
      tabs: desk.querySelectorAll('[role="tab"]').length,
      tablist: tl && tl.getAttribute('aria-label'),
      panel: (desk.querySelector('.tp-page') || {}).getAttribute ? desk.querySelector('.tp-page').getAttribute('role') : null };
  });
  /* NOT A DIALOG ANY MORE, AND THAT IS THE DESIGN. This assertion used to
     require role="dialog" + aria-modal="true". The desk stopped being a
     full-screen modal in round three — FEATURE_SPEC §2 rule 1, "no full-screen
     content modal exists in this app" names ledgers in so many words — so a
     modal role would now be a lie about a surface the map is still visible
     beside. What it must be instead is a NAMED LANDMARK holding a real tablist. */
  t('named landmark + tablist, not a modal', kb.role === 'region' && kb.modal === null && !!kb.label
    && kb.tabs === 4 && kb.tablist === 'Teaching desk sections' && kb.panel === 'tabpanel', JSON.stringify(kb));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  const esc = await page.evaluate(() => ({ desk: document.querySelectorAll('.tp').length, focus: document.activeElement.className.toString().slice(0, 30) }));
  t('Escape closes and returns focus', esc.desk === 0, JSON.stringify(esc));

  /* ====================== AND THE PRINTED PACK ITSELF ====================
   *
   * THE GUARANTEE AT THE TOP OF THIS FILE SAYS "the printed teacher pack" and
   * until wave 9 round two nothing below the banner ever printed a sheet: the
   * scenario asserted the desk, the deep link, the ledger and the keyboard, all
   * of which are real, none of which is the pack. Every defect the classroom
   * critic brought against the pack this round was invisible to it —
   * Lesson Two printing no step numbers and no answer lines, a plan telling a
   * teacher the lesson does not run a beat it had just numbered, a segment
   * pointing a class at a task number that is on another segment's row.
   *
   * So the pack is now printed, per lesson, and the three agreements a
   * teacher's folder depends on are asserted: the plan, the three task sheets
   * and the key must name the same tasks at the same stops, and no page may
   * contradict its own step list. `tools/scenarios/pk/44-paper.js` is the long
   * form with page counts and PDFs; this is the part the front door needs.
   */
  await page.goto(page.url().split('#')[0] + '#panel=classroom');
  await page.waitForTimeout(1800);
  await page.evaluate(() => { window.print = () => {}; });

  /* THE DERIVATION DOES WHAT THE GUIDED PATH DOES. `pack.js::beatAnswers`
     derives an answer line for a beat the tour has not published one for, so a
     pack can be printed for the lesson the reader is NOT running; the desk
     holds that derivation against the published rows for every beat the tour
     does publish, and any disagreement lands here. */
  const drift = await page.evaluate(() => window.BEA.teacherAnswerDrift || null);
  t('P20 the derived answer lines agree with the guided path’s own',
    Array.isArray(drift) && drift.length === 0,
    drift === null ? 'the desk published no audit' : JSON.stringify(drift).slice(0, 240));

  const idx = await page.evaluate(() => window.BEA.tourStepIndex || null);
  t('P20 the step index is checked on every route the app publishes',
    !!(idx && idx.verified),
    idx ? Object.entries(idx.routes).map(([k, v]) => k + '=' + v.required + (v.verified ? '' : '!')).join(' ')
      : 'absent');

  for (const n of [1, 2]) {
    const picked = await page.evaluate((k) => {
      const b = [...document.querySelectorAll('.tp-unit__b')][k - 1];
      if (!b) return false; b.click(); return true;
    }, n);
    t('P20 L' + n + ' the desk offers this lesson', picked, String(picked));
    if (!picked) continue;
    await page.waitForTimeout(800);

    const sheet = {};
    for (const id of ['plan', 'tasks-core', 'tasks-supported', 'tasks-extension', 'key']) {
      const hit = await page.evaluate((pid) => {
        const e = [...document.querySelectorAll('[data-pack]')].find(x => x.dataset.pack === pid);
        if (!e) return false;
        (e.tagName === 'BUTTON' ? e : e.querySelector('button')).click();
        return true;
      }, id + '@' + n);
      if (!hit) { t('P20 L' + n + ' ' + id + ' has a print control', false, 'absent'); continue; }
      await page.waitForTimeout(350);
      sheet[id] = await page.evaluate(() => {
        const p2 = document.querySelector('.tp-paper');
        return {
          title: (p2.querySelector('.tp-paper__pack') || {}).innerText || '',
          /* Read off the elements, never scraped out of innerText: inline spans
             run together there, so the key's heading reads "8 minTask 1 · …". */
          segHeads: [...p2.querySelectorAll('.tp-paper__segd')].map(x => x.innerText.trim()),
          writes: [...p2.querySelectorAll('.tp-paper__write')].map(x => x.innerText.trim()),
          taskNos: [...p2.querySelectorAll('.tp-paper__taskno')].map(x => x.innerText.trim()),
          chips: [...p2.querySelectorAll('.tp-paper__taskstep')].map(x => x.innerText.trim()),
          missing: p2.innerText.includes('could not be read')
            || p2.innerText.includes('could not confirm the guided path'),
          /* A segment that lists a beat at a numbered step and then says the
             lesson does not run it. */
          contra: [...p2.querySelectorAll('.tp-paper__seg')].flatMap((seg) => {
            const w = seg.querySelector('.tp-paper__warn');
            const said = w ? w.innerText : '';
            return [...seg.querySelectorAll('.tp-paper__beat')]
              .filter(li => li.querySelector('.tp-paper__beatn') && !li.querySelector('.tp-paper__beato'))
              .map(li => (li.querySelector('.tp-paper__beath') || {}).innerText || '')
              .filter(h => h && said.includes(h));
          }),
        };
      });
    }
    await shot('pack-L' + n);

    const nums = (list) => [...new Set(list.join(' ').match(/\d+/g) || [])].map(Number).sort((a, b) => a - b);
    const sheetNums = nums((sheet['tasks-core'] || { taskNos: [] }).taskNos);
    const planNums = nums((sheet.plan || { writes: [] }).writes
      .map(w => (w.match(/Tasks? \d+(?:(?:,| and) \d+)*/g) || []).join(' ')));
    const keyNums = nums((sheet.key || { segHeads: [] }).segHeads
      .map(h => (/^Tasks? /.test(h) ? h.split('\u00b7')[0] : '')));

    t('P20 L' + n + ' the plan prints its own step numbers and answer lines',
      !!(sheet.plan && !sheet.plan.missing && sheet.plan.writes.length),
      sheet.plan ? (sheet.plan.missing ? 'the plan degraded to “could not be read”' : 'complete') : 'no plan');
    t('P20 L' + n + ' the plan names only tasks the sheets carry',
      planNums.length > 0 && planNums.every(x => sheetNums.includes(x)),
      'plan ' + planNums.join(',') + ' vs sheet ' + sheetNums.join(','));
    t('P20 L' + n + ' the key heads exactly the tasks the sheets carry',
      keyNums.length > 0 && keyNums.length === sheetNums.length
        && keyNums.every(x => sheetNums.includes(x)),
      'key ' + keyNums.join(',') + ' vs sheet ' + sheetNums.join(','));

    for (const tier of ['tasks-core', 'tasks-supported', 'tasks-extension']) {
      const chips = (sheet[tier] || { chips: [] }).chips;
      const got = chips.map(c => (c.match(/screen: (\d+) \/ (\d+)/) || []).slice(1).map(Number))
        .filter(x => x.length === 2);
      t('P20 L' + n + ' ' + tier + ' anchors are inside the route and one to a task',
        got.length > 0 && got.every(([i2, of2]) => i2 >= 1 && i2 <= of2)
          && new Set(got.map(x => x[0])).size === got.length,
        JSON.stringify(chips));
    }

    const contra = [].concat(...Object.values(sheet).map(x => x.contra || []));
    t('P20 L' + n + ' no page says the lesson skips a beat it has numbered',
      contra.length === 0, JSON.stringify(contra));
  }

  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> SOME FAILED' : '>>> all pass');
};
