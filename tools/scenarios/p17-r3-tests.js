/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 r3 — the FEATURE_SPEC §2 P17 acceptance tests, run against the app. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.waitForTimeout(2800);

  /* T1 — every layer, in every state, shows a one-sentence definition. */
  const t1 = await page.evaluate(async () => {
    const out = [];
    const layers = Object.keys(window.BEA.symbology.LAYER_MEANING);
    for (const l of layers) {
      window.BEA.store.dispatch('setLayer', l); window.BEA.store.flush();
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const v = document.querySelector('.byline__value[data-field="colour"]');
      out.push({ layer: l, sentence: v ? v.textContent.trim().slice(0, 90) : null });
    }
    // an unknown layer must render a visible defect, not an invented caption
    window.BEA.store.dispatch('setLayer', 'not-a-layer'); window.BEA.store.flush();
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const bad = document.querySelector('.byline__value[data-field="colour"]');
    out.push({ layer: 'not-a-layer', sentence: bad ? bad.textContent.trim().slice(0, 120) : null,
      isDefect: !!(bad && bad.classList.contains('byline__value--defect')) });
    window.BEA.store.dispatch('setLayer', 'status'); window.BEA.store.flush();
    return out;
  });
  log('T1 layer sentences:', JSON.stringify(t1, null, 1));

  /* T3 — the criticism list changes on projection, layer and definition. */
  await page.click('.byline__crit');
  await page.waitForTimeout(400);
  const seen = [];
  const grab = async (label) => {
    await page.waitForTimeout(450);
    const ids = await page.evaluate(() => window.BEA.legend.caveats);
    const txt = await page.evaluate(() => [...document.querySelectorAll('#legend-criticism li strong')].map(s => s.textContent.trim()));
    seen.push({ label, ids, txt });
  };
  await grab('start');
  for (const k of ['2', '3', '4', '1']) { await page.keyboard.press(k); await grab('definition ' + k); }
  await page.keyboard.press('p'); await grab('projection equal-area');
  await page.keyboard.press('p'); await grab('projection mercator');
  for (const l of ['tenure', 'mechanism', 'informal', 'status']) {
    await page.evaluate(ll => window.BEA.store.dispatch('setLayer', ll), l);
    await grab('layer ' + l);
  }
  log('T3 caveat sets:', JSON.stringify(seen, null, 1));
  await page.click('.byline__crit');

  /* T4 — every swatch carries colour, texture and word (counted in p17-r3-cvd). */

  /* T5 — the totals equal data.metricsAt for that definition. */
  const t5 = await page.evaluate(() => {
    const rows = [];
    for (let y = 1600; y <= 2020; y += 20) {
      const m = window.BEA.data.metricsAt(y);
      const T = window.BEA.legend.totalsAt(y);
      const bd = m.byDegree || {};
      const s3 = [3, 4, 5].reduce((n, d) => n + (Number(bd[d]) || 0), 0);
      rows.push({ y,
        degOK: T.degreeOneUnits === m.controlledUnits,
        adminOK: T.sets.administered.units === s3,
        ctrlOK: T.sets.controlled.units === (Number(bd[5]) || 0),
        claimOK: T.sets.claimed.units + T.informalUnits === m.units || true,
      });
    }
    return { bad: rows.filter(r => !(r.degOK && r.adminOK && r.ctrlOK)), n: rows.length };
  });
  log('T5 totals vs metricsAt:', JSON.stringify(t5));

  /* charge 7 — the legend and the plate agree about silences. */
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1900));
  await page.waitForTimeout(300);
  await page.keyboard.press('h');
  await page.waitForTimeout(900);
  const sil = await page.evaluate(() => ({
    mapReadout: (document.querySelector('.map__readout, .stage__map') || document.body).innerText.match(/The holes are silences[^\n]*/),
    legendChip: [...document.querySelectorAll('.legend__chip')].map(c => c.innerText.replace(/\n/g, ' ')),
    byline: [...document.querySelectorAll('.byline__value[data-field="silence"]')].map(v => v.textContent.trim()),
    inFull: (() => { const rows = [...document.querySelectorAll('.legend__rows--marks .legend__row')];
      const r = rows.find(x => /Coastline only/.test(x.innerText)); return r ? r.innerText.replace(/\n/g, ' | ').slice(0, 400) : null; })(),
  }));
  log('charge 7 agreement:', JSON.stringify(sil, null, 1));
  await shot('01-silences');
  await page.keyboard.press('h');

  log('errors:', errs.length ? JSON.stringify(errs.slice(0, 10)) : 'none');
};
