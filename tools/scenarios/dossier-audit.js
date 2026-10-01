/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 — dossier audit over the whole dataset, run inside the real app against
 * the real data layer. Imports the piece's own modules dynamically, so this
 * measures the shipped code, not a fixture.
 *   node tools/inspect.js tools/scenarios/dossier-audit.js --out /tmp/dsr-audit
 */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });

  const res = await page.evaluate(async () => {
    const F = await import('/app/js/panels/dossier/fields.js');
    const C = await import('/app/js/panels/dossier/claims.js');
    const V = await import('/app/js/panels/dossier/vocab.js');
    const data = window.BEA.data;

    const out = {
      total: 0, noHere: [], noNonBritish: [], noChips: [], noFranchiseAtAnyYear: [],
      chipRel: {}, unknownStatus: [], unknownAcqMech: [], unknownDepMech: [],
      chipTotal: 0, spansWithoutFranchise: 0, spansTotal: 0, becauseChips: 0, causedChips: 0,
      sampleChips: [],
    };
    for (const t of data.territories) {
      out.total++;
      const a = F.actorsOf(t);
      if (!a.here.length) out.noHere.push(t.id);
      if (!a.here.length && !a.other.length) out.noNonBritish.push(t.id);

      const y = t.acquiredYear != null ? t.acquiredYear + 1 : (t.firstYear || 1900);
      const links = C.linksFor(data, t, y);
      let n = 0;
      for (const [, list] of links) for (const l of list) {
        n++; out.chipRel[l.rel] = (out.chipRel[l.rel] || 0) + 1;
        if (l.rel === 'because') out.becauseChips++;
        if (l.rel === 'caused') out.causedChips++;
      }
      out.chipTotal += n;
      if (!n) out.noChips.push(t.id);
      if (out.sampleChips.length < 6 && n > 2) {
        out.sampleChips.push({ id: t.id, chips: [...links].flatMap(([c, l]) => l.map(x => c + ' -> ' + x.rel + ':' + x.text)) });
      }

      let anyFranchise = false;
      for (const s of t.spans) {
        out.spansTotal++;
        if (s.franchise) anyFranchise = true; else out.spansWithoutFranchise++;
        if (!(s.status in V.STATUS_FAMILY) && !out.unknownStatus.includes(s.status)) out.unknownStatus.push(s.status);
      }
      if (!anyFranchise) out.noFranchiseAtAnyYear.push(t.id);
      for (const q of t.acquisitions) if (!(q.mechanism in V.ACQUISITION_VERB) && !out.unknownAcqMech.includes(q.mechanism)) out.unknownAcqMech.push(q.mechanism);
      for (const q of t.departures) if (!(q.mechanism in V.DEPARTURE_VERB) && !out.unknownDepMech.includes(q.mechanism)) out.unknownDepMech.push(q.mechanism);
    }
    return out;
  });

  log('territories:', res.total);
  log('no local actors (renders [missing local actors]):', res.noHere.length, JSON.stringify(res.noHere));
  log('no non-British name at all:', res.noNonBritish.length, JSON.stringify(res.noNonBritish));
  log('dossiers with zero because-chips of any kind:', res.noChips.length, JSON.stringify(res.noChips.slice(0, 20)));
  log('chips total:', res.chipTotal, 'by relation:', JSON.stringify(res.chipRel));
  log('spans:', res.spansTotal, 'without a franchise line:', res.spansWithoutFranchise,
      '| territories with no franchise at any year:', res.noFranchiseAtAnyYear.length);
  log('unknown status ids:', JSON.stringify(res.unknownStatus));
  log('unknown acquisition mechanisms:', JSON.stringify(res.unknownAcqMech));
  log('unknown departure mechanisms:', JSON.stringify(res.unknownDepMech));
  log('sample chips:\n' + res.sampleChips.map(s => '  ' + s.id + '\n    ' + s.chips.join('\n    ')).join('\n'));

  /* Banned strings across every dossier this piece would render, checked on the
     text the piece itself writes plus the dataset strings it prints. */
  const banned = await page.evaluate(async () => {
    const BANNED = ['pacified', 'civilising mission', 'rich tapestry', 'played a key role',
      'left a lasting legacy', 'both sides', 'it is important to note', 'arguably',
      'many would say', 'mixed legacy', 'the natives revolted', 'unrest'];
    const V = await import('/app/js/panels/dossier/vocab.js');
    const hits = [];
    const scan = (where, s) => {
      const low = String(s).toLowerCase();
      for (const b of BANNED) if (low.includes(b)) hits.push(where + ' :: ' + b);
      if (/\bacquired\b/.test(low)) hits.push(where + ' :: acquired');
      if (/\bnatives?\b/.test(low)) hits.push(where + ' :: native');
      if (/\btribal?\b|\btribes\b/.test(low)) hits.push(where + ' :: tribe');
      if (/\bgranted\b/.test(low)) hits.push(where + ' :: granted');
    };
    for (const [k, tab] of Object.entries(V)) {
      if (typeof tab !== 'object' || tab == null) continue;
      for (const [id, val] of Object.entries(tab)) {
        if (typeof val === 'string') scan('vocab.' + k + '.' + id, val);
        else if (val && typeof val === 'object') for (const [f, v2] of Object.entries(val)) if (typeof v2 === 'string') scan('vocab.' + k + '.' + id + '.' + f, v2);
      }
    }
    return hits;
  });
  log('banned strings in this piece\'s own vocabulary:', JSON.stringify(banned));

  /* Acceptance test 2, done properly: render every dossier and scan the text a
     student would actually read, separating strings this piece writes from
     strings that arrive out of the shards. */
  const scan = await page.evaluate(async () => {
    const data = window.BEA.data, store = window.BEA.store;
    const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const TESTS = [
      [/\bacquired\b/, 'acquired'], [/\bpacified\b/, 'pacified'], [/civilising mission/, 'civilising mission'],
      [/\bnatives?\b/, 'native'], [/\btribes?\b|\btribal\b/, 'tribe'], [/\bunrest\b/, 'unrest'],
      [/rich tapestry/, 'rich tapestry'], [/played a key role/, 'played a key role'],
      [/left a lasting legacy/, 'left a lasting legacy'], [/\bboth sides\b/, 'both sides'],
      [/it is important to note/, 'it is important to note'], [/\barguably\b/, 'arguably'],
      [/many would say/, 'many would say'], [/mixed legacy/, 'mixed legacy'],
      [/the empire on which the sun never set/, 'sun never set'],
    ];
    /* Every string this piece writes itself, harvested from the DOM by class:
       the classes below are the piece's own copy, never dataset text. */
    const OWN = '.dsr__eyebrow, .dsr__k, .src__k, .src__class-k, .dsr__foldnote, .dsr__srccount, .dsr__absent, .dsr__missing, .dsr-chip__rel, .dsr__nocount, .dsr__cp-kind';
    const hits = { own: {}, dataset: {} };
    let n = 0;
    for (const t of data.territories) {
      const y = t.acquiredYear != null ? Math.min(t.acquiredYear + 1, data.bounds.max) : (t.firstYear || 1900);
      store.batch(d => { d('setYear', y); d('select', t.id); }); store.flush();
      await frame();
      const root = document.querySelector('.dossier');
      if (!root) continue;
      n++;
      const ownText = [...root.querySelectorAll(OWN)].map(e => e.textContent).join(' ').toLowerCase();
      const all = root.innerText.toLowerCase();
      for (const [re, name] of TESTS) {
        if (re.test(ownText)) (hits.own[name] = hits.own[name] || []).push(t.id);
        else if (re.test(all)) (hits.dataset[name] = hits.dataset[name] || []).push(t.id);
      }
    }
    const squash = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.length]));
    return { dossiersScanned: n, own: squash(hits.own), dataset: squash(hits.dataset),
      datasetExamples: Object.fromEntries(Object.entries(hits.dataset).map(([k, v]) => [k, v.slice(0, 4)])) };
  });
  log('BANNED-STRING SCAN over every rendered dossier:', JSON.stringify(scan, null, 1));
};
