/**
 * viz/extent.js — HOW BIG, AND WHEN. FEATURE_SPEC P08, "extent over time".
 *
 * Three things this chart has to do that a printed graph cannot.
 *
 * 1. IT IS RECOMPUTED, NOT COPIED. Every point on the line is derived in the
 *    browser from `data.statusAt(year)` and the per-unit land areas — see
 *    series.js. No total in this file is written down anywhere; break the
 *    dataset and the line moves, which is the only kind of chart worth
 *    trusting.
 * 2. IT DRAWS THE DISAGREEMENT. Where the dataset records a contested end date
 *    — Canada ceased to be British in 1867, or 1931, or 1982, depending on the
 *    historian — the chart draws a BAND between the two readings and says in
 *    words what the band is made of. A single line there would be a decision
 *    disguised as a measurement.
 * 3. IT ASKS FIRST. DIDACTIC_SPEC §8 at 00:23:30 and M5/LO7: the student
 *    commits to what happened after 1783 before the line is drawn, and the
 *    peak is then marked to the RIGHT of 1914 (T14). The counter-intuitive
 *    placement is the hook, and it only works if a guess is already on record.
 *
 * AND IT REFUSES TO DRAW A POPULATION LINE. The dataset holds two hundred-odd
 * counted population figures and no annual series. They are peaks at different
 * years, and they nest — Bengal Presidency's 1941 census is inside British
 * India's — so a line through them would count the same people twice and put a
 * number under every year in between that nobody ever counted. So the chart
 * draws the counted points, dated, and prints the absence as a sentence.
 */

import { el, fill } from '../core/util.js';
import { buildSeries, censusPoints, WORLD_LAND_KM2, WORLD_LAND_NOTE } from './series.js';

const VB_W = 1000, VB_H = 300;

export function buildExtent(ctx, opts = {}) {
  const { data, bus, format } = ctx;
  const series = buildSeries(data);
  const root = el('div.viz.viz-extent', { dataset: { state: 'asking' } });

  const x = (year) => ((year - series.from) / Math.max(1, series.to - series.from)) * VB_W;
  const y = (v) => VB_H - (v / Math.max(1, series.maxExtent)) * VB_H;

  /* ============================================== the prediction ======== */
  const predict = el('div.cx-ask.viz-predict',
    el('span.cx-ask__eyebrow', { text: 'Commit a guess' }),
    el('p.cx-ask__q', { text: 'Britain lost thirteen American colonies in 1783 — its largest settler population. Over the fifty years that followed, did the land it held get bigger, smaller, or stay about the same?' }));
  const choices = el('div.cx-ask__choices');
  const OPTIONS = [
    { id: 'bigger', label: 'Bigger' },
    { id: 'smaller', label: 'Smaller' },
    { id: 'same', label: 'About the same' },
  ];
  for (const o of OPTIONS) {
    choices.append(el('button.viz-choice', { type: 'button', text: o.label, dataset: { choice: o.id }, onclick: () => answer(o) }));
  }
  predict.append(choices);
  const verdict = el('p.viz-predict__v', { hidden: true });
  predict.append(verdict);

  /* ============================================== the chart ============= */
  const chart = el('div.viz-chart', { hidden: true });
  const svg = svgEl('svg', { viewBox: '0 0 ' + VB_W + ' ' + VB_H, preserveAspectRatio: 'none', 'aria-hidden': 'true', class: 'viz-chart__svg' });
  const band = svgEl('path', { class: 'viz-chart__band' });
  const lineExtent = svgEl('path', { class: 'viz-chart__line viz-chart__line--extent' });
  const lineRuled = svgEl('path', { class: 'viz-chart__line viz-chart__line--ruled' });
  const rulePeak = svgEl('line', { class: 'viz-chart__rule viz-chart__rule--peak' });
  const rule1914 = svgEl('line', { class: 'viz-chart__rule' });
  const rule1783 = svgEl('line', { class: 'viz-chart__rule' });
  const now = svgEl('line', { class: 'viz-chart__now' });
  svg.append(band, lineRuled, lineExtent, rule1783, rule1914, rulePeak, now);
  const marks = el('div.viz-chart__marks');
  const yTop = el('span.viz-chart__y.viz-chart__y--top');
  const yBot = el('span.viz-chart__y.viz-chart__y--bot', { text: '0' });
  chart.append(el('div.viz-chart__plot', svg, yTop, yBot), marks);

  const readout = el('p.viz-chart__readout', { hidden: true });
  const legend = el('ul.viz-chart__key', { hidden: true },
    el('li', el('i.viz-swatch.viz-swatch--extent'), 'what this atlas draws as British'),
    el('li', el('i.viz-swatch.viz-swatch--ruled'), 'where Britain gave the orders (control degree 4–5)'),
    el('li', el('i.viz-swatch.viz-swatch--band'), 'the dominions, if you date their departure late'));
  const peakNote = el('p.cx-note.viz-peak', { hidden: true });

  /* ============================================== territories =========== */
  const terr = el('div.viz-terr', { hidden: true });
  const terrSvg = svgEl('svg', { viewBox: '0 0 ' + VB_W + ' 120', preserveAspectRatio: 'none', 'aria-hidden': 'true', class: 'viz-terr__svg' });
  const terrLine = svgEl('path', { class: 'viz-chart__line viz-chart__line--terr' });
  terrSvg.append(terrLine);
  terr.append(el('h4.viz-h', { text: 'Separate territories held, by year' }), terrSvg, el('p.viz-terr__foot'));

  /* ============================================== population ============ */
  const pop = el('div.viz-pop', { hidden: true });

  /* ============================================== sources =============== */
  const method = el('p.cx-note.viz-method');

  root.append(predict, chart, readout, peakNote, legend, terr, pop, method);

  /* ------------------------------------------------------- drawing ----- */
  function draw() {
    const rows = series.rows;
    const up = [], lo = [];
    for (const r of rows) { up.push([x(r.year), y(r.extentLate)]); lo.push([x(r.year), y(r.extent)]); }
    band.setAttribute('d', path(up) + ' ' + lo.slice().reverse().map((p) => 'L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + ' Z');
    lineExtent.setAttribute('d', path(lo));
    lineRuled.setAttribute('d', path(rows.map((r) => [x(r.year), y(r.ruled)])));

    const maxT = rows.reduce((m, r) => Math.max(m, r.territories), 1);
    terrLine.setAttribute('d', path(rows.map((r) => [x(r.year), 120 - (r.territories / maxT) * 120])));
    fill(terr.querySelector('.viz-terr__foot'),
      el('span.cx-note', { text: 'Peak: ' }),
      el('span.num', { text: String(series.peakTerr.territories) }),
      el('span.cx-note', { text: ' separate territories in ' }),
      el('span.num', { text: String(series.peakTerr.year) }),
      el('span.cx-note', { text: '. One territory is one historical entity in this atlas, not one modern country.' }));

    yTop.textContent = format.area(series.maxExtent);
    vline(rulePeak, series.peak.year);
    vline(rule1914, 1914);
    vline(rule1783, 1783);

    /* Two marks four years apart on a four-century axis print on top of each
       other. Anything closer than a label's width drops to a second row rather
       than overprinting: an unreadable annotation is a wrong annotation. */
    const wanted = [
      { year: 1783, big: '1783', small: 'America lost' },
      { year: 1914, big: '1914', small: 'the war begins' },
      { year: series.peak.year, big: String(series.peak.year), small: 'the largest this atlas draws' },
    ].sort((a, b) => a.year - b.year);
    const nodes = [];
    let lastPos = -1, row = 0;
    for (const w of wanted) {
      const pos = (w.year - series.from) / (series.to - series.from);
      row = (lastPos >= 0 && pos - lastPos < 0.085) ? (row + 1) % 2 : 0;
      lastPos = pos;
      nodes.push(markAt(w.year, w.big, w.small, row));
    }
    fill(marks, ...nodes);
  }

  function vline(node, year) {
    const px = x(year);
    node.setAttribute('x1', px); node.setAttribute('x2', px);
    node.setAttribute('y1', 0); node.setAttribute('y2', VB_H);
  }

  function markAt(year, big, small, row) {
    const m = el('span.viz-mk', { dataset: { year: String(year), row: String(row || 0) } });
    m.style.insetInlineStart = ((year - series.from) / (series.to - series.from) * 100).toFixed(2) + '%';
    m.append(el('span.viz-mk__y.num', { text: big }), el('span.viz-mk__l', { text: small }));
    return m;
  }

  const path = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

  /* ------------------------------------------------------- the answer -- */
  let answered = false;
  function answer(o) {
    if (answered) return;
    answered = true;
    root.dataset.state = 'revealed';
    for (const b of choices.querySelectorAll('.viz-choice')) {
      b.disabled = true;
      if (b.dataset.choice === o.id) b.dataset.picked = 'yes';
    }
    const a = series.at(1783), b = series.at(1833);
    const grew = b.extent > a.extent * 1.05;
    verdict.hidden = false;
    fill(verdict,
      el('span', { text: 'You said ' }), el('b', { text: o.label.toLowerCase() }), el('span', { text: '. ' }),
      el('span', {
        text: grew
          ? 'It grew. In 1783 this atlas counts ' + format.area(a.extent) + '; by 1833, ' + format.area(b.extent)
            + '. The decades that lost America won Bengal, the Cape, Ceylon and New South Wales.'
          : 'In 1783 this atlas counts ' + format.area(a.extent) + '; by 1833, ' + format.area(b.extent) + '.',
      }));

    fill(peakNote,
      el('span', {
        text: 'The peak year is not something this atlas can settle. Reading the disputed dominion departures early — which is what the map does — the largest total drawn is '
          + series.peak.year + ', at ' + format.area(series.peak.extent) + '. Reading them late, it is ' + series.peakLate.year
          + '. The dataset\u2019s own audit tool, sampling only the canonical years, reports 1922. '
          + 'What none of the three readings does is put the peak before 1914.',
      }));
    chart.hidden = false;
    readout.hidden = false;
    legend.hidden = false;
    peakNote.hidden = false;
    terr.hidden = false;
    pop.hidden = false;
    draw();
    drawPopulation();
    setYearMark(ctx.store.getState().year);
    writeReadout(ctx.store.getState().year);

    bus.emit('ledger:append', {
      kind: 'predicted',
      claimId: 'p08:extent:after-1783',
      t: 'T14',
      prompt: 'After 1783, did the empire get bigger, smaller or stay the same?',
      youSaid: o.label,
      answer: format.area(a.extent) + ' in 1783 → ' + format.area(b.extent) + ' in 1833',
      year: 1833,
    });
    bus.emit('viz:extentRevealed', { peak: series.peak.year, km2: series.peak.extent });
  }

  /* ------------------------------------------------------- readout ----- */
  function writeReadout(year) {
    const r = series.at(year);
    if (!r) return;
    const pc = (v) => { const p = (v / WORLD_LAND_KM2) * 100; return (p >= 10 ? p.toFixed(0) : p.toFixed(1)) + '%'; };
    fill(readout,
      el('span.viz-ro__y.num', { text: String(year) }),
      el('span.viz-ro__sep', { text: ' · ' }),
      el('span.num', { text: format.area(r.extent) }),
      el('span.viz-ro__l', { text: ' drawn British' }),
      el('span.viz-ro__sep', { text: ' · ' }),
      el('span.num', { text: pc(r.extent) }),
      el('span.viz-ro__l', { text: ' of the world’s land' }),
      r.contested > 0
        ? el('span.viz-ro__band', {
          text: 'Up to ' + format.area(r.extentLate) + ' (' + pc(r.extentLate) + ') on the other reading, which keeps '
            + r.contestedTerritories + ' dominion' + (r.contestedTerritories === 1 ? '' : 's')
            + ' British until their constitutions came home.',
        })
        : null);
  }

  function setYearMark(year) {
    const px = x(Math.max(series.from, Math.min(series.to, year)));
    now.setAttribute('x1', px); now.setAttribute('x2', px);
    now.setAttribute('y1', 0); now.setAttribute('y2', VB_H);
  }

  /* ------------------------------------------------------- population -- */
  function drawPopulation() {
    const pts = censusPoints(data);
    const nested = pts.filter((p) => p.nestedWithin).length;
    const biggest = pts.slice().sort((a, b) => b.value - a.value)[0];

    /* The dots are HTML, not SVG. The charts above stretch a viewBox to the
       rail's width, which turns a circle into an oval; a scatter has to be
       round or the eye reads size where there is none. */
    const plot = el('div.viz-pop__plot');
    const maxL = Math.log10(Math.max(2, biggest ? biggest.value : 2));
    const minL = 2;                                   // 100 people
    for (const p of pts) {
      const px = (Math.max(series.from, Math.min(series.to, p.year)) - series.from) / (series.to - series.from);
      const py = (Math.log10(Math.max(100, p.value)) - minL) / (maxL - minL);
      const dot = el('span.viz-pop__dot' + (p.nestedWithin ? '.viz-pop__dot--nested' : ''), {
        title: p.name + ' — ' + format.number(p.value) + ' in ' + p.year,
      });
      dot.style.insetInlineStart = (px * 100).toFixed(2) + '%';
      dot.style.insetBlockEnd = (py * 92 + 4).toFixed(2) + '%';
      plot.append(dot);
    }

    fill(pop,
      el('h4.viz-h', { text: 'People: what this atlas can and cannot draw' }),
      el('p.viz-pop__say', {
        text: 'There is no year-by-year population line here, because there is no year-by-year population count. '
          + 'What the dataset holds is ' + format.number(pts.length) + ' counted figures — a census, a colonial estimate, a modern reconstruction — '
          + 'each dated, each with a note on who counted. They are peaks in different years, and '
          + format.number(nested) + ' of them sit inside another entry on this chart, so adding them into a line '
          + 'would count the same people twice. Every dot below is a count someone actually made.',
      }),
      plot,
      el('p.cx-note.viz-pop__scale', { text: 'Left to right is the year the count was made; up the page is how many people, on a logarithmic scale — each step is ten times the last, because the largest count is more than a million times the smallest. Hollow dots are territories nested inside another.' }),
      biggest ? el('p.viz-pop__big',
        el('span.num', { text: format.number(biggest.value) }),
        el('span', { text: ' — ' + biggest.name + ', ' }),
        el('span.num', { text: String(biggest.year) }),
        el('span.viz-pop__note', { text: '. ' + (biggest.note || '') })) : null);
  }

  /* ------------------------------------------------------- method ------ */
  fill(method,
    el('span.cx-src__kind', { text: 'How this was measured' }),
    el('span', {
      text: 'Land is the sum of the modern outline of every geographic unit this atlas records as British in that year, '
        + 'from app/data/geo/units.index.json, with coverage marked partial counted at half and a unit claimed by two '
        + 'territories counted once. It is a reconstruction from the atlas\'s own records, not a contemporary survey. ',
    }),
    el('span', { text: WORLD_LAND_NOTE }));

  return {
    node: root,
    series,
    onYear(year) { if (answered) { setYearMark(year); writeReadout(year); } },
    reveal: () => answer({ id: 'skip', label: 'skipped' }),
    isRevealed: () => answered,
  };
}

function svgEl(name, attrs) {
  const n = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
  return n;
}
