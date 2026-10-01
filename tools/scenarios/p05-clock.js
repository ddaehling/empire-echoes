/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p05-clock.js — how long the path actually takes.
 *
 * FEATURE_SPEC P05 acceptance 1 and DIDACTIC_SPEC §6's disqualifier: "a claimed
 * 30-minute experience that cannot be completed in 45" caps the whole artefact.
 * So this walks every beat, counts the words a student is actually shown, and
 * reports three numbers, none of which is a guess dressed as a measurement:
 *
 *   · the SCRIPTED FLOOR — a machine pressing Next as fast as the app allows;
 *   · the AUTHORED BUDGET — the sum of every beat's own `cost_s` plus the gates;
 *   · the READING MODEL — the rendered word count of the lede sentence and the
 *     rail panel at each beat, at 200 words per minute (a school reading rate),
 *     plus a flat 12 seconds per beat for looking at the map and 45 seconds for
 *     each commitment, which are the two things reading rate does not cover.
 *
 *   node tools/inspect.js tools/scenarios/p05-clock.js --out /tmp/p05c
 */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.removeItem('bea.ledger.v1'); } catch (_) {} });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);

  const doc = await page.evaluate(async () => ({
    j: await (await fetch('js/tours/tours.json')).json(),
    g: await (await fetch('js/tours/gates.json')).json(),
  }));
  const authored = doc.j.beats.reduce((a, b) => a + (b.cost_s || 0), 0) + doc.g.gates.length * 90;

  const t0 = Date.now();
  await page.evaluate(() => window.BEA.bus.emit('tours:start', {}));
  await page.waitForTimeout(600);

  /* The app's own figure is on the route card, which lives on beat 1 — read it
     before the walk moves off it. */
  const app = await page.evaluate(async () => {
    const open = document.querySelector('.tr-routes__open');
    if (open) open.click();
    await new Promise((r) => setTimeout(r, 200));
    const line = document.querySelector('.tr-routes__line')?.textContent || '';
    const how = document.querySelector('.tr-routes__how')?.textContent || '';
    if (open) open.click();
    const m = line.match(/(\d+)\s*minutes/);
    return { say: line.trim(), how: how.trim(), min: m ? +m[1] : NaN };
  });

  const rows = [];
  for (let i = 0; i < 26; i++) {
    const m = await page.evaluate(() => {
      const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
      /* Only what THIS piece put on screen: the one sentence in the band and
         the beat's own panel. The ribbon, the dossier and the Close are other
         pieces' words and are not this path's clock. */
      const lede = document.querySelector('.cx-lede__say')?.innerText || '';
      const panel = document.querySelector('.tr-panel, .tr-gate')?.innerText || '';
      return {
        count: document.querySelector('.tr-bar__count')?.textContent || '',
        gate: !!document.querySelector('.tr-field'),
        asks: !!document.querySelector('.cx-ask, .tr-loop, .tr-defrun'),
        closed: !!document.querySelector('.cl-close'),
        w: words(lede) + words(panel),
      };
    });
    if (m.closed) break;
    rows.push(m);
    if (m.gate) { await page.evaluate(() => document.querySelector('.tr-field__cell')?.click()); await page.waitForTimeout(200); }
    if (await page.evaluate(() => !!document.querySelector('.tr-num'))) {
      await page.evaluate(() => { const i = document.querySelector('.tr-num'); i.value = '3'; });
      await page.evaluate(() => document.querySelector('.tr-go')?.click());
      await page.waitForTimeout(250);
    }
    const moved = await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (!n || n.disabled || n.hidden) return false; n.click(); return true; });
    if (!moved) break;
    await page.waitForTimeout(350);
  }
  const scripted = Math.round((Date.now() - t0) / 1000);

  let read = 0, look = 0, commit = 0;
  for (const r of rows) { read += r.w / 200 * 60; look += 12; if (r.asks || r.gate) commit += 45; }
  const model = Math.round(read + look + commit);
  const words = rows.reduce((a, r) => a + r.w, 0);

  log('steps walked: ' + rows.length);
  log('words rendered across the whole path (lede + rail, not counting the optional essays): ' + words);
  log('SCRIPTED FLOOR   ' + scripted + ' s  (' + (scripted / 60).toFixed(1) + ' min) — a machine, not a student');
  log('AUTHORED BUDGET  ' + authored + ' s  (' + (authored / 60).toFixed(1) + ' min) — the sum of every beat\'s own cost_s plus 90s a gate');
  log('READING MODEL    ' + model + ' s  (' + (model / 60).toFixed(1) + ' min) — ' + Math.round(read) + 's reading at 200 wpm + ' + look + 's looking + ' + commit + 's committing');
  /* ROUND 7. THE THREE MODELS ABOVE ALL COUNT THE AUTHORED PROSE AND NOTHING
     ELSE, WHICH IS WHY THEY ALL CLEARED A CEILING THE APP DOES NOT CLEAR.
     `_budgetMinutes` now also costs the counted figures the viz module mounts
     inside beats (measured: 1,505 words across three of them on the default
     route) and the retrieval moments the quiz drops into them. The app's own
     published figure is therefore the fourth model and the only one that
     counts what is actually on screen, so it is printed here beside them and
     it is the one the disqualifier is read against. */
  log('THE APP\u2019S OWN     ' + (Number.isFinite(app.min) ? app.min + ' min' : '(card not open)')
    + ' — `_budgetMinutes`, which also counts the counted figures inside beats and the retrieval moments · "' + app.say + '"');
  log('the 45-minute disqualifier: ' + (Number.isFinite(app.min) && app.min >= 45
    ? 'NOT CLEARED on the app\u2019s own arithmetic — ' + app.min + ' min against FEATURE_SPEC P05.1\u2019s 45. '
      + 'It was not cleared before this round either; the models above could not see the two surfaces that '
      + 'carry the difference. Reported for the spec owner: either the ceiling moves or the default route '
      + 'loses a beat. See tools/scenarios/p05-accept.js, "P05.1\u2019s CEILING, AMENDED IN WRITING".'
    : 'CLEARED — worst of the models is ' + (Math.max(authored, model) / 60).toFixed(1) + ' min'));
  log('note: the six chapter essays add about 2,257 words (roughly 11 minutes at the same rate) and are optional at every beat, which is why they are not in the totals above.');
};
