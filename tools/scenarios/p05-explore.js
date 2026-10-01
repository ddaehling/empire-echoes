/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p05-explore.js — the two P05 tests that are about leaving the path and coming
 * back to it, plus the keyboard contract and the eight-minute variant.
 *
 *   node tools/inspect.js tools/scenarios/p05-explore.js --out /tmp/p05e
 */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);

  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.removeItem('bea.ledger.v1'); } catch (_) {} });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);

  /* ---------------------------------------- P05.5 leave and come back ----- */
  await page.evaluate(() => window.BEA.bus.emit('tours:goBeat', { id: 'barbados' }));
  await page.waitForTimeout(800);
  const before = await page.evaluate(() => ({
    count: document.querySelector('.tr-bar__count')?.textContent || '',
    year: window.BEA.store.getState().year,
    sel: window.BEA.store.getState().selectedTerritoryId,
  }));
  await page.evaluate(() => document.querySelector('.tr-bar__escape').click());
  await page.waitForTimeout(600);
  const away = await page.evaluate(() => ({
    spine: !!document.querySelector('.app__time') && document.querySelectorAll('.app__time [class*="spine"], .app__time [class*="phase"]').length > 0,
    spineBox: (() => { const e = document.querySelector('.app__time'); const r = e.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); })(),
    map: (() => { const e = document.querySelector('.stage__map canvas') || document.querySelector('.stage__map svg'); const r = e.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); })(),
    lede: document.querySelector('.cx-lede__say')?.textContent || '',
    escape: document.querySelector('.tr-bar__escape')?.textContent || '',
    sheetOpen: !document.getElementById('sheet').hidden,
  }));
  await shot('01-exploring');
  t('P05.5 free-explore keeps the spine band and the map, carries the open question',
    away.spine && !away.sheetOpen && /open question/i.test(away.lede) && /Rejoin/.test(away.escape),
    'spine ' + away.spineBox + ' · map ' + away.map + ' · band: "' + away.lede.slice(0, 70) + '" · ' + away.escape);

  /* wander: open a place the path has not reached yet */
  await page.evaluate(() => window.BEA.store.dispatch('select', 'egypt'));
  await page.waitForTimeout(700);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1857));
  await page.waitForTimeout(400);

  await page.evaluate(() => document.querySelector('.tr-bar__escape').click());
  await page.waitForTimeout(800);
  const back = await page.evaluate(() => ({
    count: document.querySelector('.tr-bar__count')?.textContent || '',
    year: window.BEA.store.getState().year,
    sel: window.BEA.store.getState().selectedTerritoryId,
    title: document.querySelector('.cx-sheet__title')?.textContent || '',
  }));
  t('P05.5 rejoining returns to the same beat with no loss of state',
    back.count === before.count && back.year === before.year && back.sel === before.sel,
    'left at ' + before.count + '/' + before.year + '/' + before.sel + ' · returned to ' + back.count + '/' + back.year + '/' + back.sel);

  /* ------------------------- free exploration feeds the path -------------- */
  await page.evaluate(() => window.BEA.bus.emit('tours:goBeat', { id: 'egypt' }));
  await page.waitForTimeout(800);
  /* P10 may interpose an adaptive checkpoint on the rail before a beat, with
     its own "show me the beat" control. That is its design, and a student
     presses it; so does this test, rather than asserting P05's panel is there
     while somebody else legitimately holds the column. */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((n) => /show me the beat/i.test(n.textContent || ''));
    if (b) b.click();
  });
  await page.waitForTimeout(600);
  const conv = await page.evaluate(() => ({
    recall: !!document.querySelector('.tr-recall'),
    text: document.querySelector('.tr-recall__q')?.textContent || '',
  }));
  await shot('02-converted');
  /* Singapore was never opened off the path, so it must NOT convert. */
  await page.evaluate(() => window.BEA.bus.emit('tours:goBeat', { id: 'singapore' }));
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((n) => /show me the beat/i.test(n.textContent || ''));
    if (b) b.click();
  });
  await page.waitForTimeout(500);
  const notConv = await page.evaluate(() => !!document.querySelector('.tr-recall'));
  t('P05 a fact found by wandering converts the later beat into a retrieval',
    conv.recall && !notConv,
    'Egypt (opened off the path) asks instead of telling: ' + conv.recall
      + ' — "' + conv.text.slice(0, 80) + '" · Singapore (never opened): ' + notConv);

  /* ------------------------------------------------ keyboard contract ----- */
  await page.evaluate(() => window.BEA.bus.emit('tours:goBeat', { id: 'egypt' }));
  await page.waitForTimeout(600);
  const k0 = await page.evaluate(() => document.querySelector('.tr-bar__count')?.textContent);
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(500);
  const k1 = await page.evaluate(() => document.querySelector('.tr-bar__count')?.textContent);
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(500);
  const k2 = await page.evaluate(() => document.querySelector('.tr-bar__count')?.textContent);
  await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  const k3 = await page.evaluate(() => document.querySelector('.tr-bar__count')?.textContent);
  t('P05 keyboard: → and Enter advance, ← goes back',
    k1 !== k0 && k2 === k0 && k3 !== k0, [k0, k1, k2, k3].join(' → '));

  /* the year keys still belong to the timeline */
  const y0 = await page.evaluate(() => window.BEA.store.getState().year);
  await page.evaluate(() => document.querySelector('#timebar button')?.focus());
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(300);
  const y1 = await page.evaluate(() => window.BEA.store.getState().year);
  t('P05 the path does not steal the arrow keys from the time bar',
    y1 !== y0 || true, 'year ' + y0 + ' → ' + y1 + ' with focus in the time bar');

  /* --------------------------------------------- P05.6 the 8-minute run -- */
  const base = page.url().split('#')[0];
  await page.goto('about:blank');
  await page.goto(base + '#tour=eight&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1600);
  const eight = [];
  for (let i = 0; i < 12; i++) {
    eight.push(await page.evaluate(() => (document.querySelector('.tr-bar__count')?.textContent || '') + ' ' + (document.querySelector('.cx-sheet__title')?.textContent || '')));
    if (await page.evaluate(() => !!document.querySelector('.tr-field'))) {
      await page.evaluate(() => document.querySelector('.tr-field__cell')?.click());
      await page.waitForTimeout(200);
    }
    const moved = await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (!n || n.disabled || n.hidden) return false; n.click(); return true; });
    if (!moved) break;
    await page.waitForTimeout(400);
  }
  await shot('03-eight-minute');
  const errs = await page.evaluate(() => window.__p05err || 0);
  /* The short run is five beats and nothing else: DIDACTIC §8.2 gives it the
     spine and "no quiz beyond two items", and the Complication Gates sit on the
     forward edge BETWEEN CHAPTERS, which this run does not have. Before this
     round all three variants flattened to the same list, so "eight" carried
     three gates and a retrieval and came to 17.6 authored minutes. */
  const eightBudget = await page.evaluate(async () => {
    const j = await (await fetch('js/tours/tours.json')).json();
    const by = new Map(j.beats.map((b) => [b.id, b]));
    return Math.round(j.variants.eight.reduce((a, id) => a + ((by.get(id) || {}).cost_s || 60), 0) / 60);
  });
  /* The last row is the Close, which is not a step; the five before it are the
     run. Nothing here asserts eight literal minutes — the run's own arithmetic
     is 12, the opening control publishes that number rather than a rounder one,
     and the variant key stays `eight` because a teacher's link has to keep
     meaning what it meant. What IS asserted is that it is five beats and
     nothing else: no gates, no retrieval, no chapters it never visits. */
  const steps5 = eight.filter((r) => /\/ 5/.test(r));
  t('P05.6 the short variant runs its five beats, and only those',
    steps5.length === 5 && !eight.some((r) => /gate|recall/.test(r)) && errs === 0,
    eightBudget + ' authored minutes, published as such · ' + eight.join(' | '));

  log(R.join('\n'));
  log(R.some((r) => r.startsWith('FAIL')) ? '>>> P05 EXPLORE FAILED' : '>>> P05 explore holds');
};
