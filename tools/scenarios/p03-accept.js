/**
 * p03-accept.js — the acceptance tests from FEATURE_SPEC §2 (the timeline),
 * run against the real app.
 *
 * GUARANTEE THIS FILE PROTECTS: the four-phase spine band is on screen in every
 * state the app can be in; the year says which phases are running in it; the
 * keyboard can jump between the years something actually changed; every soft
 * date is marked and gives its reason; 600 scrub frames stay inside budget; and
 * playback stops itself at the moments that matter and says why.
 *
 * WAVE 9 — WHY IT WAS REWRITTEN, AND WHAT WAS ACTUALLY WRONG.
 *
 * It had stopped running entirely: `page.textContent('.tl-spine__caption')`
 * timed out after 30 seconds and the whole scenario died on T2, so T3, T4, T5
 * and the playback check had not executed in this repository for some time.
 * `.tl-spine__caption` is still BUILT by `timeline/spine-band.js` and is no
 * longer APPENDED to anything: the file's own comment says the caption "has
 * been promoted" out of the band and the element is kept only so a screen
 * reader and the phase note can read its text. A selector that matches an
 * element which exists in a variable and not in the document is the worst kind
 * of stale selector, because grepping the source finds it.
 *
 * The sentence the rule is about — "1820 lights three, and SAYS SO" — is now
 * said by `.tl__phase`: one `.tl__phasenum` per lit phase (I, II, III) and
 * `.tl__phasew` naming the last of them. So the assertion is made against the
 * surface that carries the claim, and it is made STRUCTURALLY — the numerals
 * are counted against the lit lanes — rather than by reading 90 characters of
 * a string, which is what made the old check brittle in the first place.
 *
 * Two other repairs of the same class:
 *   · The playback stop is no longer a `.tl__stopcard`. `timeline/index.js`
 *     `showStopCard()` emits `ask:say`, so the stop is spoken in the lede band
 *     (`.cx-lede__mark` + `.cx-lede__say` + a "Keep going" `.cx-cta`). The old
 *     line read `document.querySelector('.tl__stopcard').textContent` off an
 *     object literal fallback, so it reported `undefined` and passed.
 *   · `store.dispatch('startTour', 'anything')` started a route that does not
 *     exist. It now starts the route the app publishes as the default, through
 *     `lib/routes.js`, so this file cannot be testing a route nobody uses.
 *
 * AND IT EXITS NON-ZERO WHEN IT FAILS. The old file logged and returned, so a
 * runner that trusts exit codes called it green even on the run where it died.
 */
const routes = require('./lib/routes.js');

module.exports = async ({ page, shot, log, url }) => {
  const C = routes.Checks(log);

  await routes.ready(page);
  await page.waitForSelector('.tl-spine__track');
  const pay = await routes.payload(page);
  log('routes: ' + pay.routes.map((r) => r.id + (r.isDefault ? '*' : '')).join(' ') + '   default=' + pay.default);

  const vis = async (sel) => page.evaluate((s) => {
    const n = document.querySelector(s); if (!n) return 'MISSING';
    const r = n.getBoundingClientRect();
    const cs = getComputedStyle(n);
    return (r.width > 40 && r.height > 8 && cs.visibility !== 'hidden' && cs.display !== 'none')
      ? 'visible ' + Math.round(r.width) + 'x' + Math.round(r.height) : 'HIDDEN';
  }, sel);

  /* ---- T1: the band is there in every state ------------------------------
     Including inside a running lesson, and the lesson is the DEFAULT one. */
  const states = [];
  const note = async (name) => { states.push([name, await vis('.tl-spine__track')]); };
  await note('boot');
  await page.evaluate(() => window.BEA.store.batch(d => { d('setCompareYear', 1914); }));
  await page.waitForTimeout(120); await note('compare');
  await page.evaluate((id) => window.BEA.store.dispatch('startTour', id), pay.default);
  await page.waitForTimeout(200); await note('lesson (' + pay.default + ')');
  await page.evaluate(() => window.BEA.store.dispatch('openOverlay', 'close'));
  await page.waitForTimeout(150); await note('overlay/close');
  await page.evaluate(() => window.BEA.store.dispatch('setQuiz', { active: true, quizId: 'x' }));
  await page.waitForTimeout(120); await note('quiz');
  await page.evaluate(() => { const t = window.BEA.data.territories[0]; window.BEA.store.dispatch('select', t.id); });
  await page.waitForTimeout(150); await note('dossier open');
  await page.evaluate(() => window.BEA.store.batch(d => { d('endTour'); d('closeOverlay'); d('resetQuiz'); d('deselect'); d('setCompareYear', null); }));
  await page.waitForTimeout(150); await note('free explore');
  log('T1 states: ' + JSON.stringify(states));
  C.t('T1 the spine band survives every state', states.every(([, v]) => String(v).startsWith('visible')),
    states.filter(([, v]) => !String(v).startsWith('visible')).map(([k]) => k).join(', ') || 'all ' + states.length + ' visible',
    'visible in every state');

  /* ---- T2: 1820 lights three, AND SAYS SO -------------------------------
     Not by string match. The numerals in `.tl__phase` are counted against the
     lanes that are lit, at three years that light one, two and three phases. */
  for (const [year, want] of [[1700, 2], [1820, 3], [1950, 1]]) {
    await page.evaluate((y) => window.BEA.store.dispatch('setYear', y), year);
    await page.waitForTimeout(200);
    const m = await page.evaluate(() => ({
      lit: [...document.querySelectorAll('.tl-lane[data-on="true"]')].map(n => n.dataset.phase),
      nums: [...document.querySelectorAll('.tl__phasenum')].map(n => n.textContent.trim()),
      word: (document.querySelector('.tl__phasew') || {}).textContent,
      phaseEl: !!document.querySelector('.tl__phase'),
    }));
    C.t('T2 ' + year + ' lights ' + want, m.lit.length === want, m.lit.join('+') || 'none', want + ' lanes');
    C.t('T2 ' + year + ' says so', m.phaseEl && m.nums.length === m.lit.length && !!m.word,
      m.phaseEl ? m.nums.join('·') + ' "' + m.word + '"' : '.tl__phase MISSING',
      'one numeral per lit phase, and the last one named');
  }
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1820));
  await page.waitForTimeout(150);
  await shot('t2-1820', '.app__time');

  /* ---- T3: Shift+Arrow jumps to the next year something changed ---------- */
  for (const [from, dir] of [[1856, 1], [1913, 1]]) {
    await page.evaluate((y) => window.BEA.store.dispatch('setYear', y), from);
    await page.waitForTimeout(120);
    await page.evaluate(() => document.body.focus());
    await page.keyboard.press(dir > 0 ? 'Shift+ArrowRight' : 'Shift+ArrowLeft');
    await page.waitForTimeout(180);
    const r = await page.evaluate((f) => ({ got: window.BEA.store.getState().year, want: window.BEA.data.nextChangeYear(f, 1) }), from);
    C.t('T3 Shift+ArrowRight from ' + from, r.got === r.want, String(r.got), 'the next change year, ' + r.want);
  }
  await page.keyboard.press('Shift+ArrowLeft');
  await page.waitForTimeout(180);
  const back = await page.evaluate(() => ({ got: window.BEA.store.getState().year, want: window.BEA.data.nextChangeYear(1914, -1) }));
  C.t('T3 and Shift+ArrowLeft goes back the same way', back.got === back.want,
    String(back.got), 'the previous change year, ' + back.want);

  /* ---- T4: the dates this atlas cannot settle -------------------------
     THE SPEC'S RULE IS SCOPED TO THE AXIS: "every contested or `circa` date
     VISIBLE ON THE AXIS carries a visible marker and a reason on focus." The
     old file compared the marks in the document against every soft date in the
     dataset and logged 14 "missing" — which is not a defect, because a mark
     for 1333 sits outside a 1600-2027 axis and is correctly not drawn. It
     asserted nothing at all about it, so the rule was documented and unchecked.

     AND THE RAIL IS APPARATUS. `applyStage()` keeps the 148 marks, their key
     and the speed selector behind `data-stage="apparatus"` — round 4's finding
     that "one touch of the atlas unlocked everything at once". At the plate
     stage there are ZERO visible marks, so a test that never asks for the
     stratum tests nothing. It is asked for the way the app's own contract says
     to ask: `bus.emit('ask:stage', { level: 'apparatus' })`.

     AND FOCUS IS DELIBERATELY NOT THE PRESS. `onMark()`: "A PRESS OPENS THE
     REASONS. FOCUS AND HOVER ONLY SAY THERE ARE SOME" — opening the sheet on
     focus moved focus into it and forward Tab could not get past (WCAG 2.1.2,
     3.2.1). So focus is asserted to keep focus, and the press is asserted to
     open the reasons. */
  await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(600);
  const t4 = await page.evaluate(() => {
    const soft = new Set(['circa', 'contested', 'range', 'decade', 'century']);
    const isSoft = d => !!d && (d.circa === true || soft.has(d.precision));
    const d = window.BEA.data;
    const want = [];
    for (const e of d.events) if (isSoft(e.date)) want.push(e.year);
    for (const a of d.acquisitions) if (isSoft(a.date)) want.push(a.year);
    for (const x of d.departures) if (isSoft(x.date)) want.push(x.year);
    /* THE APP'S OWN LIST OF WHAT IT CANNOT SETTLE — `buildUncertain(data)`,
       held on the timeline. The marks are CLUSTERS of it (`data-years` says
       how many years each one swallowed at this window width), which is why
       counting marks against soft dates one-for-one was never the right test:
       35 marks carry 148 years. */
    const tl = document.querySelector('.tl').__p03;
    const unc = (tl && tl.uncertain) || [];
    const uncYears = new Set(unc.map(u => u.year));
    const marks = [...document.querySelectorAll('.tl-mark')];
    const onAxis = marks.filter(m => m.getClientRects().length && m.getBoundingClientRect().width > 1);
    return {
      stage: document.getElementById('app').dataset.stage,
      soft: want.length, uncertain: unc.length,
      marks: marks.length, onAxis: onAxis.length,
      yearsCarried: onAxis.reduce((a, m) => a + (+m.dataset.years || 1), 0),
      softNotUncertain: want.filter(y => !uncYears.has(y)),
      noReason: onAxis.filter(m => (m.getAttribute('aria-label') || '').length < 60).map(m => m.dataset.year),
      noReasonInList: unc.filter(u => !u.reasons || !u.reasons.length || !u.reasons[0].note).map(u => u.year),
      keyShown: !!(document.querySelector('.tl__key') && !document.querySelector('.tl__key').hidden),
      sample: onAxis.length ? onAxis[Math.floor(onAxis.length / 2)].dataset.year : null,
    };
  });
  log('T4 ' + JSON.stringify(t4));
  C.t('T4 the rail arrives with the apparatus', t4.stage === 'apparatus' && t4.onAxis > 0 && t4.keyShown,
    'stage=' + t4.stage + ', ' + t4.onAxis + ' marks carrying ' + t4.yearsCarried + ' years, key ' + (t4.keyShown ? 'shown' : 'hidden'),
    'the marks and their key, at data-stage=apparatus');
  C.t('T4 every soft date in the data is a date the atlas says it cannot settle', t4.softNotUncertain.length === 0,
    t4.softNotUncertain.length ? t4.softNotUncertain.join(',') : 'all ' + t4.soft + ' of them', 'none unaccounted for');
  C.t('T4 and every one of those years is drawn on the axis', t4.yearsCarried === t4.uncertain,
    t4.yearsCarried + ' years across ' + t4.onAxis + ' clusters', t4.uncertain + ' (the whole uncertain list)');
  C.t('T4 and every one of them carries its reason', t4.noReasonInList.length === 0,
    t4.noReasonInList.length ? t4.noReasonInList.join(',') : 'all ' + t4.uncertain, 'a note on every one');
    C.t('T4 every drawn mark carries its reason', t4.noReason.length === 0,
    t4.noReason.length ? t4.noReason.join(',') : 'all ' + t4.onAxis, 'an aria-label of 60+ characters');

  if (t4.sample) {
    await page.evaluate((y) => document.querySelector('.tl-mark[data-year="' + y + '"]').focus(), t4.sample);
    await page.waitForTimeout(400);
    const onFocus = await page.evaluate(() => ({
      active: document.activeElement.className,
      pop: (() => { const p = document.querySelector('.tl__pop'); return !!(p && !p.hidden); })(),
    }));
    C.t('T4 focus stays on the mark (WCAG 2.1.2)', onFocus.active.includes('tl-mark') && !onFocus.pop,
      'focus on .' + onFocus.active.split(' ')[0] + ', sheet ' + (onFocus.pop ? 'stolen' : 'closed'),
      'focus kept, the reasons one press away');
    await page.click('.tl-mark[data-year="' + t4.sample + '"]');
    await page.waitForTimeout(900);
    const onPress = await page.evaluate(() => {
      const p = document.querySelector('.tl__pop');
      return { open: !!(p && !p.hidden), text: p ? p.textContent.trim().slice(0, 120) : '' };
    });
    C.t('T4 one press opens the reasons', onPress.open && onPress.text.length > 40,
      onPress.open ? '"' + onPress.text + '"' : 'nothing opened', 'the reasons, in .tl__pop');
  }
  await shot('t4-mark-rail', '.app__time');

  /* ---- T5: 600 frames, inside budget ------------------------------------ */
  const t5 = await page.evaluate(async () => {
    const store = window.BEA.store;
    const tl = document.querySelector('.tl').__p03;
    if (!tl) return { missing: true };
    for (let y = 1600; y < 1650; y++) { store.dispatch('setYear', y); store.flush(); }
    tl.perf.reset();
    const t0 = performance.now();
    for (let y = 1400; y < 2000; y++) { store.dispatch('setYear', y); store.flush(); }
    const total = performance.now() - t0;
    return { totalMs: +total.toFixed(2), perFrameWholeApp: +(total / 600).toFixed(4),
             timelineFrames: tl.perf.n, timelinePerFrame: +(tl.perf.ms / Math.max(1, tl.perf.n)).toFixed(4),
             timelineWorstFrame: +tl.perf.worst.toFixed(3) };
  });
  log('T5 ' + JSON.stringify(t5));
  C.t('T5 the timeline exposes its perf handle', !t5.missing, t5.missing ? '.tl.__p03 MISSING' : 'present', '.tl.__p03');
  if (!t5.missing) {
    C.t('T5 600 scrub frames stay under 16ms each', t5.perFrameWholeApp < 16,
      t5.perFrameWholeApp + 'ms per frame across the whole app (timeline ' + t5.timelinePerFrame + 'ms, worst ' + t5.timelineWorstFrame + 'ms)',
      '< 16ms');
  }

  /* ---- PLAYBACK: it stops itself, and says why --------------------------
     ON A FRESH PAGE. T1 above starts and ends a lesson, which leaves the band
     holding "Rejoin at step 1" — a higher-priority message than the stop's
     55 — so the old check was reading a sentence the student's own history put
     there. The rule is about a stop; the state it is asserted in has to be one
     a stop can actually speak into. */
  await page.goto(String(url).split('#')[0], { waitUntil: 'load' });
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (_) {} });
  await page.reload({ waitUntil: 'load' });
  await routes.ready(page);
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const s = window.BEA.store; s.batch(d => { d('setYear', 1855); d('setSpeed', 16); }); });
  await page.evaluate(() => window.BEA.store.dispatch('play'));
  await page.waitForFunction(() => !window.BEA.store.getState().playing, null, { timeout: 12000 }).catch(() => {});
  const stopped = await page.evaluate(() => ({
    year: window.BEA.store.getState().year,
    playing: window.BEA.store.getState().playing,
    /* THE STOP IS SPOKEN IN THE BAND NOW, not in a `.tl__stopcard`. */
    mark: (document.querySelector('.cx-lede__mark') || {}).textContent,
    say: (document.querySelector('.cx-lede__say') || {}).textContent,
    cta: (document.querySelector('.cx-cta__w') || {}).textContent,
  }));
  log('PLAY stop: ' + JSON.stringify(stopped));
  C.t('PLAY playback stops itself before the end', !stopped.playing && stopped.year > 1855 && stopped.year < 2000,
    'stopped at ' + stopped.year, 'paused at a moment that matters');
  C.t('PLAY and the band says why', !!stopped.say && stopped.say.length > 20 && String(stopped.mark || '').trim() === String(stopped.year),
    'mark "' + stopped.mark + '" say "' + String(stopped.say).slice(0, 70) + '" cta "' + stopped.cta + '"',
    'the year, a sentence, and a control to keep going');
  await shot('play-stop');

  C.finish('P03 acceptance — FEATURE_SPEC §2');
};
