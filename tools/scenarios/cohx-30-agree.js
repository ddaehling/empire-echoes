/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* STATE COHERENCE PROOF.
   At every step, read the year / selection / definition-in-force out of all four
   pieces INDEPENDENTLY — from the map's own DOM, the timeline's own readout, the
   legend's own rule line and the dossier's own header — and compare. */
const READ = (page) => page.evaluate(() => {
  const txt = s => { const e = document.querySelector(s); return e ? (e.innerText||'').replace(/\s+/g,' ').trim() : null; };
  const st = window.BEA.store.getState();
  const plate = document.querySelector('canvas.map__plate') || document.querySelector('.map__plate');
  const mapYear = txt('.map__switchyear');
  const mapDef = (() => { const b = document.querySelector('.map__def.is-on .map__defword'); return b ? b.textContent.trim() : null; })();
  const legend = txt('.legend__rule, .legend__titlerow') || txt('.legend__head');
  const legDef = (() => { const m = (legend||'').match(/(claimed|administered|controlled|influenced)/); return m && m[1]; })();
  const legYear = (() => { const b = document.querySelector('#legend-byline [data-field=year]'); return b ? b.textContent.replace(/[^\d]/g,'') : null; })();
  const bylDef = (() => { const b = document.querySelector('#legend-byline [data-field=definition]'); return b ? b.textContent.trim().split(' —')[0] : null; })();
  const tlYear = txt('.tl__year');
  const tlCount = txt('.tl__count');
  const dossHead = txt('.dossier__year, .dsr__year') || (txt('[data-mount=dossier]')||'').slice(0,60);
  const dossYear = (() => { const m = ((txt('[data-mount=dossier]')||'').match(/\b(1[2-9]\d\d|20\d\d)\b/)); return m && m[1]; })();
  return {
    store: { year: st.year, sel: st.selectedTerritoryId, def: st.filters.def || 'claimed', layer: st.activeLayer },
    hash: location.hash,
    map: { year: mapYear, def: mapDef, projection: plate && plate.parentElement && plate.parentElement.dataset ? plate.parentElement.dataset.projection : null, definition: document.querySelector('[data-definition]') ? document.querySelector('[data-definition]').dataset.definition : null },
    legend: { year: legYear, def: bylDef, rule: (legend||'').slice(0,70) },
    timeline: { year: tlYear, count: tlCount },
    dossier: { year: dossYear, head: dossHead.slice(0,50) },
    shellDataset: { ...document.getElementById('app').dataset },
  };
});
const check = (log, label, s) => {
  const yrs = new Set([String(s.store.year), s.map.year && s.map.year.replace(/\D/g,''), s.legend.year, s.timeline.year && s.timeline.year.replace(/\D/g,''), s.shellDataset.year].filter(Boolean));
  const defs = new Set([s.store.def, s.map.def, s.legend.def, s.map.definition].filter(Boolean));
  log(`--- ${label}`);
  log('   ' + JSON.stringify(s));
  log('   YEARS AGREE: ' + (yrs.size === 1 ? 'YES ' + [...yrs][0] : 'NO ' + [...yrs].join(' / ')));
  log('   DEFS AGREE:  ' + (defs.size === 1 ? 'YES ' + [...defs][0] : 'NO ' + [...defs].join(' / ')));
};
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1600);
  check(log, 'boot', await READ(page));

  await page.keyboard.press('Home'); await page.waitForTimeout(700);
  await page.evaluate(()=>window.BEA.store.act.setYear(1858)); await page.waitForTimeout(900);
  check(log, 'scrubbed to 1858', await READ(page));

  await page.evaluate(()=>window.BEA.store.act.select('bengal-presidency')); await page.waitForTimeout(1100);
  check(log, 'selected bengal-presidency', await READ(page));

  await page.keyboard.press('3'); await page.waitForTimeout(1000);
  check(log, 'definition -> controlled (key 3)', await READ(page));

  const href = page.url();
  log('   URL now: ' + href);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1800);
  check(log, 'RELOADED from that URL', await READ(page));

  await page.evaluate(()=>history.back()); await page.waitForTimeout(1500);
  check(log, 'BACK', await READ(page));

  // a year where nothing is British
  await page.evaluate(()=>window.BEA.store.act.setYear(1200)); await page.waitForTimeout(1100);
  check(log, 'year 1200 (nothing British)', await READ(page));

  // selection outlives the year that killed it
  await page.evaluate(()=>{window.BEA.store.act.setYear(1900); window.BEA.store.act.select('bengal-presidency');}); await page.waitForTimeout(900);
  await page.evaluate(()=>window.BEA.store.act.setYear(1990)); await page.waitForTimeout(1100);
  check(log, 'year moved past independence with selection held', await READ(page));
};
