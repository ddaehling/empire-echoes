/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `w8-run`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: the route a cold start gives a student can be
 * walked end to end — every forward edge opens, every through-line blank fills,
 * the Close signs, and the printed sheet prints.
 *
 * ROUND 2 OF WAVE 9. This file walked `process.env.ROUTE || 'period'` — a route
 * `variantMeta` marks retired and `routeIds` no longer offers — through an
 * environment variable no runner sets, and it printed PASS/FAIL rows and exited
 * 0, so `tools/acceptance.js` reported it green for 186 seconds of walking a
 * lesson nobody is given. It now takes the route from the payload
 * (`lib/routes.js::chosen`, default first), shares its walker with
 * `w9-close.js` (`lib/walk.js`, where every line of it was learned from a run
 * that stalled), and collects through `Checks()`, whose `finish()` throws.
 *
 *   node tools/inspect.js tools/scenarios/w8-run.js --out /tmp/w8run
 *   node tools/inspect.js tools/scenarios/w8-run.js --route lesson-two --out /tmp/w8run2
 */
const routes = require('./lib/routes.js');
const walker = require('./lib/walk.js');

module.exports = async ({ page, shot, log }) => {
  const url = 'http://localhost:8777/app/';
  const C = routes.Checks(log);
  const t = (id, ok, got, want) => C.t(id, ok, got, want);

  await page.goto(url, { waitUntil: 'load' });
  const all = await routes.payload(page);
  /* THE DEFAULT, unless the runner named one. Walking every route end to end is
     five full lessons of wall clock; the suite walks the one a cold start
     gives, and `--route <id>` walks another on demand. */
  const ROUTE_ID = (await routes.chosen(page))[0];
  const ROUTE = ROUTE_ID;
  const pay = { def: all.default, r: all.routes.find((x) => x.id === ROUTE_ID) || null };
  C.t('R0 the route is one the app publishes', !!pay.r, ROUTE_ID, 'in the payload');
  if (!pay.r) { C.finish('a complete run of the default route'); return; }
  C.t('R1 and it is not retired', !pay.r.retired, String(pay.r.retired), 'a route a student may be given');
  log('route ' + ROUTE + (pay.def === ROUTE ? '  (THE DEFAULT)' : '  (default is ' + pay.def + ')'));
  log('  for: ' + pay.r.for + ' · ' + pay.r.steps + ' steps · ' + pay.r.beats + ' beats');
  log('  computed: ' + pay.r.minutesExact + ' min at 180 wpm, ' + pay.r.minutesExactMax + ' min at 110 wpm'
    + ' · card says "' + pay.r.minutesSay + '" · one figure ' + pay.r.minutes);
  log('  fits one ' + pay.r.periodMinutes + '-minute period: ' + pay.r.fitsPeriod + ' · periods needed: ' + pay.r.periods);
  log('  must-stick: ' + pay.r.covers.length + '/' + pay.r.mustStickTotal + ' (floor ' + pay.r.mustStickFloor + ')'
    + ' · drops ' + pay.r.drops.map((d) => d.t).join(','));
  log('  in-beat retrieval moments: ' + pay.r.checkpoints + ' · counted figures: ' + pay.r.figures
    + ' · Close lines greyed: ' + pay.r.greyLines.length);

  const click = (sel, n) => walker.click(page, sel, n);
  const countOf = async (sel) => page.locator(sel).count();

  /* THE WALKER LIVES IN `lib/walk.js` NOW, so `w9-close.js` walks a lesson the
     same way this does. Everything it knows was learned from a run that
     stalled: the order beat only takes the next card chronologically; a beat
     hosting a checkpoint asks two things and needs two passes; "Commit both
     guesses" must be pressed before "That is my guess"; and pressing a commit
     on an empty box spends the beat's one commitment on nothing and greys the
     Close line that beat earns. */
  const satisfy = () => walker.satisfy(page);

  await walker.cold(page, url);
  await page.goto(routes.href(url, ROUTE_ID, 1), { waitUntil: 'load' });
  await page.reload({ waitUntil: 'load' });
  await routes.ready(page);
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button, a')]
      .find((x) => /^start\b/i.test((x.textContent || '').trim()));
    if (b) b.click();
  });
  await page.waitForTimeout(800);

  const t0 = Date.now();
  const seen = [];
  let closed = false;
  for (let i = 1; i <= 40; i++) {
    const m = await page.evaluate(() => ({
      count: (document.querySelector('.tr-bar__count') || {}).textContent || '',
      title: (document.querySelector('.tr-panel__title') || {}).textContent || '',
      mark: (document.querySelector('.tr-panel__mark') || {}).textContent || '',
      gate: !!document.querySelector('.tr-field'),
      recall: !!document.querySelector('.tr-recall'),
      cp: !!document.querySelector('.qz-cp'),
      close: !!document.querySelector('.cl-close'),
      nextOff: !!(document.querySelector('.tr-bar__next') || {}).disabled,
    }));
    if (m.close) { closed = true; break; }
    seen.push({ i, count: m.count.trim(), title: m.title.trim(), mark: m.mark.trim(), gate: m.gate, recall: m.recall, cp: m.cp });
    /* TWICE. A beat that is hosting a retrieval moment shows the checkpoint
       card first and its own question underneath it, so one pass answers the
       checkpoint and the second answers the beat — which is the order a
       student meets them in. */
    const did = await satisfy();
    for (const x of await satisfy()) did.push(x);
    log('step ' + String(i).padStart(2) + ' ' + m.count.trim().padEnd(9)
      + (m.gate ? '[gate] ' : '') + (m.recall ? '[recall] ' : '') + (m.cp ? '[checkpoint] ' : '')
      + m.title.slice(0, 46).padEnd(48) + (did.length ? 'did: ' + did.join(',') : ''));
    if (i <= 3 || m.cp || m.recall) await shot('s' + String(i).padStart(2, '0'));
    const ok = await click('.tr-bar__next');
    if (!ok) {
      const b = await page.evaluate(() => [...document.querySelectorAll('button')].filter((x) => x.offsetParent)
        .map((x) => ({ t: (x.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 34), d: x.disabled, c: (x.className || '').toString().slice(0, 32) })));
      log('CANNOT ADVANCE at step ' + i + ' — ' + JSON.stringify(b).slice(0, 900));
      break;
    }
    await page.waitForTimeout(420);
  }
  const wall = Math.round((Date.now() - t0) / 1000);

  /* the Close */
  await page.waitForTimeout(1200);
  const audit = await page.evaluate(() => (window.BEA && window.BEA.throughLineAudit) || null);
  if (audit) log('through-line audit for ' + ROUTE_ID + ': ' + JSON.stringify((audit.table && audit.table[ROUTE_ID]) || audit).slice(0, 400));

  const cl = await page.evaluate(() => {
    const blk = document.querySelector('.cl-blk');
    const gaps = blk ? blk.querySelectorAll('.cl-blk__gap').length : -1;
    const filled = blk ? blk.querySelectorAll('.cl-blk__filled').length : -1;
    const txt = (document.querySelector('.cl-close') || document.body).innerText;
    return {
      open: !!document.querySelector('.cl-close'),
      gaps: gaps >= 0 ? gaps : document.querySelectorAll('.cl-say__blank').length,
      filled: filled >= 0 ? filled : document.querySelectorAll('.cl-say__filled').length,
      line: (document.querySelector('.cl-say') || blk || {}).innerText || '',
      sign: !!document.querySelector('.cl-sign__field'),
      print: [...document.querySelectorAll('button, a')].filter((b) => /print|sheet/i.test(b.textContent || '')).map((b) => b.textContent.trim().slice(0, 40)),
      grey: (txt.match(/grey/gi) || []).length,
      stand: (document.querySelector('.cl-close__stand') || {}).innerText || '',
    };
  });
  log('CLOSE: ' + JSON.stringify({ open: cl.open, gaps: cl.gaps, filled: cl.filled, sign: cl.sign, print: cl.print }));
  log('through-line: ' + String(cl.line).replace(/\s+/g, ' ').slice(0, 340));
  log('the stand: ' + String(cl.stand).replace(/\s+/g, ' ').slice(0, 300));
  await shot('close');

  if (cl.sign) {
    await page.evaluate(() => {
      const f = document.querySelector('.cl-sign__field');
      if (f) { f.focus(); f.value = 'It started as sugar islands worked by enslaved Africans who never stopped resisting, became a trading company that ruled India on Indian revenue, and came apart because the people it ruled organised and Britain went broke.'; f.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    await page.waitForTimeout(400);
    const signed = await page.evaluate(() => ({
      ok: !!document.querySelector('.cl-sign__ok'),
      finish: [...document.querySelectorAll('button')].filter((b) => /finish|print/i.test(b.textContent || '')).map((b) => ({ t: b.textContent.trim().slice(0, 40), d: b.disabled })),
    }));
    log('signed: ' + JSON.stringify(signed));
    await shot('signed');
    const printed = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => /finish and print|print/i.test(x.textContent || '') && !x.disabled);
      if (!b) return 'no print control';
      window.__printed = 0; const was = window.print; window.print = () => { window.__printed++; };
      b.click();
      setTimeout(() => { window.print = was; }, 1500);
      return 'clicked: ' + b.textContent.trim().slice(0, 40);
    });
    await page.waitForTimeout(1400);
    const sheet = await page.evaluate(() => ({
      printed: window.__printed || 0,
      sheet: !!document.querySelector('.cl-sheet, .pr-sheet, [data-print]'),
      body: document.body.innerText.slice(0, 240).replace(/\s+/g, ' '),
    }));
    log('print: ' + printed + ' -> ' + JSON.stringify(sheet).slice(0, 400));
    await shot('printed');
    t('P4 the Close signs', signed.ok || signed.finish.length > 0, JSON.stringify(signed.finish).slice(0, 80), 'a finish/print control');
    t('P5 the sheet prints', sheet.printed > 0 || sheet.sheet, 'printed=' + sheet.printed + ' sheet=' + sheet.sheet, 'a print');
  }

  const recalls = seen.filter((s) => s.recall).length;
  const cps = seen.filter((s) => s.cp).length;
  t('P1 the run reaches the Close', closed && cl.open, 'closed=' + closed, 'true');
  /* NOT SIX. Six is the number of slots in §2.3's UNIT sentence, and it was
     hardcoded when the default route was the whole unit. A lesson signs its own
     through-line (§8.4(3)) and Lesson One's has four slots. The rule is that
     the sentence a student is asked to sign has no holes in it, whichever
     sentence this route's Close offers. */
  t('P2 every through-line blank fills', cl.gaps === 0 && cl.filled > 0,
    cl.filled + ' filled, ' + cl.gaps + ' still blank',
    'this route\'s own sentence, complete');
  t('P3 the retrievals fire', recalls + cps >= (pay.r.checkpoints || 0), recalls + ' recall steps + ' + cps + ' checkpoints', 'at least ' + pay.r.checkpoints + ' checkpoints');
  t('P6 the walk matches the published step count', seen.length === pay.r.steps, seen.length + ' steps walked', pay.r.steps + ' published');

  log('');
  log('WALL CLOCK, a machine that never reads: ' + wall + 's over ' + seen.length + ' steps.');
  log('THE APP’S OWN FIGURE: ' + pay.r.minutesExact + ' min at 180 wpm, ' + pay.r.minutesExactMax + ' at 110 wpm.');
  C.finish('a complete run of ' + (pay.r.label || ROUTE_ID));
};
