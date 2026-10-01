/* THE PAIR: A DOCUMENT MADE TO JUSTIFY, BESIDE ONE MADE TO PROTEST. CONTRACT §9.1.
 *
 *   node tools/inspect.js app/js/panels/historiography/pair.scenario.js --out /tmp/pair390  --mobile
 *   node tools/inspect.js app/js/panels/historiography/pair.scenario.js --out /tmp/pair1366 --w 1366 --h 768
 *
 * Round 5's rubric finding, in its own words: "the four-line source task fires
 * once, on Lobengula. A second, on a source whose purpose cuts the other way
 * (Trevelyan or Salisbury), would let the student see that the four fields
 * answer differently for a document written to justify rather than to protest."
 *
 * Asserted here, in order:
 *   P16-pair-nominated  sourceForBeat() answers for the two core beats and nulls elsewhere
 *   P16-pair-beat       mounting by beatId gives THAT beat's document, not the first in the file
 *   P16-pair-withheld   Salisbury's four answers are not in the DOM before the commitment
 *   P16-pair-contrast   after the commitment the pairing prints under `purpose`, and only there
 *   P16-pair-defer      a pairing whose partner is an unwritten exercise withholds its answer
 *   P16-pair-gate       withSource puts the four lines inside a mounted gate; default does not
 *   P16-pair-cost       every reply carries a cost in seconds, computed off its own prose
 *   P16-pair-set        the set spans acts: some made to justify, some made to answer back
 *   P16-pair-fit        one thing to read per screen, measured in a beat-shaped surface
 */
module.exports = async ({ page, shot, log }) => {
  const results = [];
  const check = (name, ok, detail) => {
    results.push((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : ''));
    log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : ''));
  };

  await page.waitForFunction(() => window.BEA && window.BEA.bus && window.BEA.historiography, null, { timeout: 25000 });
  await page.waitForTimeout(700);

  const nom = await page.evaluate(() => ({
    egypt: window.BEA.historiography.sourceForBeat('egypt'),
    compensation: window.BEA.historiography.sourceForBeat('compensation'),
    poster: window.BEA.historiography.sourceForBeat('poster'),
    all: window.BEA.historiography.pathSources(),
    version: window.BEA.historiography.contract.version,
  }));
  check('P16-pair-nominated',
    nom.version >= 4 && nom.egypt && nom.egypt.id === 'src-salisbury'
      && nom.compensation && nom.compensation.id === 'src-trevelyan'
      && nom.poster === null && nom.all.length === 2
      && nom.all.every((x) => x.madeTo === 'to justify'),
    JSON.stringify(nom.all) + ' poster=' + JSON.stringify(nom.poster));

  check('P16-pair-cost',
    nom.egypt.costS > 60 && nom.egypt.costS < 600 && nom.compensation.costS > 60,
    'salisbury ' + nom.egypt.costS + 's / ' + nom.egypt.words + ' words · trevelyan '
      + nom.compensation.costS + 's');

  /* --- mount by beat, the way a path must -------------------------------- */
  const mounted = await page.evaluate(() => {
    const bus = window.BEA.bus;
    const host = document.createElement('div');
    host.id = 'fake-beat';
    host.style.cssText = 'position:fixed;left:8px;bottom:8px;width:320px;height:140px;'
      + 'overflow:auto;background:var(--surface-panel,#fff);z-index:60;border:1px solid #999;padding:8px';
    document.body.append(host);
    const payload = {
      beatId: 'egypt',
      lede: 'You have just watched Britain take Egypt for a canal and a debt. Say what this document is.',
      onCommit: (r) => { window.__salisbury = r; },
    };
    bus.emit('ask:sourceLines', payload);
    if (!payload.exercise) return { err: 'no reply' };
    host.append(payload.exercise.node);
    return { id: payload.exercise.exerciseId, doc: payload.exercise.doc, dispute: payload.exercise.disputeId };
  });
  check('P16-pair-beat', mounted.id === 'src-salisbury' && mounted.doc === 'salisbury-maps-1890',
    JSON.stringify(mounted));

  await page.waitForTimeout(400);
  await shot('salisbury-before');

  const withheld = await page.evaluate(() => {
    const t = (window.BEA.testimony && window.BEA.testimony.texts || [])
      .find((x) => x.id === 'salisbury-maps-1890');
    const txt = document.getElementById('fake-beat').textContent;
    return {
      natureLeak: t ? txt.indexOf(t.nature.slice(0, 40)) >= 0 : null,
      purposeLeak: t ? txt.indexOf(t.purpose.slice(0, 40)) >= 0 : null,
      pair: !!document.querySelector('#fake-beat .hgx-src__pair'),
      quote: txt.indexOf('drawing lines upon maps') >= 0,
      boxes: document.querySelectorAll('#fake-beat textarea[data-hgx="srcfield"]').length,
    };
  });
  check('P16-pair-withheld',
    withheld.natureLeak === false && withheld.purposeLeak === false && !withheld.pair
      && withheld.quote && withheld.boxes === 4,
    JSON.stringify(withheld));

  /* one thing to read per screen, in a 140px surface */
  const fit = await page.evaluate(() => {
    const root = document.querySelector('#fake-beat .hgx');
    const host = document.getElementById('fake-beat');
    const chaps = [...root.querySelectorAll('.hgx-chap')];
    return {
      window: host.clientHeight,
      paged: root.dataset.paged,
      visible: chaps.filter((c) => !c.hidden).length,
      heights: chaps.map((c) => {
        const was = c.hidden; c.hidden = false;
        const h = c.scrollHeight; c.hidden = was; return h;
      }),
      chapters: chaps.length,
    };
  });
  fit.tallest = Math.max(...(fit.heights || [0]));
  const median = [...(fit.heights || [0])].sort((a2, b2) => a2 - b2)[Math.floor((fit.heights || [0]).length / 2)];
  /* NO CHAPTER MAY BE TWICE THE TYPICAL ONE. The rule this module works to is
     one thing to read per screen, and a set of chapters where one is four
     times the rest is not that. Measured in the rail at 390x844 before the
     round-5 split: the opening chapter was 731px against 321-411px for every
     other, 4.3 screenfuls against 1.9. After: 456px, and the ratio is what is
     guarded here so the next paragraph added to it fails a test rather than a
     critic. */
  check('P16-pair-fit',
    fit.paged === 'on' && fit.visible === 1 && fit.tallest <= median * 2.2,
    JSON.stringify(fit.heights) + ' tallest=' + fit.tallest + ' median=' + median);

  const after = await page.evaluate(async () => {
    const tas = [...document.querySelectorAll('#fake-beat textarea[data-hgx="srcfield"]')];
    const said = [
      'A speech he made in public after the treaty was already signed.',
      'Lord Salisbury in 1890, reported in a newspaper rather than written by him.',
      'To make the agreement sound reasonable to people who thought it a bad bargain.',
      'It cannot tell me what the borders did to anybody living across them.',
    ];
    tas.forEach((ta, i) => {
      ta.value = said[i];
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
    document.querySelector('#fake-beat .hgx-src__go').click();
    await new Promise((r) => setTimeout(r, 500));
    const cards = [...document.querySelectorAll('#fake-beat .hgx-src__cmp')];
    return {
      committed: !!window.__salisbury,
      cards: cards.length,
      pairOn: cards.filter((c) => c.querySelector('.hgx-src__pair')).map((c) => c.dataset.field),
      pairText: (document.querySelector('#fake-beat .hgx-src__pair') || {}).textContent || '',
    };
  });
  check('P16-pair-contrast',
    after.committed && after.cards === 4 && after.pairOn.length === 1 && after.pairOn[0] === 'purpose'
      && /Lobengula/.test(after.pairText) && /protest/.test(after.pairText),
    JSON.stringify(after.pairOn) + ' — ' + after.pairText.slice(0, 120));
  await shot('salisbury-after');

  /* --- the pairing that must NOT answer the exercise the student has not
         reached: Trevelyan's partner is Sharpe, which is one of ours. ------ */
  const defer = await page.evaluate(async () => {
    const bus = window.BEA.bus;
    const host = document.getElementById('fake-beat');
    host.replaceChildren();
    const payload = { beatId: 'compensation' };
    bus.emit('ask:sourceLines', payload);
    host.append(payload.exercise.node);
    await new Promise((r) => setTimeout(r, 300));
    const tas = [...document.querySelectorAll('#fake-beat textarea[data-hgx="srcfield"]')];
    tas.forEach((ta, i) => {
      ta.value = 'My own sentence about this document, number ' + i + ', long enough to count.';
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
    document.querySelector('#fake-beat .hgx-src__go').click();
    await new Promise((r) => setTimeout(r, 500));
    const pair = document.querySelector('#fake-beat .hgx-src__pair');
    const sharpe = (window.BEA.historiography.sources() || []).find((s) => s.id === 'src-sharpe');
    return {
      id: payload.exercise.exerciseId,
      text: pair ? pair.textContent : null,
      sharpeWritten: sharpe && sharpe.written,
    };
  });
  check('P16-pair-defer',
    defer.id === 'src-trevelyan' && defer.sharpeWritten === false && defer.text
      && /Samuel Sharpe/.test(defer.text) && !/made to protest\./.test(defer.text)
      && /different thing/.test(defer.text),
    (defer.text || '').slice(0, 160));
  await shot('trevelyan-after');

  /* --- the gate, with and without the four lines ------------------------- */
  const gate = await page.evaluate(async () => {
    const bus = window.BEA.bus;
    const host = document.getElementById('fake-beat');
    host.style.height = '240px';
    host.replaceChildren();
    const plain = { disputeId: 'irish-famine-intent' };
    bus.emit('ask:disputeGate', plain);
    const plainKeys = [...plain.gate.node.querySelectorAll('.hgx-chap')].map((c) => c.dataset.chap);
    const withIt = { disputeId: 'irish-famine-intent', withSource: true };
    bus.emit('ask:disputeGate', withIt);
    host.append(withIt.gate.node);
    await new Promise((r) => setTimeout(r, 400));
    const keys = [...withIt.gate.node.querySelectorAll('.hgx-chap')].map((c) => c.dataset.chap);
    return {
      plainHasSource: plainKeys.some((k) => String(k).startsWith('src-')),
      withHasSource: keys.some((k) => String(k).startsWith('src-')),
      source: withIt.gate.source,
      plainSource: plain.gate.source,
    };
  });
  check('P16-pair-gate',
    gate.plainHasSource === false && gate.withHasSource === true
      && gate.source && gate.source.id === 'src-trevelyan' && gate.source.mounted === true
      && gate.plainSource && gate.plainSource.mounted === false && gate.source.costS > 0,
    JSON.stringify(gate.source));
  await shot('gate-with-source');

  const set = await page.evaluate(() => {
    const s = window.BEA.historiography.sources();
    const acts = {};
    for (const x of s) acts[x.madeTo] = (acts[x.madeTo] || 0) + 1;
    return { n: s.length, acts, own: window.BEA.historiography.auditOwn() };
  });
  check('P16-pair-set',
    set.n === 6 && Object.keys(set.acts).length >= 3
      && (set.acts['to justify'] || 0) >= 2 && set.own.length === 0,
    JSON.stringify(set.acts) + ' audit=' + JSON.stringify(set.own).slice(0, 200));

  /* the guard has teeth: a set that is all one act must fail */
  const teeth = await page.evaluate(() => window.BEA.historiography.auditProductions(
    [{ id: 'salisbury-maps-1890', quote: 'x', check: 'y', kind: 'primary-source' }]));
  check('P16-pair-guard', teeth.length > 0, teeth.length + ' findings against a one-text corpus');

  log('');
  log('>>> P16 pair ' + (results.every((r) => r.startsWith('PASS')) ? 'holds' : 'FAILS'));
  for (const r of results) log('   ' + r);
};
