/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `hgx`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P16: historians disagree — the positions, the gate, the verdict on the far side of a commitment, and no false balance. */
/**
 * hgx-accept.js — P16, HISTORIANS DISAGREE. The acceptance harness.
 *
 * Every rule this piece is judged on, asserted against the running app, at the
 * viewport the harness is given. Prints PASS/FAIL per rule and
 * `>>> historiography holds` / `>>> HISTORIOGRAPHY BROKEN`.
 *
 * Run it at each viewport in LAYOUT_BUDGET §0, light, dark and reduced:
 *   node tools/inspect.js tools/scenarios/hgx-accept.js --out /tmp/h390  --mobile
 *   node tools/inspect.js tools/scenarios/hgx-accept.js --out /tmp/h768  --w 768  --h 1024
 *   node tools/inspect.js tools/scenarios/hgx-accept.js --out /tmp/h900  --w 900  --h 700
 *   node tools/inspect.js tools/scenarios/hgx-accept.js --out /tmp/h1366 --w 1366 --h 768
 *   node tools/inspect.js tools/scenarios/hgx-accept.js --out /tmp/h1440 --w 1440 --h 900
 *
 * Unlike budget.js this runs in `data-stage=working` with a rail surface
 * mounted, which is where every defect the round-2 critic found actually lived.
 */
module.exports = async ({ page, shot, log }) => {
  const results = [];
  const ok = (id, pass, got, want) => {
    results.push(pass);
    log((pass ? 'PASS  ' : 'FAIL  ') + id.padEnd(28) + ' got ' + got + (want ? '  (' + want + ')' : ''));
  };
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });

  /* ROUND 2, WAVE 9: THIS HELPER WAS THE SCENARIO'S BIGGEST SOURCE OF NOISE.
     It used to reload on `domcontentloaded` and then sleep a flat 2800ms. On an
     idle machine that is enough; under `tools/acceptance.js` running five
     browsers at once it is not, and the run then reported five failures — A1,
     A2, E5, F1 and G1 — that had nothing to do with the historiography module
     and everything to do with the dossier not having painted yet. The panel
     measured it: "at 6000ms the card is there with 'Caroline Elkins · David
     Anderson · John Blacker'". A gate that goes red on a busy machine is not a
     gate, and its real reds are then invisible inside the noise.
     So: no sleep is the wait. Wait for the state the app publishes — the store
     is ready and, when the hash asks for a place or a panel, the rail surface
     that place or panel mounts into has actually rendered. */
  const go = async (hash) => {
    await page.goto('http://localhost:8777/app/' + hash, { waitUntil: 'domcontentloaded' });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready',
      null, { timeout: 30000 });
    if (/sel=|panel=/.test(hash)) {
      await page.waitForFunction(() => {
        const b = document.querySelector('.cx-sheet__body');
        return !!b && (b.innerText || '').trim().length > 40;
      }, null, { timeout: 30000 }).catch(() => {});
    }
    await page.waitForTimeout(700);
  };

  /* ROUND 2, WAVE 9: THE READER IS PAGED NOW, AND THE TEST HAD NOT NOTICED.
     The historiography panel used to be one long scroll; it is now a 12-chapter
     paged reader with `.hgx-pager__go` ("← Back" / "Next →") and every chapter
     but the current one at `display:none`. So `page.click('.hgx-seg')` resolved
     to eight elements, all of them invisible, and sat in Playwright's
     actionability loop for 30 seconds before killing the scenario at section F
     — G, H and I had not run since. THE GUARANTEES DID NOT CHANGE; the route to
     them did. `reveal()` turns pages until the thing is on screen, and fails
     loudly if it never is, which is the assertion that matters: a control a
     student cannot reach by paging forward is a control that is not there. */
  const reveal = async (sel, max = 14) => {
    for (let i = 0; i <= max; i++) {
      const on = await page.evaluate((s) => [...document.querySelectorAll(s)]
        .some((e) => e.offsetParent !== null), sel);
      if (on) return true;
      const next = await page.$(String.raw`.hgx-pager__go[data-dir="1"]:not([disabled])`)
        || (await page.$$('.hgx-pager__go')).slice(-1)[0];
      if (!next || !(await next.isVisible())) return false;
      await next.click().catch(() => {});
      await page.waitForTimeout(220);
    }
    return false;
  };
  /** Page to it, then press the one a student can actually see. A selector can
   *  match eight elements spread over eight chapters, seven of them at
   *  `display:none`; `page.click(sel)` takes the first in the document and
   *  waits thirty seconds for a hidden one to become clickable. */
  const press = async (sel) => {
    const there = await reveal(sel);
    if (!there) { ok('paging to ' + sel, false, 'never visible', 'reachable by pressing Next'); return false; }
    const all = await page.$$(sel);
    for (const h of all) if (await h.isVisible()) { await h.click({ timeout: 8000 }).catch(() => {}); return true; }
    ok('pressing ' + sel, false, 'no visible instance', 'one a student could press');
    return false;
  };

  /* ---- A. it is reachable at all ------------------------------------- */
  await go('#year=1955&sel=kenya');
  const cards = await page.evaluate(() => document.querySelectorAll('.hgx-card').length);
  ok('A1 card in the dossier', cards === 1, cards, 'exactly 1 on a place that carries an argument');
  const named = await page.evaluate(() => (document.querySelector('.hgx-card__who') || {}).textContent || '');
  ok('A2 names on the card', /Elkins/.test(named) && /Blacker/.test(named), JSON.stringify(named.slice(0, 60)),
    'the historians, not a category label');

  /* ---- B. the branch --------------------------------------------------- */
  await page.click('.hgx-card__go');
  await page.waitForTimeout(600);
  const pre = await page.evaluate(() => {
    const b = document.querySelector('.cx-sheet__body');
    return {
      verdict: !!document.querySelector('.hgx-verdict'),
      settle: !!document.querySelector('.hgx-settle'),
      html: b ? b.innerHTML.length : 0,
      text: b ? b.innerText : '',
    };
  });
  ok('B1 verdict not in DOM', !pre.verdict && !pre.settle, String(pre.verdict) + '/' + String(pre.settle),
    'not rendered before the commitment, not merely hidden');
  ok('B2 positions rendered', await page.evaluate(() => document.querySelectorAll('.hgx-pos').length) >= 2,
    await page.evaluate(() => document.querySelectorAll('.hgx-pos').length), '>= 2 named positions');
  ok('B3 explain-away shown', /explain away/i.test(pre.text), /explain away/i.test(pre.text), 'the strongest case against each');
  await reveal('.hgx-ask__go');
  const gate0 = await page.evaluate(() => document.querySelector('.hgx-ask__go').disabled);
  ok('B4 gate closed', gate0 === true, gate0, 'commit disabled with no choice and no sentence');
  await press('.hgx-choice[data-value="elkins"]');
  await page.waitForTimeout(150);
  const gate1 = await page.evaluate(() => document.querySelector('.hgx-ask__go').disabled);
  ok('B5 sentence required', gate1 === true, gate1, 'a choice alone does not open it');
  await reveal('textarea[data-hgx="why"]');
  await page.fill('textarea[data-hgx="why"]', 'The people who kept the records destroyed them, so the official count cannot stand.');
  await page.waitForTimeout(150);
  const gate2 = await page.evaluate(() => document.querySelector('.hgx-ask__go').disabled);
  ok('B6 gate opens', gate2 === false, gate2, 'choice + >= 20 characters');
  await press('.hgx-ask__go');
  await page.waitForTimeout(700);
  const post = await page.evaluate(() => ({
    verdict: !!document.querySelector('.hgx-verdict'),
    mine: (document.querySelector('.hgx-mine__why') || {}).innerText || '',
    chip: (document.querySelector('.hgx-chip') || {}).textContent || '',
    text: (document.querySelector('.cx-sheet__body') || {}).innerText || '',
  }));
  ok('B7 verdict after commit', post.verdict, post.verdict, 'rendered on the far side of the branch');
  ok('B8 own words quoted', /records destroyed them/.test(post.mine), JSON.stringify(post.mine.slice(0, 40)), 'their sentence, verbatim');
  ok('B9 no false balance', /not about what happened/.test(post.chip), JSON.stringify(post.chip),
    'Kenya is marked a disagreement about scale');
  ok('B10 the misuse named', /move to watch for/.test(post.text), /move to watch for/.test(post.text),
    '"historians disagree, so who knows" is named as the move to watch for');

  /* ---- C. the evidence lens (FEATURE_SPEC P16 test 3) ------------------ */
  /* WAVE 9: `page.$` finds an element that EXISTS; it says nothing about
     whether a student could press it. `.hgx-lens__go` is in the document and
     not visible here, so `elementHandle.click()` sat in Playwright's
     actionability loop for 30 seconds and killed the scenario at section C —
     D, E and F had not run since. Ask whether it is pressable, press it if it
     is, and record the answer either way rather than dying on it. */
  await reveal('.hgx-lens__go');
  const lensGo = await page.$('.hgx-lens__go');
  const lensPressable = lensGo ? await lensGo.isVisible() : false;
  if (lensPressable) { await lensGo.click({ timeout: 8000 }).catch(() => {}); await page.waitForTimeout(400); }
  else log('C0 .hgx-lens__go ' + (lensGo ? 'is in the document and not visible' : 'is not in the document'));
  const lens = await page.evaluate(() => {
    const n = document.querySelector('.hgx-lens');
    return n ? { text: n.innerText, grey: n.querySelectorAll('[data-greyed="yes"]').length,
      rows: n.querySelectorAll('.hgx-lens__row').length } : null;
  });
  ok('C1 lens greys post-2011', !!lens && lens.grey > 0 && lens.grey < lens.rows,
    lens ? lens.grey + ' of ' + lens.rows : 'none', 'some, not all');
  ok('C2 lens names 2005 work', !!lens && /Anderson/.test(lens.text) && /Elkins/.test(lens.text) && /2005/.test(lens.text),
    !!lens && /Anderson/.test(lens.text), 'what Hanslope added is not what 2005 established');

  /* ---- D. it reaches the record --------------------------------------- */
  const led = await page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter((e) => String(e.claimId || '').startsWith('hgx:')); }
    catch (_) { return []; }
  });
  ok('D1 in the Ledger', led.length === 1, led.length + (led[0] ? ' as ' + led[0].kind : ''), 'one row P21 will print');
  ok('D2 no marked answer', !led[0] || led[0].answer == null, led[0] ? String(led[0].answer) : 'n/a',
    'the Close must not print "the atlas: …" for a question with no right answer');
  /* And in the dossier's own read-back of every commitment. A judgement has no
     right answer, so that list must not mark it as one. */
  /* The dossier builds its section index when it renders, so the read-back
     list appears on the next render after a commitment, not during it. */
  await page.evaluate(() => window.BEA.store.dispatch('nudgeYear', 1));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.BEA.bus.emit('dossier:openSection', { id: 'answers' }));
  await page.waitForTimeout(600);
  const ans = await page.evaluate(() => (document.querySelector('.cx-sheet__body') || {}).innerText || '');
  ok('D3 read back, unmarked', /no right answer to this one/.test(ans) && !/class of purpose/.test(ans),
    /no right answer to this one/.test(ans), 'the session record does not mark an interpretation right or wrong');
  ok('D4 sentence kept', /records destroyed them/.test(ans), /records destroyed them/.test(ans),
    'their own words are read back to them');
  await page.evaluate(() => window.BEA.bus.emit('ask:sheet', null));
  await page.waitForTimeout(300);
  await page.click('.hgx-card__go');
  await page.waitForTimeout(600);

  /* ---- E. geometry, at this viewport ---------------------------------- */
  const geo = await page.evaluate(() => {
    const b = document.querySelector('.cx-sheet__body');
    const r = b ? b.getBoundingClientRect() : null;
    const w = document.documentElement.clientWidth;
    const off = [];
    for (const n of document.querySelectorAll('.hgx, .hgx-card')) {
      for (const c of n.querySelectorAll('button, textarea')) {
        const q = c.getBoundingClientRect();
        if (q.width && (q.x < -1 || q.right > w + 1)) off.push(c.className + '@' + Math.round(q.x));
      }
    }
    return {
      h: r ? Math.round(r.height) : 0, w: r ? Math.round(r.width) : 0,
      docScroll: document.documentElement.scrollHeight - window.innerHeight,
      hScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      off,
    };
  });
  ok('E1 sheet >= 280px', geo.h >= 280, geo.h + 'px', 'LAYOUT_BUDGET B8');
  ok('E2 no document scroll', geo.docScroll <= 1, geo.docScroll, 'B4');
  ok('E3 no horizontal scroll', geo.hScroll <= 0, geo.hScroll, 'nothing pushes the page sideways');
  ok('E4 no control off-screen', geo.off.length === 0, JSON.stringify(geo.off), 'every control inside the viewport');
  const focus = await page.evaluate(() => {
    const b = document.querySelector('.cx-sheet__body');
    return { inside: !!(b && b.contains(document.activeElement)), sheets: document.querySelectorAll('.cx-sheet').length,
      flag: (document.getElementById('app') || {}).dataset.sheet };
  });
  ok('E5 caret follows the panel', focus.inside, focus.inside, 'a keyboard reader lands in what they opened');
  ok('E6 one rail surface', focus.sheets === 1 && focus.flag === 'open', focus.sheets + ' / ' + focus.flag,
    'LAYOUT_BUDGET B7: one rail, one width, one panel');
  await shot('01-verdict');

  /* A PLACE THIS ATLAS HOLDS NO ARGUMENT ABOUT. Round 2, wave 9: this used to
     assert that the dossier printed NOTHING there, and it now prints a card
     that says so in words — "None of them is about Ascension Island. They cover
     64 other entries" — with a way into the fourteen it does hold. That is a
     better artefact, not a regression, so the assertion moves to the guarantee
     underneath it, which has not changed: NO ARGUMENT IS MANUFACTURED. No named
     position, no gate, no commit control on a place that has none — and the
     card says, in its own words, that this place is not one of them. */
  await go('#year=1900&sel=ascension');
  const none = await page.evaluate(() => ({
    pos: document.querySelectorAll('.hgx-pos').length,
    ask: document.querySelectorAll('.hgx-ask').length,
    go: document.querySelectorAll('.hgx-card__go').length,
    text: (document.querySelector('.hgx-card') || {}).innerText || '',
  }));
  ok('E7 no argument invented', none.pos === 0 && none.ask === 0,
    none.pos + ' positions / ' + none.ask + ' gates', 'nothing manufactured where the atlas holds none');
  ok('E8 and it says so', /none of (them|these)/i.test(none.text) || none.text === '',
    JSON.stringify(none.text.replace(/\s+/g, ' ').slice(0, 80)),
    'either silent, or saying in words that this place is not one of the arguments');

  /* ---- F. the parallel texts (test 5) --------------------------------- */
  await go('#year=1840&sel=new-zealand');
  await page.click('.hgx-card__go');
  await page.waitForTimeout(600);
  /* ROUND 2, WAVE 9: `.hgx-par__col` NO LONGER EXISTS. The parallel texts were
     rebuilt as clause pairs inside `.hgx-par__pairs`, plus a chapter carrying
     each text WHOLE through `renderSource`. The old selector returned 0 and the
     line read "0 cols", which says nothing about whether a student can read
     both texts. The guarantee — BOTH TEXTS, WHOLE, EACH WITH ITS OWN
     PROVENANCE — is asserted against what renders them now. */
  await reveal('.hgx-par .src__nop');
  const par = await page.evaluate(() => ({
    segs: document.querySelectorAll('.hgx-seg').length,
    pairs: document.querySelectorAll('.hgx-par .hgx-pair').length,
    texts: document.querySelectorAll('.hgx-par .src').length,
    nop: document.querySelectorAll('.hgx-par .src__nop').length,
  }));
  ok('F1 both texts, whole', par.texts === 2 && par.nop === 2,
    par.texts + ' texts / ' + par.nop + ' provenance blocks',
    'each of the two texts rendered whole, each through renderSource');
  ok('F2 clauses linked', par.segs >= 8, par.segs, 'two clauses in each of two texts, in the pairs and in the texts');
  await press('.hgx-seg');
  await page.waitForTimeout(200);
  const lit = await page.evaluate(() => document.querySelectorAll('.hgx-seg[data-lit="yes"]').length);
  ok('F3 segment locking', lit >= 2, lit, 'lighting one lights its counterpart');
  /* THE THIRD TEXT. `.hgx-par__col` is gone with the columns; the back-
     translation now arrives as a third `renderSource` figure of its own. */
  await press('[data-hgx="third"]');
  await page.waitForTimeout(600);
  const third = await page.evaluate(() => ({
    texts: document.querySelectorAll('.hgx-par .src').length,
    kaw: /Kawharu/.test(document.body.innerText || ''),
  }));
  ok('F4 the third text', third.texts === 3 && third.kaw, third.texts + ' texts / Kawharu=' + third.kaw,
    'Kawharu 1989 on demand, as a source of its own');
  await shot('02-parallel');

  /* ---- G. the afterlife coupling -------------------------------------- */
  ok('G0 atlas gated', !(await page.$('[data-hgx="atlas"]')), !!(await page.$('[data-hgx="atlas"]')),
    'the map move is downstream of the commitment too');
  await press('.hgx-choice');
  await reveal('textarea[data-hgx="why"]');
  await page.fill('textarea[data-hgx="why"]', 'The text they signed is the one that binds, because that is what the signatures are on.');
  await page.waitForTimeout(150);
  await press('.hgx-ask__go');
  await page.waitForTimeout(700);
  const a2 = await page.$('[data-hgx="atlas"]');
  ok('G1 atlas control appears', !!a2, !!a2, 'after the commitment');
  /* ROUND 2, WAVE 9: THE CONTROL IS TWO STEPS NOW, AND THE TEST KNEW ONE.
     Waitangi's `atlasCan` carries `year: 1840` and `thenYear: 1863`, and the
     button rewrites itself in place: press one takes the map to the year of the
     signatures, press two to the confiscations twenty-three years on, with the
     note travelling with the year. Arriving from `#year=1840` the first press
     is invisible, so asserting 1863 after ONE press failed on a control that
     works. The guarantee is unchanged — THE YEAR MOVES UNDER THE WORDS, and
     the words move with it — so press it until it stops offering a next year
     and assert both halves. */
  const yearNow = () => page.evaluate(() => Number(document.getElementById('app').dataset.year));
  const noteNow = () => page.evaluate(() => (document.querySelector('.hgx-atlas__note') || {}).innerText || '');
  const seen = [await yearNow()];
  const notes = [await noteNow()];
  for (let i = 0; i < 3; i++) {
    if (!(await page.$('[data-hgx="atlas"]'))) break;
    await press('[data-hgx="atlas"]');
    await page.waitForTimeout(800);
    seen.push(await yearNow()); notes.push(await noteNow());
    if (seen[seen.length - 1] !== seen[0]) break;   /* it moved; that is the claim */
  }
  const yr = seen[seen.length - 1];
  ok('G2 map moved', yr !== seen[0] || seen.includes(1863), seen.join(' → '),
    'the year changes under the words');
  ok('G2b the note travelled', notes[notes.length - 1] !== notes[0] && /1863|confiscat/i.test(notes[notes.length - 1]),
    JSON.stringify(String(notes[notes.length - 1]).slice(0, 60)),
    'the caption is about the year now on screen, not the one it left');
  ok('G3 texts still open', await page.evaluate(() => !!document.querySelector('.hgx-par')), true, 'nothing closed');
  await shot('03-afterlife');

  /* ---- H. the index ---------------------------------------------------- */
  await go('#panel=historiography');
  const idx = await page.evaluate(() => document.querySelectorAll('.hgx-index__row').length);
  ok('H1 index route', idx >= 14, idx, '#panel=historiography lists every argument');
  await shot('04-index');

  /* ---- I. the audit ---------------------------------------------------- */
  const aud = await page.evaluate(() => window.BEA.historiography.audit());
  ok('I1 audit clean', Array.isArray(aud) && aud.length === 0, JSON.stringify(aud).slice(0, 200),
    'no missing field, no unknown territory, no banned string');
  const st = await page.evaluate(() => window.BEA.historiography.stats());
  ok('I2 coverage', st.disputes >= 14 && st.positions >= 30 && st.places >= 60,
    st.disputes + ' arguments / ' + st.positions + ' positions / ' + st.places + ' places', '');

  /* Other modules are built by other agents and are sometimes mid-save while
     this runs; their errors are reported, not counted against this piece. */
  const mine = errs.filter((e) => /historiograph|hgx/i.test(e));
  ok('Z1 no errors from this piece', mine.length === 0, JSON.stringify(mine.slice(0, 3)), '0');
  if (errs.length) log('NOTE  other modules logged ' + errs.length + ' error(s): ' + JSON.stringify(errs.slice(0, 2)));

  const failed = results.filter((r) => !r).length;
  log(failed ? '>>> HISTORIOGRAPHY BROKEN (' + failed + ' failures)' : '>>> historiography holds');
};
