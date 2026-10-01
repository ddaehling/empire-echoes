/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p06-legend`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P06: the legend agrees with the catalogue it is a key to. */
/**
 * p06-accept.js — the executable form of FEATURE_SPEC §2 P06's six acceptance
 * tests, plus the four rules this piece added in round 3.
 *
 *   node tools/inspect.js tools/scenarios/p06-accept.js --out /tmp/p06a --w 1366 --h 768
 *   node tools/inspect.js tools/scenarios/p06-accept.js --out /tmp/p06a-m --mobile
 *   node tools/inspect.js tools/scenarios/p06-accept.js --out /tmp/p06a-d --w 1440 --h 900 --dark
 *
 * Prints PASS/FAIL per rule and `>>> layers hold` / `>>> LAYERS BROKEN`.
 * Test 5 (no reachability simulation anywhere in app/js/layers/) is a grep and
 * runs here as a fetch of this piece's own sources, so it is checked against
 * what the browser actually loaded rather than against the working tree.
 */
const NINE = ['gibraltar', 'malta', 'aden', 'ceylon', 'singapore', 'hong', 'falkland', 'helena', 'ascension'];
const BANNED = ['breadthFirst', 'breadth-first', 'nominalDays', 'distanceBudget', 'sailingTime', 'counterfactualRoute'];

module.exports = async ({ page, shot, log }) => {
  /* ROUND 2 OF WAVE 9: this file dispatched `startTour', 'thirty'` — the full
     route, which no cold start runs. Which route the guided path is belongs to
     the app; the legend's rules are about A BEAT, not about a particular one. */
  {
    const RT = require('./lib/routes.js');
    const id = (await RT.chosen(page))[0];
    await page.evaluate((r) => { window.__P06_ROUTE = r; }, id);
    log('P06: driving the guided path on ' + id);
  }

  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1800);
  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');
  const ev = (fn, arg) => page.evaluate(fn, arg);

  /* The way a reader reaches this piece's one control, at any width. Below
     about 40rem the shell collapses the masthead into an overflow drawer and
     re-parents the control into it, so a test that only knows the desktop
     position reports "the control is gone" on the one viewport it matters
     most on. */
  const openLayers = async () => {
    const visible = await page.evaluate(() => {
      const o = document.querySelector('.ly-bar__open');
      if (!o) return 'absent';
      const r = o.getBoundingClientRect();
      return r.width > 0 && r.height > 0 ? 'yes' : 'no';
    });
    if (visible === 'absent') return 'absent';
    if (visible === 'no') {
      /* The first DOM match is not necessarily the one on screen: the masthead
         carries more than one collapsed affordance and only one of them is
         rendered at a given width. */
      let opened = false;
      for (const sel of ['.bar__more', '.mx-more', '[data-mount="chrome-end"] .cx-more']) {
        for (const h of await page.$$(sel)) {
          const box = await h.boundingBox();
          if (!box || box.width < 4 || box.height < 4) continue;
          await h.click();
          await page.waitForTimeout(700);
          opened = true;
          break;
        }
        if (opened) break;
      }
      if (!opened) return 'unreachable';
    }
    await page.click('.ly-bar__open', { timeout: 8000 });
    await page.waitForTimeout(900);
    return 'ok';
  };

  /* ---- 1. the definition switch: four repaints, one year ----------------- */
  await ev(() => window.BEA.store.dispatch('setYear', 1860));
  await page.waitForTimeout(700);
  const defs = ['claimed', 'administered', 'controlled', 'influenced'];
  const counts = [];
  for (const d of defs) {
    await page.evaluate((id) => window.BEA.bus.emit('map:setDefinition', { id }), d);
    await page.waitForTimeout(650);
    counts.push(await ev(() => {
      const st = window.BEA.store.getState();
      const p = window.__map && window.__map.plate;
      let painted = 0;
      if (p && p.paint) for (const [, r] of p.paint) if (r.mode !== 'quiet' && !r.quiet) painted++;
      return { year: st.year, def: window.__map && window.__map.definition, painted,
        units: Number((document.querySelector('.tl-figs, .tl__units, .app__time .num') || {}).textContent) || null };
    }));
  }
  await page.evaluate(() => window.BEA.bus.emit('map:setDefinition', { id: 'claimed' }));
  await page.waitForTimeout(400);
  const oneYear = counts.every((c) => c.year === 1860);
  const fourDefs = new Set(counts.map((c) => c.def)).size === 4;
  t('P06.1 definition switch  ', oneYear && fourDefs, JSON.stringify(counts.map((c) => c.def + ':' + c.year)), 'four definitions, the year never moves');

  /* ---- 2. every layer's sentence, byline and caveat, and the registry ---- */
  const cat = await ev(async () => {
    const m = await import('/app/js/layers/catalog.js');
    return {
      ids: m.LAYERS.map((l) => l.id),
      missing: m.LAYERS.filter((l) => !l.sentence || !l.byline || !l.caption || !l.band).map((l) => l.id),
      longBands: m.LAYERS.filter((l) => String(l.band).length > 62).map((l) => l.id + ':' + l.band.length),
      notBuilt: m.NOT_BUILT.map((n) => n.id + ' — ' + String(n.why).slice(0, 60)),
      run: m.RUN.steps.map((s) => s.layer),
      /* the registry must REFUSE a layer with no definition */
      refuses: (() => { try { m.assertLayer({ id: 'x', label: 'x', group: 'held', paints: 'fill' }); return false; } catch (e) { return true; } })(),
      refusesLongBand: (() => { try { m.assertLayer({ id: 'x', label: 'x', group: 'held', paints: 'fill', sentence: 's', byline: 'b', caption: 'c', band: 'x'.repeat(70) }); return false; } catch (e) { return true; } })(),
    };
  });
  t('P06.2 every layer defined', cat.missing.length === 0, cat.missing.join(',') || 'all ' + cat.ids.length + ' carry sentence + byline + caveat + band', 'no layer without a definition');
  t('P06.2 registry refuses   ', cat.refuses && cat.refusesLongBand, 'undefined:' + cat.refuses + ' over-long band:' + cat.refusesLongBand, 'assertLayer throws on both');
  t('P06.2 band fits the band ', cat.longBands.length === 0, cat.longBands.join(',') || 'all <= 62 chars', 'no band sentence over 62 characters');
  t('P06.2 unbuildable named  ', cat.notBuilt.length > 0, cat.notBuilt.join(' | '), 'a layer we cannot draw is printed, not silently missing');

  /* the legend and this piece must agree, layer by layer */
  const agree = [];
  for (const id of cat.ids) {
    await page.evaluate((x) => window.BEA.bus.emit('ask:layer', { id: x, predict: false }), id);
    await page.waitForTimeout(750);
    agree.push(await ev(async () => {
      const sym = await import('/app/js/legend/symbology.js');
      const c = await import('/app/js/layers/catalog.js');
      const id2 = window.BEA.store.getState().activeLayer;
      const l = c.byId.get(id2);
      const paintsOwn = l.paints !== 'map';
      const say = (document.querySelector('.cx-lede__say') || {}).textContent || '';
      return { id: id2, hasMeaning: !!sym.LAYER_MEANING[id2], sameSentence: sym.LAYER_MEANING[id2] === l.sentence,
        /* Only the readings THIS piece draws are asserted. `control`, `tenure`
           and `weight` are P02's own modes: it speaks about them at priority 50
           in its own words ("Size is people now, not land. 122 carry a cited
           figure"), which is a better sentence than ours for a change it made,
           and the band is allowed exactly one voice at a time. */
        paintsOwn,
        say: say.slice(0, 60),
        sayClipped: (() => { const n = document.querySelector('.cx-lede__say');
          return !!n && (n.scrollHeight > n.clientHeight + 2 || n.scrollWidth > n.clientWidth + 2); })(),
        bandOnScreen: !paintsOwn && l.id !== 'tenure' ? true : say.includes(l.band.slice(0, 26)),
        markText: (document.querySelector('.cx-lede__mark') || {}).textContent,
        keyRows: document.querySelectorAll('.ly-key__row').length,
        zeroRows: [...document.querySelectorAll('.ly-key__n')].filter((n) => n.textContent.trim() === '0').length };
    }));
  }
  const noMeaning = agree.filter((a) => !a.hasMeaning || !a.sameSentence).map((a) => a.id);
  t('P06.2 legend agrees      ', noMeaning.length === 0, noMeaning.join(',') || 'all ' + agree.length + ' layers share one sentence with P17', 'LAYER_MEANING[id] === catalog sentence');
  const noBand = agree.filter((a) => !a.bandOnScreen).map((a) => a.id + ' says "' + a.say + '"');
  const clippedBand = agree.filter((a) => a.sayClipped).map((a) => a.id + ' :: ' + a.say);
  t('R3.1 the band says it    ', noBand.length === 0, noBand.join(' | ') || agree.filter((a) => a.paintsOwn).length + ' painted readings speak in the shell voice, unclipped', "the layer's band sentence is the one on screen");
  const zeros = agree.filter((a) => a.zeroRows > 0).map((a) => a.id + ':' + a.zeroRows);
  t('R3.1 the band is not cut ', clippedBand.length === 0, clippedBand.join(' | ') || 'no layer sentence overflows the band at this viewport', 'the band sentence is never clipped');
  t('R3.2 no empty key rows   ', zeros.length === 0, zeros.join(',') || 'no key prints a colour that is not on the plate', 'a key row means a colour on the map');

  /* ---- 3. the informal layer, its default and its caption ---------------- */
  await ev(() => { window.BEA.store.dispatch('setLayer', 'status'); window.BEA.store.dispatch('setYear', 1860); });
  await page.waitForTimeout(800);
  const inf = await ev(() => {
    const cap = document.querySelector('.ly-caption');
    const txt = (cap && (cap.textContent + ' ' + (cap.getAttribute('title') || ''))) || '';
    return { onByDefault: !!document.querySelector('.ly-haze__fill, .ly-haze__none'),
      argument: /argument, not a measurement/i.test(txt),
      gr: /Gallagher and Robinson/i.test(txt) && /1953/.test(txt),
      objection: /falsifi/i.test(txt),
      captionText: txt.slice(0, 150) };
  });
  t('P06.3 haze on at 1860    ', inf.onByDefault, String(inf.onByDefault), 'the pressure layer is on by default 1830-1914');
  t('P06.3 caption is honest  ', inf.argument && inf.gr && inf.objection, JSON.stringify({ a: inf.argument, gr: inf.gr, obj: inf.objection }), '"an argument, not a measurement" + Gallagher & Robinson 1953 + the unfalsifiability objection');
  await shot('informal-1860');

  /* ---- 4. the stitching: nine named nodes, 44px targets, dated links ----- */
  await ev(() => { window.BEA.store.dispatch('setYear', 1913); window.BEA.store.dispatch('setLayer', 'system'); });
  await page.waitForTimeout(1100);
  const sys = await ev(async (NINE_) => {
    const hits = [...document.querySelectorAll('.ly-hit')];
    const named = {};
    for (const n of NINE_) named[n] = hits.some((h) => (h.getAttribute('aria-label') || '').toLowerCase().includes(n));
    const small = hits.filter((h) => { const r = h.getBoundingClientRect(); return r.width && r.width < 43.5; })
      .map((h) => Math.round(h.getBoundingClientRect().width) + 'px r=' + h.getAttribute('r') + ' ' + (h.getAttribute('aria-label') || '').slice(0, 40));
    const routes = await (await fetch('/app/js/layers/routes.json')).json();
    const badLinks = (routes.links || []).filter((l) => l.fromYear == null || !(l.sourceIds || []).length).length;
    const badNodes = (routes.nodes || []).filter((n) => n.fromYear == null).length;
    return { named, missing: Object.keys(named).filter((k) => !named[k]), small, hits: hits.length, badLinks, badNodes, links: (routes.links || []).length };
  }, NINE);
  t('P06.4 nine nodes present ', sys.missing.length === 0, sys.missing.join(',') || 'all nine named, ' + sys.hits + ' hit targets', 'Gibraltar Malta Aden Ceylon Singapore Hong Kong Falklands St Helena Ascension');
  t('P06.4 44px hit targets   ', sys.small.length === 0, sys.small.join(' | ') || 'all ' + sys.hits + ' at 44px or more', 'every mark >= 44px');
  t('P06.4 every link dated   ', sys.badLinks === 0 && sys.badNodes === 0, 'links without a year or a source: ' + sys.badLinks + '; nodes without a year: ' + sys.badNodes + ' (of ' + sys.links + ' links)', '0');
  await shot('stitching-1913');

  /* ---- 5. nothing here simulates a route -------------------------------- */
  const grep = await ev(async (banned) => {
    const files = ['index.js', 'catalog.js', 'paint.js', 'overlay.js', 'panel.js'];
    const found = [];
    for (const f of files) {
      const src = await (await fetch('/app/js/layers/' + f)).text();
      for (const b of banned) if (src.includes(b)) found.push(f + ':' + b);
    }
    return found;
  }, BANNED);
  t('P06.5 no route simulation', grep.length === 0, grep.join(',') || 'clean', 'no BFS, no distance budget, no nominalDays, no computed counterfactual');

  /* ---- 6. the T4 lock: resistance cannot be switched off ---------------- */
  await ev(() => { window.BEA.bus.emit('tours:beat', { chapter: 'atlantic' }); window.BEA.store.dispatch('setYear', 1831); });
  await page.waitForTimeout(700);
  await ev(() => window.BEA.bus.emit('ask:layerKey', { open: true }));
  await page.waitForTimeout(900);
  const lock = await ev(() => {
    const rows = [...document.querySelectorAll('.ly-sheet__layer')];
    const row = rows.find((r) => /Revolt and refusal/.test(r.textContent));
    const btn = row && row.querySelector('.ly-sheet__pick');
    const why = row && row.querySelector('.ly-sheet__lock');
    return { present: !!row, disabled: !!(btn && btn.disabled), why: why ? why.textContent.slice(0, 120) : null,
      pinsDrawn: document.querySelectorAll('.ly-pin').length };
  });
  t('P06.6 T4 lock            ', lock.present && lock.disabled && !!lock.why, JSON.stringify(lock), 'the control is present, disabled, and says why');
  await ev(() => window.BEA.bus.emit('tours:beat', { chapter: 'imperial' }));
  await page.waitForTimeout(400);

  /* ---- R4.1 no unit is told it was taken from Europeans unless it was ---- */
  /* Round 3's disqualifier, in executable form. The whole artefact was capped
     at 40 because nine acquisition records whose counterparties are Tipu
     Sultan's Mysore, the Marathas, the Lahore Durbar, the Konbaung kingdom,
     Nepal and Bhutan were being headlined as "another European power". This
     asserts the property rather than the nine ids: on BOTH plates that draw
     acquisition records, no unit may carry the word "European" in its
     accessible name or its label unless every counterparty its own record
     names is of kind `european-power`. */
  await ev(() => { window.BEA.bus.emit('ask:sheet', null); window.BEA.store.dispatch('setYear', 1913); });
  await page.waitForTimeout(500);
  const euro = [];
  for (const layer of ['mechanism', 'taken-from']) {
    await ev((id) => window.BEA.bus.emit('ask:layer', { id, predict: false }), layer);
    await page.waitForTimeout(1100);
    euro.push(await ev(async (id) => {
      const paint = await import('/app/js/layers/paint.js');
      const ix = paint.buildIndex(window.BEA.data);
      const year = window.BEA.store.getState().year;
      const p = window.__map && window.__map.plate;
      const bad = [];
      if (p && p.paint) {
        for (const [uid, rec] of p.paint) {
          const text = String(rec.label || '') + ' ' + String(rec.layerWord || '');
          if (!/europe/i.test(text)) continue;
          const list = ix.acqByUnit.get(uid);
          const a = id === 'taken-from'
            ? paint.takenFromRecord(list, year)
            : (() => { let last = null; for (const x of list || []) { if (x.year <= year) last = x; else break; } return last; })();
          const cp = (a && a.cp) || [];
          /* The two plates make different claims and are held to different
             rules. `mechanism` prints a FAMILY word over the whole unit, so
             "European" there must be true of every party the record names.
             `taken-from` prints ONE named party and says in the same label how
             many others the record carries, so it is honest exactly when that
             named party is the European one. */
          const ok = id === 'taken-from'
            ? (cp[0] && cp[0].kind === 'european-power'
               && (cp.length === 1 || /more named on the same record/.test(text)))
            : (cp.length > 0 && cp.every((c) => c.kind === 'european-power'));
          if (!ok) bad.push(uid + ' :: ' + text.trim().slice(0, 70) + ' :: ' + cp.map((c) => c.kind).join('+'));
        }
      }
      return { layer: id, bad: bad.slice(0, 6), n: bad.length };
    }, layer));
  }
  const euroBad = euro.filter((e) => e.n > 0);
  t('R4.1 no false European   ', euroBad.length === 0,
    euroBad.map((e) => e.layer + ': ' + e.bad.join(' | ')).join(' || ') || 'both acquisition plates clean at 1913',
    'a unit says "European" only where every counterparty its record names is a European power');

  /* ---- R4.2 the party on the other side is named, per unit -------------- */
  const named = await ev(async () => {
    const paint = await import('/app/js/layers/paint.js');
    const ix = paint.buildIndex(window.BEA.data);
    const year = window.BEA.store.getState().year;
    const p = window.__map && window.__map.plate;
    let painted = 0; let withName = 0; const wrong = [];
    for (const [uid, rec] of (p && p.paint) || []) {
      if (rec.mode !== 'fill' || !rec.layerCat) continue;
      painted++;
      const a = paint.takenFromRecord(ix.acqByUnit.get(uid), year);
      const first = a && a.cp && a.cp[0];
      if (!first) continue;
      if (String(rec.label || '').includes(first.name)) withName++;
      if ((first.kind || 'other') !== rec.layerCat) wrong.push(uid + ' ' + first.kind + '!=' + rec.layerCat);
    }
    return { painted, withName, wrong: wrong.slice(0, 5), nWrong: wrong.length };
  });
  t('R4.2 the party is named  ', named.painted > 0 && named.withName === named.painted && named.nWrong === 0,
    JSON.stringify(named), 'every painted unit carries the name and the kind its own record gives');

  /* ---- R4.3 the accessible name says what is drawn --------------------- */
  const a11y = await ev(() => {
    const nodes = [...document.querySelectorAll('.map__target')];
    const withReading = nodes.filter((n) => /Drawn now by/.test(n.getAttribute('aria-label') || '')).length;
    return { targets: nodes.length, withReading,
      sample: (nodes[0] && nodes[0].getAttribute('aria-label') || '').slice(0, 140) };
  });
  t('R4.3 names say the layer ', a11y.targets > 0 && a11y.withReading > a11y.targets * 0.5,
    JSON.stringify(a11y), 'the map targets name the reading that is painting, not only the legal status');

  /* ---- R4.4 the haze is off on a guided beat, on off the path ---------- */
  await ev(() => { window.BEA.bus.emit('ask:layer', { id: 'status', predict: false }); window.BEA.store.dispatch('setYear', 1860); });
  await page.waitForTimeout(900);
  const hazeFree = await ev(() => document.querySelectorAll('.ly-haze__fill, .ly-haze__none').length);
  /* The path also pins `filter=pressure:off` while it runs, which is its own
     answer to the same verdict. It is cleared here on purpose: what is being
     tested is that a beat with no opinion at all still gets one argument. */
  await ev(() => {
    window.BEA.store.dispatch('startTour', window.__P06_ROUTE);
    window.BEA.store.dispatch('setFilter', { pressure: null });
    window.BEA.store.dispatch('setYear', 1860);
    window.BEA.bus.emit('tours:beat', { id: 'two-track', chapter: 'imperial', exploring: false });
  });
  await page.waitForTimeout(1000);
  const hazeBeat = await ev(() => document.querySelectorAll('.ly-haze__fill, .ly-haze__none').length);
  await ev(() => { window.BEA.store.dispatch('endTour'); window.BEA.store.dispatch('setYear', 1860); });
  await page.waitForTimeout(1000);
  const hazeBack = await ev(() => document.querySelectorAll('.ly-haze__fill, .ly-haze__none').length);
  t('R4.4 haze off on a beat  ', hazeFree > 0 && hazeBeat === 0 && hazeBack > 0,
    'free ' + hazeFree + ' / on a beat ' + hazeBeat + ' / after leaving ' + hazeBack,
    'the 1830-1914 default stands down while a beat carries its own one argument');

  /* ---- R4.5 the voice guide, over every string this piece can print ----- */
  /* DIDACTIC_SPEC §7 bans a list of strings in UI copy, and this piece writes
     more prose than any other module outside the dossier: thirteen sentences,
     thirteen bylines, thirteen caveats, five predicts and about sixty category
     glosses. It walks the catalog rather than a list of fields, so a field
     added later is linted without this file being edited. */
  const voice = await ev(async (banned) => {
    const c = await import('/app/js/layers/catalog.js');
    const strings = [];
    const walk = (o, path) => {
      if (typeof o === 'string') { strings.push([path, o]); return; }
      if (Array.isArray(o)) { o.forEach((x, i) => walk(x, path + '[' + i + ']')); return; }
      if (o && typeof o === 'object') { for (const k in o) walk(o[k], path + '.' + k); }
    };
    walk(c.LAYERS, 'LAYERS'); walk(c.RUN, 'RUN'); walk(c.GROUPS, 'GROUPS');
    walk(c.COUNTERPARTY_KINDS, 'KINDS'); walk(c.MECHANISM_FAMILIES, 'MECH');
    walk(c.EXIT_CATEGORIES, 'EXIT'); walk(c.NOT_BUILT, 'NOT_BUILT');
    const out = [];
    for (const [path, str] of strings) {
      for (const b of banned) {
        const re = new RegExp('\\b' + b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        if (re.test(str)) out.push(path + ' :: "' + b + '" :: ' + str.slice(0, 70));
      }
    }
    return { n: strings.length, out: out.slice(0, 6), total: out.length };
  }, ['acquired', 'pacified', 'civilising mission', 'unrest', 'rich tapestry',
    'played a key role', 'left a lasting legacy', 'both sides', 'it is important to note',
    'arguably', 'many would say', 'mixed legacy', 'natives', 'tribe', 'tribal']);
  t('R4.5 the voice guide     ', voice.total === 0,
    voice.out.join(' | ') || voice.n + ' authored strings, none banned',
    'no string DIDACTIC_SPEC §7 bans reaches a reader through this piece');

  /* ---- R3.3 one teaching panel, one year -------------------------------- */
  await ev(() => { window.BEA.bus.emit('ask:sheet', null); window.BEA.store.dispatch('setLayer', 'mechanism'); });
  await page.waitForTimeout(700);
  await ev(() => window.BEA.bus.emit('ask:compare', { a: 1914, b: 1922 }));
  await page.waitForTimeout(1200);
  const withCmp = await ev(() => ({ layer: window.BEA.store.getState().activeLayer,
    key: !!document.querySelector('.ly-key'), cmpOpen: !!document.querySelector('.cmp:not([hidden])') }));
  t('R3.3 stands down for two ', withCmp.layer === 'status' && !withCmp.key, JSON.stringify(withCmp), 'a reading compare cannot draw is put back, not left claimed');
  await ev(() => window.BEA.bus.emit('ask:layerKey', { open: true }));
  await page.waitForTimeout(1100);
  const after = await ev(() => ({ cmpOpen: !!document.querySelector('.cmp:not([hidden])'),
    layer: window.BEA.store.getState().activeLayer, run: !!document.querySelector('.ly-run') }));
  t('R3.3 one panel at a time ', !after.cmpOpen, JSON.stringify(after), 'opening this sheet closes the comparison');
  t('R3.3 the reading returns ', after.layer === 'mechanism', after.layer, 'the layer compare made us drop comes back');

  /* ---- R3.4 the route: four steps, commit before each reveal ------------ */
  await ev(() => window.BEA.bus.emit('ask:sheet', null));
  await page.waitForTimeout(400);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(2000);
  /* 1861, not 1860: after the reload the address bar may already hold 1860,
     and a dispatch that changes nothing advances no disclosure level, so the
     bar this line clicks would still be hidden at `plate`. */
  await ev(() => window.BEA.store.dispatch('setYear', 1861));
  await page.waitForTimeout(900);
  const preRun = await ev(() => ({
    stage: document.getElementById('app').dataset.stage,
    hash: location.hash,
    layer: window.BEA.store.getState().activeLayer,
    cmp: !!document.querySelector('.cmp:not([hidden])'),
    barDisp: document.querySelector('.ly-bar') ? getComputedStyle(document.querySelector('.ly-bar')).display : 'absent',
  }));
  log('BEFORE THE ROUTE ' + JSON.stringify(preRun));
  const reached = await openLayers();
  t('R3.6 the control is there', reached === 'ok', reached + ' ' + JSON.stringify(preRun),
    'the layers control is reachable at every width, in the masthead or in its drawer');
  if (reached !== 'ok') { log(R.join('\n')); log('>>> LAYERS BROKEN'); return; }
  /* The route's length is the catalog's, not a number written here. When a
     reading was added in round 3 this loop still said four and reported the
     route broken; a harness that has to be edited to add a layer is a harness
     that will one day be edited to agree with a bug. */
  const nSteps = cat.run.length;
  const steps = [];
  for (let i = 0; i < nSteps; i++) {
    steps.push(await ev(() => ({
      step: (document.querySelector('.ly-run__head') || {}).textContent,
      layer: window.BEA.store.getState().activeLayer,
      asks: !!document.querySelector('.ly-run .cx-ask__q'),
      escape: !!document.querySelector('.ly-run__out'),
      byline: !!document.querySelector('.ly-run .ly-sheet__byline') || !!document.querySelector('.ly-run .cx-ask__q'),
    })));
    const b = await page.$('.ly-run .ly-predict__b');
    if (b) {
      await b.click();
      await page.waitForTimeout(800);
      steps[steps.length - 1].afterBand = await ev(() => {
        const n = document.querySelector('.cx-lede__say');
        const mk = document.querySelector('.cx-lede__mark');
        return { clipped: !!n && (n.scrollHeight > n.clientHeight + 2 || n.scrollWidth > n.clientWidth + 2),
          mark: mk && mk.textContent, say: n && n.textContent.slice(0, 50) };
      });
    }
    if (i < nSteps - 1) { await page.click('.ly-run__b--next'); await page.waitForTimeout(900); }
  }
  const runLayers = steps.map((s) => s.layer);
  t('R3.4 the route runs      ', runLayers.join(',') === cat.run.join(','), runLayers.join(','), cat.run.join(','));
  const cutAfter = steps.filter((s) => s.afterBand && s.afterBand.clipped).map((s) => s.afterBand.mark + ' / ' + s.afterBand.say);
  t('R3.4 commit fits the band', cutAfter.length === 0, cutAfter.join(' | ') || 'every "You said" line fits the band unclipped', 'the commitment echo never clips the sentence');
  t('R3.4 an escape at each   ', steps.every((s) => s.escape), steps.filter((s) => !s.escape).length + ' steps with no way out', 'every step carries a way out to the full chooser');
  await page.click('.ly-run__b--next');
  await page.waitForTimeout(900);
  const done = await ev(() => ({ run: !!document.querySelector('.ly-run'), chooser: document.querySelectorAll('.ly-sheet__name').length }));
  t('R3.4 hands back the list ', !done.run && done.chooser === cat.ids.length, JSON.stringify(done), 'the route ends in the full chooser of ' + cat.ids.length);
  await shot('route-end');

  /* ---- R3.5 a teacher's page number arrives complete ------------------- */
  /* goto() to a URL that differs only in its hash does not reload the
     document, and the whole point of this rule is the COLD load. */
  await page.goto('http://localhost:8777/app/#year=1913&layer=mechanism', { waitUntil: 'load' });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(2800);
  const link = await ev(() => {
    const bar = document.querySelector('.ly-bar');
    return { stage: document.getElementById('app').dataset.stage,
      layer: window.BEA.store.getState().activeLayer, year: window.BEA.store.getState().year,
      bar: !!bar && getComputedStyle(bar).display !== 'none',
      /* NOT `!!document.querySelector('.ly-key')`. That is what this test used
         to ask, and it passed while the card beside a fully painted plate read
         "nothing to draw at 1826 — a real result, not a loading state": on a
         cold load this piece attaches before P02's first `setPaint`, so the
         tally was null when the card was built and nothing rebuilt it. A key
         that exists and is empty is worse than no key, because it makes a
         false claim about the map. Count the rows and their figures. */
      key: !!document.querySelector('.ly-key'),
      keyRows: document.querySelectorAll('.ly-key__row').length,
      keyTotal: [...document.querySelectorAll('.ly-key__n')]
        .reduce((n, x) => n + (Number(String(x.textContent).replace(/[^0-9]/g, '')) || 0), 0),
      keyEmptyClaim: /nothing to draw at/.test((document.querySelector('.ly-key') || {}).textContent || ''),
      back: !!document.querySelector('.ly-bar__back:not([hidden])'),
      say: ((document.querySelector('.cx-lede__say') || {}).textContent || '').slice(0, 40) };
  });
  t('R3.5 deep link is complete', link.layer === 'mechanism' && link.year === 1913 && link.key && link.bar && link.back
      && link.keyRows > 0 && link.keyTotal > 0 && !link.keyEmptyClaim,
    JSON.stringify(link), 'a cold #layer= link paints, keys WITH ITS COUNTS, names and offers the way back');
  await shot('deep-link');

  log(R.join('\n'));
  const bad = R.filter((r) => r.startsWith('FAIL'));
  log(bad.length ? '>>> LAYERS BROKEN' : '>>> layers hold');
  /* AND IT EXITS NON-ZERO WHEN IT FAILS. Wave 9: this file printed FAIL rows
     and returned normally, so `inspect.js` exited 0 and any runner that trusts
     exit codes called a failing check green. */
  if (bad.length) throw new Error('LAYERS BROKEN\n' + bad.join('\n'));
};
