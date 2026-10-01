/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 — colour-vision proof for the legend.
   Photographs the whole key unclipped (light and dark are separate runs), shoots
   it again through the Machado (2009) protan / deutan / tritan matrices, and
   dumps every drawn mark's fill, texture, background image and outline as JSON.

   node tools/inspect.js tools/scenarios/p17-legend-cvd.js --out /tmp/p17-cvd [--dark]

   Then prove it, from the repo root:
     node tools/inspect.js tools/scenarios/p17-legend-cvd.js --out /tmp/p17-cvd \
       | grep MARKS_JSON > /tmp/marks.txt
     node tools/scenarios/p17-legend-cvd.js /tmp/marks.txt
   (add --dark for the lamplit palette)
*/
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForSelector('.legend', { timeout: 15000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(400);

  /* Lift the panel out of its bottom-anchored slot so the whole key can be
     photographed in one frame. Purely a photography rig; nothing else changes. */
  await page.addStyleTag({
    content: `
      .app { height: auto !important; }
      [data-mount="legend"] { position: static !important; max-height: none !important; overflow: visible !important; }
      .legend { max-block-size: none !important; }
      .legend__bodywrap { overflow: visible !important; mask-image: none !important; }
      #legend-byline { display: none !important; }
    `,
  });
  await page.evaluate(() => {
    document.querySelectorAll('.legend details').forEach(d => (d.open = false));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
  await shot('key-full', '.legend');

  await page.evaluate(() => document.querySelectorAll('.legend details').forEach(d => (d.open = true)));
  await page.waitForTimeout(300);
  await shot('key-full-expanded', '.legend');

  const marks = await page.evaluate(() => {
    const out = [];
    for (const s of document.querySelectorAll('.legend .sym')) {
      const cs = getComputedStyle(s);
      const row = s.closest('.legend__row, .legend__ramp-step, .legend__family-head, .legend__absentlist > li');
      const word = row ? (row.innerText || '').split('\n').filter(Boolean)[0] : '';
      out.push({
        kind: s.dataset.kind || 'status',
        tex: s.dataset.tex || 'plain',
        bg: cs.backgroundColor,
        image: cs.backgroundImage === 'none' ? null : cs.backgroundImage.slice(0, 160),
        border: cs.borderTopColor,
        borderW: cs.borderTopWidth,
        word: (word || '').slice(0, 48),
      });
    }
    return out;
  });
  log('MARKS_JSON ' + JSON.stringify(marks));
  log('mark count:', String(marks.length));

  /* Visual proof: the same panel through Machado (2009) dichromat matrices,
     applied in linear RGB the way feColorMatrix does by default. */
  await page.evaluate(() => {
    const M = {
      protan: '0.152286 1.052583 -0.204868 0 0  0.114503 0.786281 0.099216 0 0  -0.003882 -0.048116 1.051998 0 0  0 0 0 1 0',
      deutan: '0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0',
      tritan: '1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 0.147602 0 0  0.004733 0.691367 0.303900 0 0  0 0 0 1 0',
    };
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('style', 'position:absolute;width:0;height:0');
    svg.innerHTML = Object.entries(M).map(([id, v]) =>
      `<filter id="cvd-${id}"><feColorMatrix type="matrix" values="${v}"/></filter>`).join('');
    document.body.appendChild(svg);
  });
  await page.evaluate(() => document.querySelectorAll('.legend details').forEach(d => (d.open = false)));
  for (const v of ['protan', 'deutan', 'tritan']) {
    await page.evaluate((vv) => { document.querySelector('.legend').style.filter = `url(#cvd-${vv})`; }, v);
    await page.waitForTimeout(150);
    await shot('key-' + v, '.legend');
  }
  await page.evaluate(() => { document.querySelector('.legend').style.filter = ''; });
};


/* --------------------------------------------------------------------------
   The proof itself. Run this file directly, with the MARKS_JSON line the
   scenario logged, and it checks the rule P17 is held to:

     two marks that a dichromat cannot separate by COLOUR (worst-case CIEDE2000
     under normal / protan / deutan / tritan below 12) must be separated by a
     different engraved texture, a different background image, or a different
     outline.

   The tenure ramp is excluded from that test and held to its own criterion
   (DESIGN §2.4): strictly monotone in L* under all four models, in whichever
   direction the theme runs.
-------------------------------------------------------------------------- */
if (require.main === module) {
  const fs = require('fs');
  const C = require('../design/colour.js');
  const raw = fs.readFileSync(process.argv[2], 'utf8');
  const marks = JSON.parse(raw.slice(raw.indexOf('[')));
  const hex = (s) => {
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(s || '');
    if (!m) return null;
    if (m[4] !== undefined && Number(m[4]) === 0) return null;
    return '#' + [1, 2, 3].map(i => (+m[i]).toString(16).padStart(2, '0')).join('').toUpperCase();
  };
  const sig = (m) => [m.kind, m.tex, m.bg, m.image, m.border, m.borderW].join('|');
  const seen = new Set(), all = [];
  for (const m of marks) { const k = sig(m); if (seen.has(k)) continue; seen.add(k); all.push({ ...m, hex: hex(m.bg) }); }
  const V = ['normal', 'protan', 'deutan', 'tritan'];
  const cat = all.filter(m => m.kind !== 'tenure' && m.kind !== 'tenure-none');
  const ramp = all.filter(m => m.kind === 'tenure');
  let close = 0, fail = 0;
  for (let i = 0; i < cat.length; i++) for (let j = i + 1; j < cat.length; j++) {
    const a = cat[i], b = cat[j];
    const w = (a.hex && b.hex) ? Math.min(...V.map(v => C.deltaE00(C.simulate(a.hex, v), C.simulate(b.hex, v)))) : 99;
    if (w >= 12) continue;
    close++;
    const differs = a.tex !== b.tex || (a.image || '') !== (b.image || '') || a.border !== b.border || a.borderW !== b.borderW;
    if (!differs) { fail++; console.log('  FAIL dE' + w.toFixed(1) + '  ' + a.word + '  vs  ' + b.word); }
  }
  console.log('distinct marks drawn: ' + all.length + '  categorical: ' + cat.length + '  ramp steps: ' + ramp.length);
  console.log('categorical pairs within 12 dE00 under some vision model: ' + close);
  console.log(fail ? 'FAIL ' + fail : 'PASS — every close categorical pair carries a different mark');
  let mono = true, minStep = 99;
  for (const v of V) {
    const Ls = ramp.map(o => C.lab(C.simulate(o.hex, v))[0]);
    const dir = Math.sign(Ls[Ls.length - 1] - Ls[0]);
    for (let i = 1; i < Ls.length; i++) { const d = (Ls[i] - Ls[i - 1]) * dir; if (d <= 0) mono = false; minStep = Math.min(minStep, Math.abs(d)); }
  }
  console.log('tenure ramp monotone in L* under all four models: ' + mono + '   min step L*: ' + minStep.toFixed(1));
  process.exit(fail || !mono ? 1 : 0);
}
