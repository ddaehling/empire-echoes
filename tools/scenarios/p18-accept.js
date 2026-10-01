/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * P18 — compare-two-dates. The five acceptance tests in FEATURE_SPEC §2 P18,
 * plus the four this round added. Prints PASS/FAIL per rule and
 * `>>> compare holds` / `>>> COMPARE BROKEN`.
 *
 *   node tools/inspect.js tools/scenarios/p18-accept.js --out /tmp/x --w 1440 --h 900
 *   ... --w 1366 --h 768 / --w 900 --h 700 / --mobile / --dark / --reduced
 */
const ready = (page) => page.waitForFunction(
  () => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready',
  null, { timeout: 25000 });

module.exports = async ({ page, shot, log }) => {
  const results = [];
  const t = (name, ok, detail) => { results.push([name, !!ok, detail]); log((ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? '  ' + detail : '')); };

  /* ---- AT1: a deep link renders both plates, shared view, true set diff --- */
  await page.goto('http://localhost:8777/app/#year=1820&compare=1770', { waitUntil: 'load' });
  await ready(page);
  await page.waitForTimeout(900);

  const at1 = await page.evaluate(() => {
    const d = window.BEA.data;
    const def = { test: (e) => e.controlDegree >= 1 };
    const at = (y) => { const m = new Set(); for (const [u, e] of d.statusAt(y)) if (def.test(e)) m.add(u); return m; };
    const A = at(1770), B = at(1820);
    let gained = 0, lost = 0;
    for (const u of B) if (!A.has(u)) gained++;
    for (const u of A) if (!B.has(u)) lost++;
    const fig = [...document.querySelectorAll('.cmp__f')].map((n) => n.innerText.replace(/\s+/g, ' ').trim());
    const labs = [...document.querySelectorAll('.cmp__year')].map((n) => n.textContent);
    const cvs = [...document.querySelectorAll('.cmp__plate canvas')].map((c) => c.width * c.height);
    return { gained, lost, fig, labs, cvs, sides: document.querySelectorAll('.cmp__side').length };
  });
  t('AT1a both plates drawn and labelled 1770 / 1820',
    at1.labs.join(',') === '1770,1820' && at1.cvs.length === 2 && at1.cvs.every((a) => a > 1000),
    JSON.stringify(at1.labs));
  t('AT1b the readout equals a direct set difference over data.statusAt',
    at1.fig[0] === `${at1.gained} arrived` && at1.fig[1] === `${at1.lost} went`,
    `computed ${at1.gained}/${at1.lost} · printed ${at1.fig.slice(0, 2).join(' · ')}`);

  /* ---- AT2: a scripted comparison asks first, and prints the guess back ---- */
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'america' }));
  await page.waitForTimeout(700);
  const asked = await page.evaluate(() => ({
    phase: document.querySelector('.cmp').dataset.phase,
    choices: [...document.querySelectorAll('.cmp__choice')].map((b) => b.textContent),
    plateB: !!document.querySelector('.cmp__side[data-side="b"]').offsetParent,
  }));
  t('AT2a the comparison asks before it reveals', asked.phase === 'ask' && asked.choices.length >= 2, asked.choices.join(' / '));
  await page.click('.cmp__choice[data-id="a"]');          // deliberately the wrong one
  await page.waitForTimeout(800);
  const guessed = await page.evaluate(() => {
    const g = document.querySelector('.cmp__guess');
    return { text: g ? g.innerText.replace(/\s+/g, ' ').trim() : null, phase: document.querySelector('.cmp').dataset.phase };
  });
  t('AT2b a wrong guess is printed beside the answer',
    guessed.phase === 'revealed' && /More in 1770/.test(guessed.text || '') && /More in 1820/.test(guessed.text || ''),
    guessed.text);

  /* ---- new: every arrival names who it was taken from --------------------- */
  const who = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.cmp__sec[data-kind="gain"] .cmp__row')];
    const withWho = rows.filter((r) => r.querySelector('.cmp__row-who'));
    return { n: rows.length, w: withWho.length, sample: withWho.slice(0, 2).map((r) => r.innerText.replace(/\n/g, ' | ')) };
  });
  t('R3a every arrival with a record names its counterparty', who.n > 0 && who.w / who.n > 0.8, `${who.w} of ${who.n}`);

  /* ---- new: no non-European polity is called a European power ------------- */
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { a: 1820, b: 1830 }));
  await page.waitForTimeout(800);
  const burma = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.cmp__row')].map((r) => r.innerText.replace(/\n/g, ' | '));
    const bad = rows.filter((r) => /European power/.test(r) && !/France|Spain|Netherlands|Portugal|Denmark|German/i.test(r));
    return { burma: rows.find((r) => /Burma/.test(r)) || null, assam: rows.find((r) => /Assam/.test(r)) || null, bad };
  });
  /* R3b USED TO ASSERT ONE GLOSS STRING, AND THAT WAS THE WRONG TEST.
     It required the Yandabo row to read "transferred at the end of a war" —
     the neutral gloss this module gives `war-transfer`. The shards have since
     retagged Assam and British Burma from `war-transfer` to `conquest`, which
     is the better history (the First Anglo-Burmese War was a British conquest;
     Yandabo is the treaty that recorded it) and which this row now prints, with
     "taken from the Konbaung kingdom of Burma and the Ahom kingdom" beside it.
     A test pinned to one gloss turns a correction in the dataset into a red
     build. So it asserts what the rule actually is — the intent the round-3
     disqualifier was about — and it now survives any further retag:
     the row exists, it names the polity Britain took it from, and it does not
     call a non-European polity European or use the word "handed". */
  t('R3b Yandabo 1826 names its non-European counterparty and is not a hand-over',
    !!burma.burma && /Konbaung|Ahom/.test(burma.burma)
      && !/European/.test(burma.burma) && !/handed/i.test(burma.burma), burma.burma);
  t('R3c no row calls a non-European counterparty a European power', burma.bad.length === 0, JSON.stringify(burma.bad));

  /* ---- new: the mechanism tally, and the events between ------------------- */
  const shape = await page.evaluate(() => ({
    tally: document.querySelector('.cmp__tally') ? document.querySelector('.cmp__tally').innerText.replace(/\s+/g, ' ') : null,
    ev: document.querySelector('.cmp__sec--ev') ? document.querySelector('.cmp__sec--ev .cx-panel__head').innerText.replace(/\s+/g, ' ') : null,
  }));
  t('R3d each list carries a counted tally of its mechanisms', !!shape.tally, shape.tally);
  t('R3e the events between the two dates are named (FEATURE_SPEC P18)', !!shape.ev, shape.ev);

  /* ---- new: when the list is below the fold, something points at it ------- */
  const fold = await page.evaluate(() => {
    /* THE FIRST NAMED PLACE, NOT THE FIRST SECTION HEAD. This rule measured the
       head until round 6, and at 900x700 on the 1914/1922 pair the two fell on
       opposite sides of the fold: the head "ARRIVED · 9 places" and its counted
       tally were on screen, the first name — St Helena — was 40px under it, and
       the harness called the strip dishonest for pointing at exactly the thing
       the reader could not see. index.js `_jumpCheck` has measured the row
       since round 3 and says why in its own comment; this is the rule catching
       up with the behaviour it is meant to test, not the behaviour being
       loosened to fit. Verified by measurement at 900x700: sec.top 679,
       row.top 710, scroller bottom 432 — both below the fold on the informal
       pair, and only the row below it on the peak pair. */
    const sec = document.querySelector('.cmp__row') || document.querySelector('.cmp__sec');
    const host = document.querySelector('.cmp__jumphost');
    const sc = [document.querySelector('.cmp__delta'), document.querySelector('.cmp__grid')]
      .find((n) => n && n.scrollHeight > n.clientHeight + 4);
    if (!sec || !sc) return { na: true };
    const own = host && !host.hidden ? host.getBoundingClientRect().height : 0;
    const below = sec.getBoundingClientRect().top >= sc.getBoundingClientRect().bottom + own - 24;
    return { below, shown: host ? !host.hidden : false, label: host ? host.innerText.replace(/\s+/g, ' ').trim() : null };
  });
  t('R3f the list is signposted exactly when it is off screen',
    fold.na || fold.below === fold.shown, JSON.stringify(fold));

  /* ---- new: the signpost actually moves the reader to the list ----------- */
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'dissolution' }));
  await page.waitForTimeout(700);
  await page.click('.cmp__choice[data-id="low"]');
  await page.waitForTimeout(800);
  const before = await page.evaluate(() => {
    const host = document.querySelector('.cmp__jumphost');
    return { shown: host && !host.hidden };
  });
  if (before.shown) {
    await page.click('.cmp__jump-b[data-to="loss"]');
    await page.waitForTimeout(700);
    const after = await page.evaluate(() => {
      const sc = [document.querySelector('.cmp__delta'), document.querySelector('.cmp__grid')]
        .find((n) => n && n.scrollHeight > n.clientHeight + 4);
      const b = sc.getBoundingClientRect();
      const seen = [...document.querySelectorAll('.cmp__sec[data-kind="loss"] .cmp__row')]
        .filter((r) => { const c = r.getBoundingClientRect(); return c.top >= b.top - 1 && c.bottom <= b.bottom + 1; });
      return { seen: seen.length, focus: document.activeElement.className, first: seen[0] ? seen[0].innerText.replace(/\n/g, ' | ') : null };
    });
    t('R3g pressing the signpost puts named places on screen and focus on one',
      after.seen > 0 && /cmp__row/.test(after.focus), JSON.stringify(after).slice(0, 200));
  } else {
    t('R3g the signpost is absent because the list was already on screen', true);
  }

  /* ---- new: a departure names who led it out ------------------------------ */
  const led = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.cmp__sec[data-kind="loss"] .cmp__row')];
    const w = rows.filter((r) => r.querySelector('.cmp__row-who'));
    return { n: rows.length, w: w.length, sample: w.slice(0, 2).map((r) => r.innerText.replace(/\n/g, ' | ')) };
  });
  t('R3h departures name the people who led them out', led.n > 0 && led.w / led.n > 0.7,
    `${led.w} of ${led.n} · ${led.sample[0] || ''}`);

  /* ---- AT3: below 62rem the plates stack and never become tabs ------------ */
  await page.setViewportSize({ width: 900, height: 700 });
  await page.waitForTimeout(600);
  const narrow = await page.evaluate(() => {
    const a = document.querySelector('.cmp__side[data-side="a"]').getBoundingClientRect();
    const b = document.querySelector('.cmp__side[data-side="b"]').getBoundingClientRect();
    return {
      bothDrawn: a.width > 40 && a.height > 40 && b.width > 40 && b.height > 40,
      years: [...document.querySelectorAll('.cmp__year')].map((n) => n.textContent),
      tabs: document.querySelectorAll('.cmp [role="tab"], .cmp [role="tablist"]').length,
      docScroll: document.documentElement.scrollHeight <= window.innerHeight,
    };
  });
  t('AT3 both plates stay drawn and labelled below 62rem, and are never tabs',
    narrow.bothDrawn && narrow.years.length === 2 && narrow.tabs === 0, JSON.stringify(narrow));
  t('B4 no document scroll at this viewport', narrow.docScroll);

  /* ---- AT5: operable from the keyboard alone ------------------------------ */
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.BEA.bus.emit('compare:close'));
  await page.waitForTimeout(400);
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('v');
  await page.waitForTimeout(700);
  const kb = await page.evaluate(() => ({
    open: !document.querySelector('.cmp').hidden,
    inside: document.querySelector('.cmp').contains(document.activeElement),
    focus: document.activeElement.className,
  }));
  t('AT5a `v` opens the comparison and takes focus into it', kb.open && kb.inside, kb.focus);
  const focusSide = await page.evaluate(() => {
    const a = document.querySelector('.cmp__side[data-side="a"]');
    a.focus();
    return document.activeElement === a;
  });
  await page.keyboard.press('+');
  await page.waitForTimeout(250);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(250);
  const moved = await page.evaluate(() => {
    const v = window.BEA.store.getState().mapView;
    return v ? { k: +v.k.toFixed(3), x: +v.x.toFixed(3) } : null;
  });
  t('AT5b either plate is panned and zoomed from the keyboard, and both follow',
    focusSide && moved && moved.k > 1, JSON.stringify(moved));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  t('AT5c Escape closes it', await page.evaluate(() => document.querySelector('.cmp').hidden));

  /* ---- AT4: the link round-trips into a fresh page ------------------------ */
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'peak' }));
  await page.waitForTimeout(600);
  await page.click('.cmp__choice[data-id="a"]');
  await page.waitForTimeout(700);
  const link = page.url();
  await page.goto('about:blank');
  await page.goto(link, { waitUntil: 'load' });
  await ready(page);
  await page.waitForTimeout(1100);
  const back = await page.evaluate(() => ({
    years: [...document.querySelectorAll('.cmp__year')].map((n) => n.textContent),
    phase: document.querySelector('.cmp').dataset.phase,
    guess: document.querySelector('.cmp__guess') ? document.querySelector('.cmp__guess').innerText.replace(/\s+/g, ' ').trim() : null,
    title: document.querySelector('.cmp__title') ? document.querySelector('.cmp__title').textContent : null,
  }));
  t('AT4 the link reproduces the years, the reveal and the committed guess',
    back.years.join(',') === '1914,1922' && back.phase === 'revealed' && /More in 1914/.test(back.guess || ''),
    JSON.stringify(back));
  await shot('p18-restored');

  /* ---- a year moved from outside closes it rather than showing three ------ */
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1901));
  await page.waitForTimeout(500);
  const third = await page.evaluate(() => ({
    hidden: document.querySelector('.cmp').hidden,
    compareYear: window.BEA.store.getState().compareYear,
  }));
  t('ONE YEAR a year moved from outside closes the comparison', third.hidden && third.compareYear === null, JSON.stringify(third));

  const bad = results.filter((r) => !r[1]);
  log('');
  log(bad.length ? '>>> COMPARE BROKEN — ' + bad.length + ' of ' + results.length : '>>> compare holds — ' + results.length + ' checks');
};
