/* THE FOUR LINES, MOUNTED THE WAY A BEAT MUST MOUNT THEM. CONTRACT.md §9.
 *
 *   node tools/inspect.js app/js/panels/historiography/produce.scenario.js --out /tmp/p390  --mobile
 *   node tools/inspect.js app/js/panels/historiography/produce.scenario.js --out /tmp/p1440 --w 1440 --h 900
 *
 * It emits `ask:sourceLines`, reads `payload.exercise` on the next line, mounts
 * the node in a surface of its own — a 320x140 box, the shape of a letterboxed
 * lesson beat — and asserts, in order:
 *
 *   P16-src-contract    the contract is published at version 3 and names the event
 *   P16-src-sync        payload.exercise is written synchronously, onReady fires first
 *   P16-src-withheld    the atlas's four answers are NOT in the DOM before the commitment
 *   P16-src-short       three sentences and a blank do not unlock
 *   P16-src-commit      four sentences unlock, and onCommit carries the student's own words
 *   P16-src-compare     the comparison prints yours, ours, and the criterion under both
 *   P16-src-band        the exercise chapters itself in a short surface, and stops when it grows
 *   P16-src-ledger      one row, kind `attributed`, claimId hgx:src:<id>, the words in it
 *   P16-src-decline     a second exercise can be declined, and the decline is recorded by name
 *   P16-src-set         four exercises, four documents, four arguments, more than one kind
 */
module.exports = async ({ page, shot, log }) => {
  const results = [];
  const check = (name, ok, detail) => {
    results.push((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : ''));
    log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : ''));
  };

  await page.waitForFunction(() => window.BEA && window.BEA.bus && window.BEA.historiography, null, { timeout: 25000 });
  await page.waitForTimeout(700);

  const c = await page.evaluate(() => window.BEA.historiography.contract);
  check('P16-src-contract', c.version >= 3 && c.sourceEvent === 'ask:sourceLines',
    'v' + c.version + ' event=' + c.sourceEvent);

  const set = await page.evaluate(() => window.BEA.historiography.produceStats());
  check('P16-src-set',
    set.exercises >= 3 && set.documents === set.exercises && set.arguments === set.exercises
      && Object.keys(set.kinds).length >= 2,
    JSON.stringify(set));

  /* --- mount it the way a beat must --------------------------------------- */
  const ready = await page.evaluate(() => {
    const bus = window.BEA.bus || (window.BEA.ctx && window.BEA.ctx.bus);
    if (!bus) return { err: 'no bus' };
    const host = document.createElement('div');
    host.id = 'fake-beat';
    host.style.cssText = 'position:fixed;left:8px;bottom:8px;width:320px;height:140px;'
      + 'overflow:auto;background:var(--surface-panel,#fff);z-index:60;border:1px solid #999;padding:8px';
    document.body.append(host);
    window.__srcReady = null; window.__srcCommit = null;
    const payload = {
      exerciseId: 'src-powell',
      lede: 'The lesson has just counted the dead three different ways. Before you go on, say what this document is.',
      onReady: (e) => { window.__srcReady = e.exerciseId; },
      onCommit: (rec) => { window.__srcCommit = rec; },
    };
    bus.emit('ask:sourceLines', payload);
    const ex = payload.exercise;
    if (!ex) return { err: 'payload.exercise not written' };
    host.append(ex.node);
    window.__ex = ex;
    return {
      id: ex.id, exerciseId: ex.exerciseId, doc: ex.doc, dispute: ex.disputeId,
      committed: ex.committed, hardest: ex.hardest, min: ex.min,
      fields: ex.fields.map((f) => f.key),
      onReadyFired: window.__srcReady,
    };
  });
  check('P16-src-sync', !ready.err && ready.onReadyFired === 'src-powell' && ready.fields.length === 4,
    JSON.stringify(ready));

  await page.waitForTimeout(400);
  await shot('mounted');

  const withheld = await page.evaluate(() => {
    const t = (window.BEA.testimony && window.BEA.testimony.texts || []).find((x) => x.id === 'powell-hola-1959');
    /* textContent, not innerText: a chaptered surface hides what it is not
       showing, and innerText cannot see a leak inside a hidden chapter. Since
       the document itself moved to its own chapter (round 5, so that the
       opening screen is 337px rather than 731px in a 198px window), this also
       has to look past `hidden` to find the quotation at all. */
    const txt = document.getElementById('fake-beat').textContent;
    return {
      natureLeak: t ? txt.indexOf(t.nature.slice(0, 40)) >= 0 : null,
      purposeLeak: t ? txt.indexOf(t.purpose.slice(0, 40)) >= 0 : null,
      cmp: !!document.querySelector('#fake-beat .hgx-src__cmp'),
      quote: txt.indexOf('We must be consistent with ourselves everywhere') >= 0,
      boxes: document.querySelectorAll('#fake-beat textarea[data-hgx="srcfield"]').length,
    };
  });
  check('P16-src-withheld',
    withheld.natureLeak === false && withheld.purposeLeak === false && !withheld.cmp
      && withheld.quote && withheld.boxes === 4,
    JSON.stringify(withheld));

  const band = await page.evaluate(() => {
    const root = document.querySelector('#fake-beat .hgx');
    const pager = root.querySelector('.hgx-pager');
    return {
      paged: root.dataset.paged,
      pagerHidden: pager.hidden,
      visible: [...root.querySelectorAll('.hgx-chap')].filter((x) => !x.hidden).length,
      chapters: root.querySelectorAll('.hgx-chap').length,
    };
  });
  check('P16-src-band', band.paged === 'on' && band.pagerHidden === false && band.visible === 1,
    JSON.stringify(band));

  /* three sentences and a blank */
  const short = await page.evaluate(() => {
    const tas = [...document.querySelectorAll('#fake-beat textarea[data-hgx="srcfield"]')];
    tas.forEach((ta, i) => {
      ta.value = i === 3 ? '' : 'A sentence long enough to count, number ' + i + '.';
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const go = document.querySelector('#fake-beat .hgx-src__go');
    return { disabled: go.disabled, count: document.querySelector('#fake-beat .hgx-src__count').textContent };
  });
  check('P16-src-short', short.disabled === true && /3 of 4/.test(short.count), JSON.stringify(short));

  const done = await page.evaluate(() => {
    const tas = [...document.querySelectorAll('#fake-beat textarea[data-hgx="srcfield"]')];
    tas[3].value = 'It cannot tell you what happened at Hola, only what was said about it in London.';
    tas[3].dispatchEvent(new Event('input', { bubbles: true }));
    const go = document.querySelector('#fake-beat .hgx-src__go');
    const was = go.disabled;
    go.click();
    return { wasDisabled: was };
  });
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => ({
    commit: window.__srcCommit && {
      exerciseId: window.__srcCommit.exerciseId,
      declined: window.__srcCommit.declined,
      cannot: (window.__srcCommit.fields || {}).cannotTell,
    },
    cmp: document.querySelectorAll('#fake-beat .hgx-src__cmp').length,
    mine: [...document.querySelectorAll('#fake-beat .hgx-src__said')].map((p) => p.textContent.slice(0, 40)),
    strong: !!document.querySelector('#fake-beat .hgx-src__strong'),
    weak: !!document.querySelector('#fake-beat .hgx-src__weak'),
    canon: !!document.querySelector('#fake-beat .hgx-src__whole .src'),
  }));
  check('P16-src-commit',
    done.wasDisabled === false && after.commit && after.commit.exerciseId === 'src-powell'
      && after.commit.declined === false && /what happened at Hola/.test(after.commit.cannot || ''),
    JSON.stringify(after.commit));
  await shot('committed');

  /* The comparison: four field cards, each carrying yours, ours, and the
     criterion. `renderSource()` prints the canonical record on the last one. */
  const cmp = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('#fake-beat .hgx-src__cmp')];
    return cards.map((c) => ({
      field: c.dataset.field,
      yours: !!c.querySelector('.hgx-src__side[data-who="you"] .hgx-src__said'),
      ours: !!c.querySelector('.hgx-src__side[data-who="atlas"] .hgx-src__said'),
      strong: !!c.querySelector('.hgx-src__strong'),
      weak: !!c.querySelector('.hgx-src__weak'),
    }));
  });
  check('P16-src-compare',
    cmp.length === 4 && cmp.every((x) => x.yours && x.ours && x.strong && x.weak) && after.canon,
    JSON.stringify(cmp.map((x) => x.field)) + ' canonical=' + after.canon);

  const led = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem('bea.ledger.v1'))
        .filter((e) => String(e.claimId || '').startsWith('hgx:src:'))
        .map((e) => ({ kind: e.kind, claimId: e.claimId, youSaid: String(e.youSaid).slice(0, 80) }));
    } catch (e) { return 'err ' + e.message; }
  });
  check('P16-src-ledger',
    Array.isArray(led) && led.length === 1 && led[0].kind === 'attributed'
      && led[0].claimId === 'hgx:src:src-powell' && /what it is:/.test(led[0].youSaid),
    JSON.stringify(led));

  /* --- the band lets go when the surface grows ---------------------------- */
  const grew = await page.evaluate(async () => {
    document.getElementById('fake-beat').style.height = '900px';
    await new Promise((r) => setTimeout(r, 500));
    const root = document.querySelector('#fake-beat .hgx');
    const app = document.getElementById('app');
    return { paged: root.dataset.paged, rail: app.dataset.rail };
  });
  /* Below 62rem the shell's own hint wins and it correctly stays chaptered. */
  check('P16-src-band-grows',
    grew.rail === 'sheet' ? grew.paged === 'on' : grew.paged === 'off',
    JSON.stringify(grew));

  /* --- the decline, on a second exercise ---------------------------------- */
  const declined = await page.evaluate(async () => {
    const bus = window.BEA.bus;
    const host = document.getElementById('fake-beat');
    host.replaceChildren();
    const payload = { disputeId: 'did-britain-care', onCommit: (r) => { window.__declined = r; } };
    bus.emit('ask:sourceLines', payload);
    host.append(payload.exercise.node);
    await new Promise((r) => setTimeout(r, 300));
    document.querySelector('#fake-beat .hgx-src__skip').click();
    await new Promise((r) => setTimeout(r, 400));
    let row = null;
    try {
      row = JSON.parse(localStorage.getItem('bea.ledger.v1'))
        .filter((e) => e.claimId === 'hgx:src:src-dyer')
        .map((e) => ({ kind: e.kind, youSaid: e.youSaid }))[0] || null;
    } catch (_) { row = 'err'; }
    return {
      exercise: payload.exercise.exerciseId,
      rec: window.__declined && { declined: window.__declined.declined, doc: window.__declined.doc },
      row,
      cmp: document.querySelectorAll('#fake-beat .hgx-src__cmp').length,
      empty: [...document.querySelectorAll('#fake-beat .hgx-src__said[data-empty="yes"]')].length,
    };
  });
  check('P16-src-decline',
    declined.exercise === 'src-dyer' && declined.rec && declined.rec.declined === true
      && declined.row && declined.row.kind === 'declined' && declined.cmp === 4 && declined.empty === 4,
    JSON.stringify(declined));
  await shot('declined');

  const own = await page.evaluate(() => window.BEA.historiography.auditOwn());
  check('P16-src-standing', own.length === 0, JSON.stringify(own).slice(0, 400));

  /* And the guard proved against a known-bad corpus, not merely observed
     returning [] against a clean one. */
  const guard = await page.evaluate(() => window.BEA.historiography.auditProductions(
    [{ id: 'sharpe-gallows-1832', quote: 'x', check: 'y', kind: 'primary-source', nature: 'n', origin: 'o', purpose: 'p' }]));
  check('P16-src-guard', guard.length > 0 && guard.some((f) => /does not hold/.test(f.problem))
    && guard.some((f) => /no answer of its own/.test(f.problem)),
  guard.length + ' findings against a corpus with one text and a missing field');

  log('');
  log('>>> P16 four-lines ' + (results.every((r) => r.startsWith('PASS')) ? 'holds' : 'FAILS'));
  for (const r of results) log('   ' + r);
};
