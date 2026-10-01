/**
 * search/answer.js — a result is an answer, not a link.
 *
 * The rule this file exists to enforce: nobody may leave a row of this list
 * knowing less than they would have known from the dossier's first screen. A
 * place prints the years it was held, its legal status at the year on the map,
 * how Britain took it and how it ended. An event prints its date and what
 * happened. A person prints what they did and where. A source prints what
 * rests on it. And an absence prints the whole apparatus, because the absence
 * is the piece's argument.
 *
 * The row is also where the name the reader typed is honoured: if they asked
 * for Ceylon and this atlas files the place as Sri Lanka, the row says so, and
 * says which years the name they typed was the one in use. Silently
 * substituting the modern name would teach that the old name was a mistake.
 */

import { el, frag } from '../core/util.js';
import { nameInUse } from './corpus.js';

const KIND_WORD = {
  place: 'Place', unit: 'Ground', event: 'Event',
  person: 'Person', party: 'Taken from', source: 'Source',
  absence: 'An absence', year: 'A year', index: 'The archive itself',
};

const cut = (s, n) => {
  const t = String(s || '').trim();
  if (t.length <= n) return t;
  const i = t.lastIndexOf(' ', n);
  return t.slice(0, i > n * 0.6 ? i : n).replace(/[,;:]$/, '') + '…';
};

const num = (t) => el('span.num', { text: String(t) });

/**
 * THE SAME FIGURE, TWICE, IN CONSECUTIVE SENTENCES.
 *
 * A disclosure event carries both a `summary` and a `toll.money`, and on the
 * Kenya absence they overlap: the card printed "…paid 19.9 million pounds to
 * 5,228 Kenyan claimants and expressed regret. 19.9 million pounds paid to
 * 5,228 claimants, an average of about 3,800 pounds each, plus a memorial in
 * Nairobi." Two sentences, one number, and a reader who has just been told the
 * atlas is scrupulous about figures now watches it stammer.
 *
 * So the toll is trimmed against what has already been said: leading clauses
 * whose every figure is already in the summary are dropped, and what is left —
 * the part that adds — is kept. Nothing is invented and nothing that carries a
 * new figure is ever cut.
 */
function trimRepeat(tailRaw, saidRaw) {
  const tail = String(tailRaw || '').trim();
  if (!tail) return '';
  const figs = (s) => (String(s).match(/\d[\d,. ]*\d|\d/g) || [])
    .map((x) => x.replace(/[.,\s]+$/, '').replace(/[ ,]/g, ''));
  const known = new Set(figs(saidRaw));
  /* Comma-plus-space only: splitting on a bare comma cuts "5,228" in half. */
  const parts = tail.split(/,\s+/);
  let i = 0;
  while (i < parts.length - 1) {
    const f = figs(parts[i]);
    if (!f.length || !f.every((x) => known.has(x))) break;
    i++;
  }
  if (!i) return tail;
  const out = parts.slice(i).join(', ').trim();
  return out ? out.charAt(0).toUpperCase() + out.slice(1) : '';
}

function mechanismLabels(data) {
  const m = (data.meta && data.meta.dataset) || {};
  const map = new Map();
  for (const x of m.acquisitionMechanism || []) map.set('a:' + x.id, x.label);
  for (const x of m.departureMechanism || []) map.set('d:' + x.id, x.label);
  return map;
}

export function makeAnswerRenderer(ctx) {
  const { data, format } = ctx;
  const mech = mechanismLabels(data);
  const statusLabel = (id) => {
    const s = (data.statuses || []).find((x) => x.id === id);
    return (s && s.label) || format.statusLabel(id);
  };

  /* ---------------------------------------------------------------- rows -- */

  function head(r, extra) {
    const bits = [el('span.sr__kind', { dataset: { k: r.kind } }, KIND_WORD[r.kind] || r.kind)];
    if (extra) bits.push(extra);
    return el('p.sr__eyebrow', bits);
  }

  /** "you typed Ceylon" — printed only when it is not the headline name. */
  function via(r) {
    if (!r.via) return null;
    const same = String(r.via).toLowerCase() === String(r.title).toLowerCase();
    if (same) return null;
    return el('p.sr__via',
      'matched on ', el('em', { text: '“' + r.via + '”' }),
      r.viaKind ? ' — ' + r.viaKind : '');
  }

  function placeRow(r, year) {
    const t = r.t;
    const at = data.territoryAt(t.id, year);
    const inUse = nameInUse(data, t, year);
    const held = t.acquiredYear != null
      ? format.yearRange(t.acquiredYear, t.stillBritish ? null : t.endedYear)
      : null;

    const lines = [];
    if (at && at.active && at.controlled) {
      lines.push(el('p.sr__at',
        'In ', num(format.year(year)), ': ',
        el('strong', { text: statusLabel(at.status) }),
        at.since != null ? [' · held since ', num(format.year(at.since))] : null,
        at.partial ? ' · British control did not fill it' : null));
    } else if (at && at.active) {
      lines.push(el('p.sr__at', 'In ', num(format.year(year)), ': in the atlas, not under British authority.'));
    } else {
      lines.push(el('p.sr__at.sr__at--out',
        'Not British in ', num(format.year(year)), '.',
        held ? [' British ', num(held), '.'] : null));
    }

    const acq = (t.acquisitions || [])[0];
    const dep = (t.departures || [])[t.departures.length - 1];
    const facts = [];
    if (acq) {
      facts.push(el('div.sr__fact',
        el('dt', { text: 'Taken' }),
        el('dd', mech.get('a:' + acq.mechanism) || acq.mechanism,
          acq.year != null ? [', ', num(format.year(acq.year))] : null,
          acq.how ? el('span.sr__how', { text: ' — ' + cut(acq.how, 110) }) : null)));
    }
    if (dep) {
      facts.push(el('div.sr__fact',
        el('dt', { text: 'Ended' }),
        el('dd', mech.get('d:' + dep.mechanism) || dep.mechanism,
          dep.year != null ? [', ', num(format.year(dep.year))] : null,
          dep.how ? el('span.sr__how', { text: ' — ' + cut(dep.how, 110) }) : null)));
    } else if (t.stillBritish) {
      facts.push(el('div.sr__fact', el('dt', { text: 'Ended' }), el('dd', { text: 'It has not. Still British territory.' })));
    }

    return frag(
      head(r, inUse && inUse.name
        ? el('span.sr__inuse', 'the name in use in ', num(format.year(year)), ': ',
          el('em', { text: inUse.name }), inUse.usedBy === 'local' ? ' (locally)' : '')
        : null),
      el('h3.sr__name', { text: t.name }),
      via(r),
      ...lines,
      facts.length ? el('dl.sr__facts', facts) : null,
    );
  }

  function unitRow(r, year) {
    const u = r.u || {};
    const owners = data.territoriesForUnit(r.id) || [];
    let holder = null;
    for (const t of owners) {
      const at = data.territoryAt(t.id, year);
      if (at && at.active && at.controlled && (at.units || []).includes(r.id)) { holder = { t, at }; break; }
    }
    return frag(
      head(r, el('span.sr__inuse', { text: u.region || '' })),
      el('h3.sr__name', { text: u.name || r.id }),
      via(r),
      holder
        ? el('p.sr__at', 'In ', num(format.year(year)), ' this ground was ',
          el('strong', { text: holder.t.name }), ' — ', statusLabel(holder.at.status), '.')
        : el('p.sr__at.sr__at--out', 'Nothing British is painted here in ', num(format.year(year)), '.',
          owners.length ? ' This atlas files it under ' + format.list(owners.slice(0, 3).map((t) => t.name)) + '.' : ' No British territory in this atlas covers it.'),
      u.area_km2 ? el('p.sr__meta', num(format.area(u.area_km2)), u.tiny ? ' · drawn at a minimum size so it can be clicked' : '') : null,
    );
  }

  function eventRow(r, year) {
    const e = r.e;
    const d = data.readDate(e.date) || {};
    const end = e.endDate ? (data.readDate(e.endDate) || {}) : null;
    return frag(
      head(r, el('span.sr__inuse', { text: e.kind ? String(e.kind).replace(/-/g, ' ') : '' })),
      el('h3.sr__name', { text: e.title }),
      via(r),
      el('p.sr__at', num(d.display || (e.year != null ? String(e.year) : 'undated')),
        end && end.display ? [' – ', num(end.display)] : null,
        e.changedStatus ? ' · it changed what the map shows' : null),
      e.summary ? el('p.sr__body', { text: cut(e.summary, 190) }) : null,
    );
  }

  function personRow(r) {
    const first = r.appearances[0] || {};
    /* Mono is for figures only (DESIGN §6.2), so the place is set in the sans
       and only the year is tabular. Round 1 set "The migrated archives and the
       Mau Mau settlement" in IBM Plex Mono. */
    const where = [];
    for (const a of r.appearances.slice(0, 3)) {
      if (!a.place) continue;
      if (where.length) where.push(document.createTextNode(' · '));
      where.push(document.createTextNode(a.place));
      if (a.year != null) where.push(document.createTextNode(' '), num(format.year(a.year)));
    }
    return frag(
      head(r, r.lived ? el('span.sr__inuse', num(r.lived)) : null),
      el('h3.sr__name', { text: r.title }),
      via(r),
      first.role ? el('p.sr__body', { text: cut(first.role, 190) }) : null,
      where.length ? el('p.sr__meta', 'In this atlas at ', ...where,
        r.appearances.length > 3 ? ' and ' + (r.appearances.length - 3) + ' more' : '') : null,
    );
  }

  /**
   * The other party. DIDACTIC_SPEC M17: empire is a story about relationships
   * under coercion, so the row leads with what this party lost, in the shard's
   * own words, and not with what Britain gained.
   */
  function partyRow(r) {
    const loss = r.losses.find((l) => l.lost) || r.losses[0] || {};
    return frag(
      head(r, r.partyKind ? el('span.sr__inuse', { text: String(r.partyKind).replace(/-/g, ' ') }) : null),
      el('h3.sr__name', { text: r.title }),
      via(r),
      /* NOT "Lost British India in 1792". `place` is the atlas record the
         acquisition belongs to, not the thing this party lost — so the old
         line told a reader that the Sultanate of Mysore lost British India,
         and that the peasants of Bengal lost the Bengal Presidency. What they
         actually lost is the sentence underneath, in the shard's own words.
         This line locates them, and locating them works for every kind of
         party the dataset holds, including the ones with nothing to lose. */
      el('p.sr__at', 'On the other side of ', el('strong', { text: loss.place || '' }),
        loss.year != null ? [', ', num(format.year(loss.year))] : null,
        loss.mechanism ? [' — ', mech.get('a:' + loss.mechanism) || loss.mechanism] : null, '.'),
      loss.lost ? el('p.sr__body', { text: cut(loss.lost, 200) }) : null,
      r.losses.length > 1 ? el('p.sr__meta', 'Named in ', num(String(r.losses.length)),
        ' of this atlas’s acquisitions.') : null,
    );
  }

  /** A bare year, answered: what the atlas holds then and what moved that year. */
  function yearRow(r) {
    const m = r.metrics || {};
    const changed = (r.events || []).filter((e) => e.changedStatus).length;
    return frag(
      head(r, r.clamped ? el('span.sr__inuse', { text: 'outside this atlas — showing the nearest year it holds' }) : null),
      el('h3.sr__name', num(format.year(r.year))),
      el('p.sr__at',
        num(format.number(m.controlledUnits || 0)), ' pieces of ground under British authority, in ',
        num(format.number(m.territories || 0)), ' territories.'),
      el('p.sr__meta',
        (r.events || []).length
          ? [num(String(r.events.length)), ' event', r.events.length === 1 ? '' : 's', ' dated here',
            changed ? [' — ', num(String(changed)), ' changed what the map shows'] : null, '.']
          : ['Nothing in this atlas is dated to this year.']),
    );
  }

  /** The index of holes, offered as an answer to a question about the archive. */
  function indexRow(r) {
    const c = r.counts || {};
    return frag(
      el('p.sr__eyebrow',
        el('span.sr__kind', { dataset: { k: 'absence' } }, 'The archive itself'),
        el('span.sr__inuse', { text: 'every hole this atlas can name' })),
      el('h3.sr__name', { text: r.title }),
      el('p.sr__lede', { text: 'You are asking about the record rather than about a place in it. '
        + 'This atlas keeps a count of what it has no answer to.' }),
      el('p.sr__at',
        num(String(c.total || 0)), ' questions it cannot answer — ',
        num(String(c.destroyed || 0)), ' because somebody destroyed the record, ',
        num(String(c['never-made'] || 0)), ' because nobody ever made the count, and ',
        num(String(c['contested-range'] || 0)), ' because the record survives and will not settle it.'),
      el('p.sr__cta', { text: 'Enter · open the index, with the three shapes counted' }),
    );
  }

  function sourceRow(r) {
    const places = r.cites.filter((c) => c.kind === 'place').length;
    const events = r.cites.length - places;
    return frag(
      head(r, el('span.sr__inuse', { text: (r.workKind || 'work').replace(/-/g, ' ') })),
      el('h3.sr__name', el('cite', { text: r.title }), r.year ? [' ', num('(' + r.year + ')')] : null),
      r.author ? el('p.sr__at', { text: r.author + (r.publisher ? ' · ' + r.publisher : '') }) : null,
      via(r),
      el('p.sr__meta',
        'Carries ', num(String(r.cites.length)), ' claim', r.cites.length === 1 ? '' : 's',
        ' in this atlas',
        places ? [' — ', num(String(places)), ' place', places === 1 ? '' : 's'] : null,
        events ? [', ', num(String(events)), ' event', events === 1 ? '' : 's'] : null, '.'),
      r.supports.length ? el('p.sr__body', { text: cut(r.supports[0], 150) }) : null,
      el('p.sr__cta', { text: 'Enter · put only what rests on this work on the map' }),
    );
  }

  /* ------------------------------------------------------------ absence -- */

  function absenceRow(r, full, headed) {
    const rows = [];

    rows.push(el('div.sr__fact',
      el('dt', { text: r.silenceKind === 'destroyed' ? 'Who destroyed it' : 'Who was counting' }),
      el('dd', { text: full ? (r.agentUnknown ? r.agentUnknownNote : r.agent)
        : cut(r.agentUnknown ? r.agentUnknownNote : r.agent, 150) })));

    const when = [];
    if (r.when) when.push(num(r.when));
    else if (Number.isFinite(r.year)) when.push(num(format.year(r.year)));
    if (!when.length && r.heldFrom != null) {
      when.push('during British rule here, ', num(format.yearRange(r.heldFrom, r.stillBritish ? null : r.heldTo)));
    }
    if (when.length) rows.push(el('div.sr__fact', el('dt', { text: 'When' }), el('dd', when)));

    if (r.disclosure) {
      const summary = r.disclosure.summary || r.disclosure.title || '';
      /* THE SAME FIGURE, TWICE, IN CONSECUTIVE SENTENCES. The disclosure's
         summary and its toll both carry the settlement, so the Kenya card read
         "…paid 19.9 million pounds to 5,228 Kenyan claimants and expressed
         regret. 19.9 million pounds paid to 5,228 claimants, an average of…".
         The toll only earns its place when it says something the summary has
         not: compare their figures and print it only then. */
      const money = trimRepeat(r.disclosure.money, summary);
      rows.push(el('div.sr__fact',
        el('dt', { text: 'What was disclosed, and when' }),
        el('dd',
          num(r.disclosure.from || ''), r.disclosure.to ? [' → ', num(r.disclosure.to)] : null, ' — ',
          cut(summary, full ? 400 : 96))));
      /* What the toll adds once the repetition is off it gets its own label,
         because the remainder is a phrase and a phrase needs a heading, not a
         full stop after somebody else's sentence. */
      if (full && money) {
        rows.push(el('div.sr__fact', el('dt', { text: 'What it came to' }), el('dd', { text: money })));
      }
    } else if (full) {
      rows.push(el('div.sr__fact',
        el('dt', { text: 'What was disclosed, and when' }),
        el('dd.sr__none', { text: 'This atlas records no later disclosure that changed this. That is a statement about our sources, not a promise that none exists.' })));
    }

    if (r.range) {
      rows.push(el('div.sr__fact',
        el('dt', { text: 'What this atlas will say' }),
        el('dd',
          num(format.number(r.range.low)), ' to ', num(format.number(r.range.high)), ' ', r.range.unit,
          el('span.sr__how', { text: ' — a range, because the record cannot support one number.' }))));
    }
    if (full && r.counted && r.counted.from) {
      /* The counted number set beside the uncounted one — DIDACTIC_SPEC §4,
         M18: knowing why a number is uncertain is the higher skill, and the
         way to teach it is to put a countable thing next to an uncountable
         one. The sentence carries the figure, so we do not print it twice. */
      rows.push(el('div.sr__fact',
        el('dt', { text: 'What was counted' }),
        el('dd', { text: cut(r.counted.from, full ? 400 : 170) })));
    }

    rows.push(el('div.sr__fact.sr__fact--settle',
      el('dt', { text: 'What would settle it' }),
      el('dd', { text: full ? r.whatWouldSettleIt : cut(r.whatWouldSettleIt, 155) })));

    return frag(
      el('p.sr__eyebrow',
        el('span.sr__kind', { dataset: { k: 'absence' } }, 'An absence'),
        el('span.sr__inuse', { text: r.silenceLabel })),
      /* The rail sheet already prints this question in its own head, at
         reading size, two centimetres above. Printing it again — and the lede
         band prints it a third time — is the same sentence three times on one
         screen for a reader who asked it once. */
      headed ? null : el('h3.sr__name', { text: r.title }),
      el('p.sr__lede', { text: r.answer }),
      r.quote ? el('blockquote.sr__quote', el('p', { text: '“' + r.quote + '”' }),
        el('cite', { text: 'this atlas’s own record of ' + r.owner
          + (r.what ? ', on ' + r.what.replace(/([A-Z])/g, ' $1').toLowerCase() : '') })) : null,
      el('dl.sr__facts.sr__facts--absence', rows),
      el('p.sr__cta', { text: full ? '' : 'Enter · draw the hole on the map and read this in full' }),
    );
  }

  /* ---------------------------------------------------------------- api -- */

  return function renderAnswer(r, year, opts) {
    const full = !!(opts && opts.full);
    const headed = !!(opts && opts.headed);
    switch (r.kind) {
      case 'place': return placeRow(r, year);
      case 'unit': return unitRow(r, year);
      case 'event': return eventRow(r, year);
      case 'person': return personRow(r);
      case 'party': return partyRow(r);
      case 'year': return yearRow(r);
      case 'source': return sourceRow(r);
      case 'index': return indexRow(r);
      case 'absence': return absenceRow(r, full, headed);
      default: return el('p', { text: r.title });
    }
  };
}
