/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p07-search.js — the executable form of FEATURE_SPEC §2 P07's five acceptance
 * tests, plus the keyboard and layout claims the piece makes about itself.
 *
 *   node tools/inspect.js tools/scenarios/p07-search.js --out /tmp/p07
 *   node tools/inspect.js tools/scenarios/p07-search.js --out /tmp/p07 --mobile
 *   node tools/inspect.js tools/scenarios/p07-search.js --out /tmp/p07 --dark
 *
 * Prints PASS/FAIL per test and `>>> P07 holds` or `>>> P07 VIOLATED`.
 * A critic should be able to run this and nothing else.
 */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, note) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + note);

  await page.waitForFunction(() => window.BEA && window.BEA.search, null, { timeout: 20000 });
  await page.waitForTimeout(1400);

  /* ---- P07.3a — the landing screen contains no search input ------------- */
  const landing = await page.evaluate(() => ({
    inputs: [...document.querySelectorAll('input')].filter((e) => e.offsetParent !== null).length,
    door: (() => { const d = document.querySelector('.sr-door'); return d ? (d.hidden ? 'hidden' : 'visible') : 'absent'; })(),
    stage: document.getElementById('app').dataset.stage,
  }));
  t('P07.3a no search input on the landing screen',
    landing.inputs === 0 && landing.door !== 'visible' && landing.stage === 'plate', JSON.stringify(landing));

  /* ---- P07.3b/c — Ctrl+K opens from any state; Escape restores focus ---- */
  const before = await page.evaluate(() => document.activeElement.tagName);
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(260);
  t('P07.3b Ctrl+K opens the finder and focuses the field',
    await page.evaluate(() => !document.querySelector('.sr').hidden
      && document.activeElement.classList.contains('sr__input')), '');
  await shot('p07-open');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  t('P07.3c Escape closes it and focus returns',
    await page.evaluate((b) => document.querySelector('.sr').hidden && document.activeElement.tagName === b, before), '');

  /* ---- P07.2 — Ceylon at 1900 and at 2000 ------------------------------ */
  const ceylonAt = async (yr) => {
    await page.evaluate((y) => window.BEA.store.dispatch('setYear', y), yr);
    await page.waitForTimeout(150);
    await page.evaluate(() => window.BEA.search.open('Ceylon'));
    await page.waitForTimeout(280);
    const out = await page.evaluate(() => ({
      id: window.BEA.search.rows[0].id,
      text: document.querySelector('.sr__row').innerText.replace(/\n/g, ' | '),
    }));
    await page.evaluate(() => window.BEA.search.close());
    return out;
  };
  const c1900 = await ceylonAt(1900), c2000 = await ceylonAt(2000);
  t('P07.2 "Ceylon" resolves to one territory at both years, each labelled with the name in use',
    c1900.id === 'ceylon' && c2000.id === 'ceylon'
    && /name in use in 1900: Ceylon/.test(c1900.text) && /name in use in 2000: Sri Lanka/.test(c2000.text),
    c1900.id + ' / ' + c2000.id);

  /* ---- historical names in general ------------------------------------- */
  const alias = await page.evaluate(() => {
    const want = { Ceylon: 'ceylon', "Van Diemen's Land": 'van-diemens-land', Rhodesia: 'southern-rhodesia',
      Bombay: 'bombay-presidency', Persia: 'iran', Weihaiwei: 'weihaiwei', 'Somers Isles': 'bermuda' };
    const out = {};
    for (const [q, id] of Object.entries(want)) {
      const r = window.BEA.search.query(q)[0];
      out[q] = r ? r.id : null;
    }
    return out;
  });
  const aliasOk = alias.Ceylon === 'ceylon' && alias["Van Diemen's Land"] === 'van-diemens-land'
    && /rhodesia/.test(alias.Rhodesia || '') && /bombay/.test(alias.Bombay || '')
    && /iran|persia/.test(alias.Persia || '') && alias.Weihaiwei === 'weihaiwei' && alias['Somers Isles'] === 'bermuda';
  t('P07 aliases: Ceylon / Van Diemen\'s Land / Rhodesia / Bombay / Persia / Weihaiwei / Somers Isles all land',
    aliasOk, JSON.stringify(alias));

  /* ---- P07.1 — the search that comes back empty ------------------------ */
  await page.evaluate(() => window.BEA.search.open('Kenya deaths 1954'));
  await page.waitForTimeout(360);
  await shot('p07-absence');
  const abs = await page.evaluate(() => {
    const r = window.BEA.search.rows[0];
    return { kind: r.kind, id: r.id, silenceKind: r.silenceKind,
      text: document.querySelector('.sr__row').innerText.replace(/\n/g, ' | ') };
  });
  t('P07.1 "Kenya deaths 1954" returns an absence AS A RESULT, with agent, date, disclosure and what would settle it',
    abs.kind === 'absence'
    && /Nairobi|Foreign and Commonwealth/i.test(abs.text)
    && /1963/.test(abs.text) && /2011/.test(abs.text)
    && /WHAT WOULD SETTLE IT/i.test(abs.text)
    && !/no results|not found|error/i.test(abs.text),
    abs.id + ' · ' + abs.silenceKind);

  /* ---- P07.4 — a result sets the whole state --------------------------- */
  await page.evaluate(() => window.BEA.search.choose(0));
  await page.waitForTimeout(700);
  const s1 = await page.evaluate(() => ({ hash: location.hash, sheet: document.getElementById('app').dataset.sheet }));
  await shot('p07-after-choose');
  await page.evaluate(() => window.BEA.search.open('Rhodesia'));
  await page.waitForTimeout(300);
  const ev = await page.evaluate(() => window.BEA.search.rows.findIndex((r) => r.kind === 'event'));
  await page.evaluate((i) => window.BEA.search.choose(i), ev);
  await page.waitForTimeout(700);
  const s2 = await page.evaluate(() => location.hash);
  t('P07.4 choosing a result restores year + selection + layer, and the URL carries all three',
    /year=/.test(s2) && /sel=/.test(s2) && /layer=/.test(s2), s2);
  t('P07.1b choosing the absence opened the rail with its apparatus and put its year on the map',
    /year=1954/.test(s1.hash) && /sel=kenya/.test(s1.hash) && s1.sheet === 'open', JSON.stringify(s1));

  /* ---- P07.5 — no match is a written answer ---------------------------- */
  await page.evaluate(() => window.BEA.search.open('qqzzxx'));
  await page.waitForTimeout(300);
  const none = await page.evaluate(() => document.querySelector('.sr__list').innerText);
  await shot('p07-empty');
  t('P07.5 a query with no match writes an answer, never a blank panel',
    none.length > 120 && /Nothing in this atlas is called/i.test(none) && /Try a historical name/i.test(none),
    none.length + ' chars');

  /* ---- the evidence lens ----------------------------------------------- */
  await page.evaluate(() => window.BEA.search.close());
  await page.evaluate(() => window.BEA.bus.emit('ask:lens', { before: 1945 }));
  await page.waitForTimeout(700);
  await shot('p07-lens');
  const lens = await page.evaluate(() => ({
    st: (() => { const s = window.BEA.search.lensState(); return s ? { mode: s.mode, before: s.before, n: s.unitIds.length } : null; })(),
    fig: (document.querySelector('.lens__figures') || {}).innerText,
    caution: (document.querySelector('.lens__caution') || {}).innerText,
    hash: location.hash,
  }));
  t('LENS filters the atlas by its own citation years, says the count, and captions it honestly',
    lens.st && lens.st.mode === 'date' && lens.st.n > 0
    && /territories keep a cited work published by/.test(lens.fig || '')
    && /fact about our bibliography/i.test(lens.caution || '')
    && /lens:1945/.test(lens.hash), JSON.stringify(lens.st) + ' · ' + lens.fig);

  /* ---- the index of holes: reachable without knowing what to type ------ */
  await page.evaluate(() => window.BEA.search.close());
  await page.evaluate(() => window.BEA.bus.emit('ask:sheet', null));
  await page.waitForTimeout(200);
  await page.evaluate(() => window.BEA.search.open(''));
  await page.waitForTimeout(300);
  const hasDoor = await page.evaluate(() => !!document.querySelector('.sr__try--cannot button'));
  t('P07.6 the empty finder offers the index of holes as a row, not as a hint', hasDoor, '');

  await page.evaluate(() => window.BEA.search.open('silences'));
  await page.waitForTimeout(320);
  const idx = await page.evaluate(() => ({
    first: window.BEA.search.rows[0] ? window.BEA.search.rows[0].kind : null,
    text: (document.querySelector('.sr__row') || {}).innerText || '',
  }));
  t('P07.7 a question about the archive itself returns the index as a result',
    idx.first === 'index' && /180/.test(idx.text) && /nobody ever made the count/i.test(idx.text),
    idx.first + ' · ' + idx.text.slice(0, 60));

  await page.evaluate(() => window.BEA.search.choose(0));
  await page.waitForTimeout(700);
  await shot('p07-cannot-gated');
  const gate = await page.evaluate(() => {
    const cn = document.querySelector('.cn');
    return {
      sheet: document.getElementById('app').dataset.sheet,
      gateHidden: document.querySelector('.cn__gate').hidden,
      text: cn ? cn.innerText : '',
      slider: !!document.querySelector('.cn__slider'),
    };
  });
  t('P07.8 the index opens in the rail sheet with the three counts GATED behind a commitment',
    gate.sheet === 'open' && gate.gateHidden === true && gate.slider
    && !/Somebody destroyed the record/.test(gate.text),
    'gateHidden=' + gate.gateHidden);

  await page.evaluate(() => { const s = document.querySelector('.cn__slider'); s.value = '120'; s.dispatchEvent(new Event('input')); });
  await page.click('.cn__commit');
  await page.waitForTimeout(400);
  await shot('p07-cannot-revealed');
  const rev = await page.evaluate(async () => {
    const m = await import('/app/js/close/ledger.js');
    const l = m.getLedger(window.BEA.bus);
    return {
      you: (document.querySelector('.cn__you') || {}).innerText || '',
      heads: [...document.querySelectorAll('.cn__grph')].map((n) => n.innerText.replace(/\n/g, ' ')),
      counts: window.BEA.search.counts(),
      ledger: l.all().filter((e) => e.claimId === 'p07:silence-shapes'),
    };
  });
  const c = rev.counts;
  t('P07.9 the reveal prints the student\'s own number against the atlas\'s own arithmetic',
    /You said 120/.test(rev.you) && new RegExp('It is ' + c.destroyed).test(rev.you)
    && rev.heads.length === 3
    && c.total === c.destroyed + c['never-made'] + c['contested-range'],
    JSON.stringify(c));
  t('P07.10 the commitment is written to the Ledger as a prediction the Close can quote',
    rev.ledger.length === 1 && rev.ledger[0].kind === 'predicted'
    && /120/.test(rev.ledger[0].youSaid) && /destroyed/.test(rev.ledger[0].answer),
    JSON.stringify(rev.ledger[0] || null));

  await page.click('.cn__grp[data-shape="destroyed"] .cn__toggle');
  await page.waitForTimeout(250);
  const rows = await page.evaluate(() => [...document.querySelectorAll('.cn__grp[data-shape="destroyed"] .cn__go')].map((n) => n.innerText.replace(/\n/g, ' · ')));
  t('P07.11 every destroyed record names its destroyer, or says in words that the record does not',
    rows.length === c.destroyed && rows.every((r) => /destroyer not named in the record|Officials|Royal Air Force|Foreign|Office|government/i.test(r)),
    rows.length + ' rows');

  await page.evaluate(() => document.querySelector('.cn__grp[data-shape="destroyed"] .cn__go').click());
  await page.waitForTimeout(700);
  const chose = await page.evaluate(() => location.hash);
  t('P07.12 choosing one from the index sets the year and the selection like any other result',
    /year=\d{4}/.test(chose) && /sel=/.test(chose), chose);

  /* ---- the door does not push the shared masthead off its own edge -----
     The masthead COLLAPSES rather than scrolls (LAYOUT_BUDGET §5A), and when
     it does, this door is one of the six entries that become a panel under the
     bar behind one `Tools` control. Round 3 measured the door at 0×0 at
     390×844 and at 900×700 and called it missing; it was not missing, it was
     inside a closed menu — but the test that could not tell those two apart
     was no use either. So: open the menu if there is one, and assert the door
     in whichever of the two states the bar is actually in. */
  const door = await page.evaluate(async () => {
    const app = document.getElementById('app');
    const btn = document.querySelector('.bar__more');
    const collapsed = !!(btn && btn.offsetParent !== null);
    if (collapsed && app.dataset.tools !== 'open') {
      btn.click();
      await new Promise((r) => setTimeout(r, 260));
    }
    const d = document.querySelector('.sr-door');
    const r = d.getBoundingClientRect();
    return { collapsed, w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right),
      vw: innerWidth, text: d.innerText.trim(), label: d.getAttribute('aria-label') || '' };
  });
  t('P07.13 the door is reachable, whole and inside the window in both masthead states',
    door.right <= door.vw && door.w > 0
    && door.h >= (door.collapsed ? 44 : 20)
    && /Find a place, a person/.test(door.label)
    && (door.collapsed ? /Find/.test(door.text) : door.w <= 120),
    JSON.stringify(door));

  /* ---- round 3: relevance, the bare year, and the lens's own door ------ */
  const rel = await page.evaluate(() => ({
    tipu: window.BEA.search.query('Tipu Sultan').map((r) => r.kind + ':' + r.id),
    sharpe: window.BEA.search.query('Sam Sharpe').map((r) => r.kind + ':' + r.id),
    y1919: window.BEA.search.query('1919').map((r) => r.kind + ':' + r.id),
    parties: window.BEA.search.corpus().parties.length,
    dupes: (() => {
      const seen = new Map();
      for (const p of window.BEA.search.corpus().parties) {
        const k = p.title.toLowerCase().replace(/^(the|a) /, '');
        seen.set(k, (seen.get(k) || 0) + 1);
      }
      return [...seen.values()].filter((n) => n > 1).length;
    })(),
  }));
  t('P07.14 a partial word match is dropped when the whole query landed somewhere',
    !rel.tipu.some((x) => /egypt|muscat|socotra|zanzibar|nejd/.test(x))
    && rel.tipu.some((x) => /tipu-sultan/.test(x))
    && rel.sharpe.length === 1 && /samuel-sharpe/.test(rel.sharpe[0]),
    rel.tipu.join(' ') + ' | ' + rel.sharpe.join(' '));
  t('P07.15 a bare year answers with the year and what is dated to it, and with no book titles',
    rel.y1919[0] === 'year:year:1919'
    && !rel.y1919.some((x) => x.startsWith('source:'))
    && rel.y1919.some((x) => /amritsar/.test(x))
    && rel.y1919.filter((x) => x.startsWith('event:')).length >= 4,
    rel.y1919.join(' '));
  t('P07.16 one polity is one result: a leading article is not a second state',
    rel.dupes === 0, rel.parties + ' parties, ' + rel.dupes + ' article-duplicates');

  await page.evaluate(() => { window.BEA.bus.emit('ask:lens', { off: true }); window.BEA.search.open(''); });
  await page.waitForTimeout(300);
  const lensDoor = await page.evaluate(() => !!document.querySelector('.sr__try--lens button'));
  t('P07.17 the evidence lens has a door in the app, not only in the address bar', lensDoor, '');

  const hints = await page.evaluate(async () => {
    const out = {};
    const read = () => (document.querySelector('.sr__hint') || {}).innerText || '';
    window.BEA.search.open('Elkins');
    await new Promise((r) => setTimeout(r, 300));
    const i = window.BEA.search.rows.findIndex((r) => r.kind === 'source');
    document.querySelectorAll('.sr__row')[i].dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 120));
    out.source = read();
    window.BEA.search.open('Ceylon');
    await new Promise((r) => setTimeout(r, 300));
    out.place = read();
    return out;
  });
  t('P07.18 the bar says what Enter will actually do on the row the reader is on',
    /greys out/.test(hints.source) && /takes the map there/.test(hints.place),
    JSON.stringify(hints));

  await page.evaluate(() => window.BEA.search.close());
  await page.evaluate(() => window.BEA.bus.emit('ask:silence', { id: 'silence:mau-mau-emergency-1952', sheet: true }));
  await page.waitForTimeout(600);
  const sheet = await page.evaluate(() => {
    const n = document.querySelector('.sr-sheet');
    return { text: n ? n.innerText : '', h3: n ? n.querySelectorAll('.sr__name').length : -1 };
  });
  const twice = (sheet.text.match(/19\.9 million pounds/g) || []).length;
  t('P07.19 the absence sheet says the question once and each figure once',
    sheet.h3 === 0 && twice === 1 && /WHAT IT CAME TO/i.test(sheet.text),
    'h3=' + sheet.h3 + ' · "19.9 million pounds" ×' + twice);

  /* ---- the field's own prompt fits the field, at every width ----------- */
  await page.evaluate(() => window.BEA.search.open(''));
  await page.waitForTimeout(280);
  const ph = await page.evaluate(() => {
    const i = document.querySelector('.sr__input');
    const cs = getComputedStyle(i);
    const s = document.createElement('span');
    s.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:'
      + cs.font + ';letter-spacing:' + cs.letterSpacing;
    s.textContent = i.placeholder;
    document.body.appendChild(s);
    const need = s.getBoundingClientRect().width;
    s.remove();
    return { text: i.placeholder, need: Math.round(need), room: Math.round(i.clientWidth) };
  });
  t('P07.20 the prompt in the field fits the field — never half a sentence',
    ph.text.length > 0 && ph.need <= ph.room, JSON.stringify(ph));
  await page.evaluate(() => window.BEA.search.close());

  /* ---- layout: nothing of this piece is on the plate until it is asked -- */
  const geom = await page.evaluate(() => {
    const p = document.querySelector('.sr__panel').getBoundingClientRect();
    const map = document.querySelector('.stage__map canvas') || document.querySelector('.stage__map svg');
    return { panel: { w: Math.round(p.width), h: Math.round(p.height) },
      map: map ? { w: Math.round(map.width || map.getBoundingClientRect().width), h: Math.round(map.getBoundingClientRect().height) } : null,
      docScroll: document.documentElement.scrollHeight - innerHeight,
      hiddenWhenClosed: document.querySelector('.sr').hidden };
  });
  t('LAYOUT the finder never makes the document scroll', geom.docScroll <= 0, geom.docScroll + 'px');
  t('LAYOUT the finder is hidden when it is not open', geom.hiddenWhenClosed === true, String(geom.hiddenWhenClosed));

  log('GEOM ' + JSON.stringify(geom));
  log(R.join('\n'));
  log(R.some((r) => r.startsWith('FAIL')) ? '>>> P07 VIOLATED' : '>>> P07 holds');
};
