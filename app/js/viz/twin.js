/**
 * viz/twin.js — 1947: TWO MEASUREMENTS OF ONE DAY. P08's sixth surface.
 *
 * WHY IT EXISTS. DIDACTIC_SPEC §4 M14 — "Indian independence in 1947 was the
 * end of the empire" — names ONE owner and one artefact: "viz (twin charts:
 * population lost vs area lost, 1947)". FEATURE_SPEC charge 10 names the same
 * pair. Nothing in the app built it, and M14 is the misconception a student
 * arrives with: 1947, India goes, the story is over.
 *
 * THE INTERACTION IS THE ARGUMENT. A student who believes M14 believes people
 * and land are the same measurement. So they are asked for BOTH, on the same
 * hundred-mark field, before anything is drawn — and almost everyone puts the
 * two marks close together. The record puts them fifty points apart. The error
 * is not a number they got wrong; it is the distance between their own two
 * marks, which is the misconception made visible in their own handwriting.
 *
 * EVERY FIGURE HERE IS COMPUTED IN THE BROWSER, NOT WRITTEN DOWN.
 *   · land  — the sum of the modern outline of every geographic unit this
 *             atlas records as British in 1947, from data.statusAt(1947)
 *             crossed with app/data/geo/units.index.json, partial coverage at
 *             half; the same method as series.js and tools/audit-timeline.js.
 *   · people — the sum of the counted population figures the dataset holds for
 *             the territories held in 1947. NOT a census of the empire, and
 *             the component says so: 94 of the 145 territories carry a counted
 *             figure, they were counted in different years, and nested
 *             entries are excluded so nobody is counted twice.
 *   · territories — counted, before and after.
 *
 * AND IT CHECKS THE ATLAS AGAINST ITSELF, IN PUBLIC. The dataset's own record
 * for `partition-of-india-1947` says the day "removed about three quarters of
 * the empire's population in a single day, and almost none of its territory".
 * The geometry gives a different number for the first half. Rather than pick
 * one, the surface prints both, names the gap, and explains what would close
 * it — which is DIDACTIC_SPEC M18 done to our own prose rather than to someone
 * else's.
 *
 * Keyboard: two sliders, arrows move, Shift+arrow moves ten, Home/End the ends,
 * Enter commits both. Tab moves between them. Nothing is behind a hover.
 */

import { el, fill, append } from '../core/util.js';
import { citation, warrantLine, checkWarrant } from './figures.js';
import { TWIN } from './content.js';

const PARTIAL_WEIGHT = 0.5;
const YEAR = 1947;
const AFTER = 1948;

/* ------------------------------------------------------------ measuring -- */

function areaOf(data, unitId) {
  const m = data.unitMeta && data.unitMeta.get ? data.unitMeta.get(unitId) : null;
  const a = m && Number(m.area_km2);
  return Number.isFinite(a) ? a : 0;
}

/** Territories held in a year, with the land each one accounts for. */
function heldIn(data, year) {
  const km2 = new Map();
  for (const [unitId, e] of data.statusAt(year)) {
    if (!e.territoryId) continue;
    const w = e.partial ? PARTIAL_WEIGHT : 1;
    km2.set(e.territoryId, (km2.get(e.territoryId) || 0) + areaOf(data, unitId) * w);
  }
  return km2;
}

/**
 * One counted population figure per territory, excluding entries nested inside
 * another (Bengal Presidency sits inside British India; adding both counts the
 * same people twice). Exactly the rule series.js states and for the same
 * reason.
 */
function countedPeople(data) {
  const out = new Map();
  for (const t of data.territories || []) {
    if (t.nestedWithin) continue;
    const p = t.peak;
    const v = p && Number(p.population);
    if (!Number.isFinite(v) || v <= 0) continue;
    out.set(t.id, { value: v, year: Number(p.populationYear) || null, name: t.name });
  }
  return out;
}

export function measure1947(data) {
  const now = heldIn(data, YEAR);
  const later = heldIn(data, AFTER);
  const people = countedPeople(data);

  let landAll = 0, landGone = 0, popAll = 0, popGone = 0;
  let countedAll = 0, countedGone = 0, landUncounted = 0;
  const gone = [];
  for (const [id, km2] of now) {
    landAll += km2;
    const left = !later.has(id);
    if (left) landGone += km2;
    const p = people.get(id);
    if (p) {
      popAll += p.value; countedAll += 1;
      if (left) { popGone += p.value; countedGone += 1; }
    } else {
      /* What the missing figures are worth in the one currency we do have for
         them. It is the only honest thing this component can say about the
         direction of the error. */
      landUncounted += km2;
    }
    if (left) gone.push({ id, km2: Math.round(km2), pop: p ? p.value : 0, popYear: p ? p.year : null, name: p ? p.name : id });
  }
  gone.sort((a, b) => b.pop - a.pop || b.km2 - a.km2);

  const biggest = gone[0] || null;
  return {
    year: YEAR,
    landAll: Math.round(landAll),
    landGone: Math.round(landGone),
    landPct: landAll ? (landGone / landAll) * 100 : 0,
    popAll, popGone,
    popPct: popAll ? (popGone / popAll) * 100 : 0,
    countedAll, countedGone,
    landUncounted: Math.round(landUncounted),
    landUncountedPct: landAll ? (landUncounted / landAll) * 100 : 0,
    territoriesBefore: now.size,
    territoriesGone: gone.length,
    territoriesAfter: later.size,
    territoryPct: now.size ? (gone.length / now.size) * 100 : 0,
    uncounted: now.size - countedAll,
    gone,
    biggest,
  };
}

/* --------------------------------------------------------------- build --- */

export function buildTwin(ctx, spec = TWIN, opts = {}) {
  const onPath = !!opts.onPath;
  const { data, bus, format } = ctx;
  const m = measure1947(data);
  const root = el('div.viz.viz-twin', { dataset: { state: 'asking' } });

  const anchorOk = checkWarrant(data, spec.warrant).ok;

  /* ------------------------------------------------------------ the ask */
  const anchor = el('p.viz-flow__anchor', { html: spec.anchorLine });
  const anchorCite = citation(data, spec);
  const ask = el('div.cx-ask.viz-twin__ask',
    el('span.cx-ask__eyebrow', { text: 'Commit two guesses' }),
    el('p.cx-ask__q', { text: spec.question }));
  const said = el('p.cx-note', { html: spec.scaleSaid });

  const bars = [
    { key: 'people', label: spec.peopleLabel, start: 40, truth: m.popPct },
    { key: 'land', label: spec.landLabel, start: 40, truth: m.landPct },
  ];
  const field = el('div.viz-twin__field');
  for (const b of bars) {
    b.value = b.start;
    b.bar = el('div.viz-hundred__bar', { dataset: { key: b.key } });
    b.fill = el('span.viz-hundred__fill');
    b.yours = el('span.viz-twin__yours', { hidden: true });
    b.handle = el('button.viz-hundred__handle', {
      type: 'button', role: 'slider',
      'aria-label': b.label + ' — out of every hundred. Arrow keys move it, Enter commits both.',
      'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(b.start),
    });
    b.bar.append(b.fill, b.yours, b.handle);
    b.read = el('span.viz-twin__read.num', { text: String(b.start) });
    field.append(
      el('div.viz-twin__row', { dataset: { key: b.key } },
        el('span.viz-twin__lab', { text: b.label }),
        b.read,
        b.bar,
        el('div.viz-hundred__ends',
          el('span.viz-hundred__end.num', { text: 'none of them' }),
          el('span.viz-hundred__end.num', { text: 'all of them' }))));
  }
  const spread = el('p.viz-twin__spread');
  const commit = el('button.viz-ratio__commit', { type: 'button', text: 'Commit both guesses', onclick: () => doCommit() });

  const reveal = el('div.viz-twin__reveal', { hidden: true });

  append(root, [anchor, anchorCite, ask, said, field, spread, commit, reveal]);

  /* -------------------------------------------------------------- guess */
  let committed = false;

  function paintOne(b) {
    b.handle.style.insetInlineStart = b.value + '%';
    b.fill.style.inlineSize = b.value + '%';
    b.read.textContent = String(b.value);
    b.handle.setAttribute('aria-valuenow', String(b.value));
    b.handle.setAttribute('aria-valuetext', b.value + ' in every hundred — ' + b.label);
  }
  function paint() {
    for (const b of bars) paintOne(b);
    if (!committed) {
      const d = Math.abs(bars[0].value - bars[1].value);
      fill(spread,
        el('span.viz-ratio__yousay', { text: 'Your two marks are ' }),
        el('span.num.viz-ratio__guess', { text: String(d) }),
        el('span.viz-ratio__u', { text: d === 1 ? ' point apart.' : ' points apart.' }));
    }
  }

  function fromClientX(b, x) {
    const r = b.bar.getBoundingClientRect();
    if (!r.width) return b.value;
    return Math.max(0, Math.min(100, Math.round(((x - r.left) / r.width) * 100)));
  }

  for (const b of bars) {
    let dragging = false;
    b.bar.addEventListener('pointerdown', (ev) => {
      if (committed) return;
      dragging = true;
      try { b.bar.setPointerCapture(ev.pointerId); } catch (_) { /* older engines */ }
      b.value = fromClientX(b, ev.clientX); paint(); ev.preventDefault();
    });
    b.bar.addEventListener('pointermove', (ev) => { if (dragging && !committed) { b.value = fromClientX(b, ev.clientX); paint(); } });
    const up = () => { dragging = false; };
    b.bar.addEventListener('pointerup', up);
    b.bar.addEventListener('pointercancel', up);
    b.handle.addEventListener('keydown', (ev) => {
      if (committed) return;
      const big = ev.shiftKey ? 10 : 1;
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') b.value = Math.max(0, b.value - big);
      else if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') b.value = Math.min(100, b.value + big);
      else if (ev.key === 'Home') b.value = 0;
      else if (ev.key === 'End') b.value = 100;
      else if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); doCommit(); return; }
      else return;
      ev.preventDefault(); paint();
    });
  }
  paint();

  /* ------------------------------------------------------------- reveal */
  function doCommit() {
    if (committed) return;
    committed = true;
    root.dataset.state = 'revealed';
    commit.hidden = true;

    const gPeople = bars[0].value, gLand = bars[1].value;
    const yourGap = Math.abs(gPeople - gLand);
    const realGap = Math.round(m.popPct - m.landPct);

    for (const b of bars) {
      b.handle.disabled = true;
      b.handle.setAttribute('aria-disabled', 'true');
      /* A grab handle that cannot be grabbed is furniture. The dashed rule
         underneath it says the same thing and says it once. */
      b.handle.hidden = true;
      /* The student's own mark stays on the field. A reveal that erases the
         guess erases the lesson. */
      b.yours.style.insetInlineStart = b.value + '%';
      /* Near the right-hand end the label would print past the bar, so it
         flips to the inside. Nothing in this app is allowed off its own edge. */
      b.yours.dataset.side = b.value > 86 ? 'left' : 'right';
      b.yours.hidden = false;
      /* The bar becomes the ANSWER and the dashed rule stays where the reader
         put it. Leaving the fill on the guess makes the largest mark on the
         chart the wrong number, which is the opposite of the lesson. */
      b.fill.style.inlineSize = b.truth.toFixed(2) + '%';
      b.bar.dataset.state = 'revealed';
      fill(b.read,
        el('span.viz-twin__was', { text: b.value + ' → ' }),
        el('span.viz-twin__is', { text: Math.round(b.truth) }));
    }

    fill(spread,
      el('span', { text: 'You put people and land ' }),
      el('span.num.viz-ratio__guess', { text: String(yourGap) }),
      el('span', { text: (yourGap === 1 ? ' point' : ' points') + ' apart. This atlas’s own records put them ' }),
      el('span.num.viz-twin__gap', { text: String(realGap) }),
      el('span', { text: ' apart. That distance is the whole of the misunderstanding: 1947 took most of the people Britain ruled and left it almost all of the map.' }));

    buildReveal();
    reveal.hidden = false;

    bus.emit('ledger:append', {
      kind: 'predicted',
      claimId: 'p08:twin:1947',
      t: spec.t || 'T14',
      prompt: 'In 1947, what share of the empire’s people, and what share of its land, stopped being British?',
      youSaid: gPeople + ' in 100 of the people, ' + gLand + ' in 100 of the land',
      answer: Math.round(m.popPct) + ' in 100 of the counted people, ' + Math.round(m.landPct) + ' in 100 of the land',
      verdict: yourGap < realGap / 2 ? 'corrected' : null,
      year: YEAR,
      unitIds: [],
    });
    bus.emit('viz:committed', { twin: '1947', guess: { people: gPeople, land: gLand }, answer: { people: Math.round(m.popPct), land: Math.round(m.landPct) } });
    if (!onPath) bus.emit('ask:setYear', { year: YEAR });
    if (ctx.util && ctx.util.announce) {
      ctx.util.announce('You put them ' + yourGap + ' points apart. The records put them ' + realGap + ' apart: '
        + Math.round(m.popPct) + ' in a hundred of the counted people, ' + Math.round(m.landPct) + ' in a hundred of the land.');
    }
  }

  function fig(v, label) {
    return el('div.cx-fig.cx-fig--sm',
      el('span.cx-fig__v.num', { text: v }),
      el('span.cx-fig__l', { text: label }));
  }

  function buildReveal() {
    const pct = (v) => (v >= 10 ? Math.round(v) : v.toFixed(1)) + '%';
    fill(reveal,
      el('h4.viz-h', { text: 'What 1947 actually removed' }),
      el('div.viz-twin__figs',
        fig(format.number(m.territoriesGone), 'territories left British rule in 1947'),
        fig(format.number(m.territoriesAfter), 'were still British the next year'),
        fig(format.area(m.landGone), 'of ' + format.area(m.landAll) + ' — ' + pct(m.landPct) + ' of the land'),
        fig(format.number(m.popGone), 'of ' + format.number(m.popAll) + ' counted people — ' + pct(m.popPct))),

      /* THE ATLAS AGAINST ITSELF. */
      el('h4.viz-h', { text: 'This atlas disagrees with itself here, and says so' }),
      anchorOk ? warrantLine(data, spec) : null,
      el('p.viz-twin__say', {
        text: 'That sentence is in the record for 15 August 1947 and it says about three quarters. Counting the atlas’s own population '
          + 'figures gives ' + pct(m.popPct) + '. The two do not have to be reconciled by picking one: they differ because '
          + format.number(m.countedAll) + ' of the ' + format.number(m.territoriesBefore) + ' territories Britain held in 1947 carry a counted '
          + 'population figure in this dataset and ' + format.number(m.uncounted) + ' do not, and because the counts were made in different years — '
          + (m.biggest && m.biggest.popYear ? m.biggest.name + '’s is the census of ' + m.biggest.popYear + ', and it is ' + format.number(m.biggest.pop) + ' of the ' + format.number(m.popGone) + ' on its own. ' : '')
          + 'The ' + format.number(m.uncounted) + ' territories with no counted figure hold ' + pct(m.landUncountedPct)
          + ' of the land between them; whether counting their people would move the share up or down, this atlas cannot say, '
          + 'which is why both readings are printed here instead of one. What neither reading changes is the shape: '
          + 'the people go and the map stays.',
      }),

      el('h4.viz-h', { text: 'What was still ahead' }),
      el('p.viz-twin__say', { text: spec.after }),
      el('p.cx-note.viz-method',
        el('span.cx-src__kind', { text: 'How this was measured' }),
        el('span', {
          text: 'Land is the sum of the modern outline of every geographic unit this atlas records as British in ' + YEAR
            + ', with partial coverage counted at half and a unit claimed by two territories counted once — the method in '
            + 'app/js/viz/series.js and tools/audit-timeline.js. "Left in ' + YEAR + '" means held in ' + YEAR + ' and not held in ' + AFTER
            + '. People are the counted figures the dataset records for each territory, each with its own date and its own note on who '
            + 'counted, with entries nested inside another territory excluded so that nobody is counted twice. There is no empire-wide '
            + 'population series in this atlas and this is not one: it is a comparison of counted people.',
        })));
    /* One route onward, and it is the question this chart raises: if a
       thousand officials could not have run that, who did? */
    const more = el('button.cx-more', {
      type: 'button', text: 'Who was actually running it',
      onclick: () => bus.emit('viz:open', { id: 'ratio:ics' }),
    });
    if (!onPath) reveal.append(el('div.viz-ratio__more', more));
  }

  return {
    node: root,
    measure: m,
    focus() { try { bars[0].handle.focus(); } catch (_) { /* not yet in the DOM */ } },
    isRevealed: () => committed,
    reveal: () => doCommit(),
  };
}
