/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p05-path.js — the executable acceptance test for P05, the guided path.
 *
 * Run it at every contract viewport, in light, dark and reduced motion:
 *
 *   node tools/inspect.js tools/scenarios/p05-path.js --out /tmp/p390  --mobile
 *   node tools/inspect.js tools/scenarios/p05-path.js --out /tmp/p768  --w 768  --h 1024
 *   node tools/inspect.js tools/scenarios/p05-path.js --out /tmp/p900  --w 900  --h 700
 *   node tools/inspect.js tools/scenarios/p05-path.js --out /tmp/p1366 --w 1366 --h 768
 *   node tools/inspect.js tools/scenarios/p05-path.js --out /tmp/p1440 --w 1440 --h 900
 *
 * WHY IT EXISTS. `budget.js` and `shell-accept.js` measure the COLD PLATE.
 * Every defect the round-2 critic found in the lesson lived in
 * `data-stage="working"` with a beat panel mounted — an empty sheet body at
 * 390, a Back/Next bar under the dossier, a beat title behind the map — and
 * none of the green harnesses could see any of it. This one walks the whole
 * path, step by step, the way a student does, and asserts at every step that
 * the lesson can actually be finished. It prints PASS/FAIL per rule and
 * `>>> the path holds` / `>>> PATH BROKEN`.
 */
module.exports = async ({ page, shot, log }) => {
  const fails = [];
  const ok = (cond, msg) => { log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fails.push(msg); };

  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1800);

  /* ---------------------------------------------- the content contract -- */
  const doc = await page.evaluate(async () => {
    const j = async (u) => (await fetch(u)).json();
    const t = await j('js/tours/tours.json');
    const g = await j('js/tours/gates.json');
    const b = await j('js/quiz/bank.json').catch(() => ({ items: [] }));
    return { t, g, bank: (b.items || b) };
  });
  const byId = new Map(doc.t.beats.map((b) => [b.id, b]));
  const gateIds = new Set((doc.g.gates || []).map((x) => x.id));
  const bankIds = new Set((doc.bank || []).map((x) => x.id));
  let bad = [];
  for (const [name, ids] of Object.entries(doc.t.variants)) {
    for (const id of ids) {
      const b = byId.get(id);
      if (!b) { bad.push(name + ': no beat ' + id); continue; }
      if (!b.t) bad.push(id + ' has no T-number');
      if (!b.actor || !b.actor.name) bad.push(id + ' has no named actor');
      if (b.gateAfter && !gateIds.has(b.gateAfter)) bad.push(id + ' points at a gate that is not there: ' + b.gateAfter);
      if (b.recallAfter && !bankIds.has(b.recallAfter.id)) bad.push(id + ' points at a bank item that is not there: ' + b.recallAfter.id);
    }
  }
  ok(bad.length === 0, 'every beat in every variant has one T-number, a named non-British actor and no dangling reference' + (bad.length ? ' — ' + bad.join('; ') : ''));
  const essays = (doc.t.chapters || []).map((c) => [c.id, c.essay ? c.essay.trim().split(/\s+/).length : 0]);
  ok(essays.every(([, n]) => n >= 250 && n <= 400), 'every chapter ships a 250–400 word argument: ' + essays.map(([i, n]) => i + ' ' + n).join(', '));
  const recalls = doc.t.beats.filter((b) => b.recallAfter).length;
  ok(recalls >= 4, 'at least four adaptive retrieval items sit ON the path before the Close (' + recalls + ')');

  /* --------------------------------------------------- walking the path -- */
  const snap = () => page.evaluate(() => {
    const vis = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const c = getComputedStyle(e);
      if (c.display === 'none' || c.visibility === 'hidden' || !r.width || !r.height) return null; return { w: Math.round(r.width), h: Math.round(r.height) }; };
    const hit = (s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false;
      const t = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)); return !!(t && (t === e || e.contains(t))); };
    const body = document.querySelector('.cx-sheet__body');
    const say = document.querySelector('.cx-lede__say');
    const next = document.querySelector('.tr-bar__next');
    return {
      count: (document.querySelector('.tr-bar__count') || {}).textContent || '',
      title: (document.querySelector('.cx-sheet__title') || {}).textContent || '',
      sheetOpen: !!vis('.app__sheet'),
      words: body ? (body.innerText || '').trim().split(/\s+/).filter(Boolean).length : 0,
      nextVis: !!vis('.tr-bar__next'), nextHit: hit('.tr-bar__next'),
      nextDisabled: !!(next && next.disabled), nextTab: next ? next.getAttribute('tabindex') : null,
      sayVis: !!vis('.cx-lede__say'), sayText: say ? (say.innerText || '').trim() : '',
      sayClipped: say ? (say.scrollHeight > say.clientHeight + 2 || say.scrollWidth > say.clientWidth + 2) : false,
      gate: !!document.querySelector('.tr-field__cell'),
      end: !!document.querySelector('.tr-bar__end'),
      scroll: document.documentElement.scrollHeight - innerHeight,
      thru: (document.querySelector('.cl-say') || {}).scrollWidth - ((document.querySelector('.cl-say') || {}).clientWidth || 0),
    };
  });

  await page.evaluate(() => window.BEA.bus.emit('tours:start', {}));
  await page.waitForTimeout(1400);
  const total = +(((await snap()).count.split('/')[1]) || 0);
  ok(total >= doc.t.variants.thirty.length, 'the counter counts every step a student must do, gates and recalls included (' + total + ')');

  const t0 = Date.now();
  for (let step = 1; step <= total; step++) {
    const s = await snap();
    const tag = 'step ' + step + ' [' + s.count.replace(/\s+/g, ' ') + '] ' + s.title.slice(0, 34);
    if (step <= 3 || s.gate || step >= total - 1) await shot('s' + String(step).padStart(2, '0'));
    ok(s.sheetOpen, tag + ' — a surface is open');
    ok(s.words >= 12, tag + ' — the panel has a body (' + s.words + ' words)');
    ok(s.sayVis && s.sayText.length > 4, tag + ' — the beat speaks in the band');
    ok(!s.sayClipped, tag + ' — the sentence is not clipped');
    ok(s.nextVis && s.nextHit, tag + ' — Next is on screen and nothing is over it');
    ok(s.scroll <= 0, tag + ' — B4: no document scroll (' + s.scroll + ')');
    ok(s.thru <= 1, tag + ' — the through-line is not clipped mid-word (' + s.thru + 'px over)');
    if (s.gate) {
      ok(s.nextDisabled && s.nextTab === '-1', tag + ' — the gate disables Next and takes it out of the tab order');
      await page.locator('.tr-field__cell').nth(4).click();
      await page.waitForTimeout(250);
      ok(!(await snap()).nextDisabled, tag + ' — any placement releases the gate');
    }
    if (step === total) break;
    const r = await page.locator('.tr-bar__next').click({ timeout: 5000 }).then(() => 'ok').catch((e) => e.message.slice(0, 80));
    ok(r === 'ok', tag + ' — Next advances (' + r + ')');
    if (r !== 'ok') break;
    await page.waitForTimeout(700);
  }

  /* -------------------------------------------------------- free explore */
  await page.evaluate(() => window.BEA.bus.emit('tours:explore'));
  await page.waitForTimeout(500);
  const ex = await page.evaluate(() => ({
    spine: !!document.querySelector('.tl__spine, .tl__phase, [class*="spine"]'),
    say: (document.querySelector('.cx-lede__say') || {}).innerText || '',
    map: !!document.querySelector('.stage__map canvas, .map__plate'),
  }));
  ok(ex.map, 'free explore keeps the map');
  ok(/open question|Exploring/i.test(ex.say), 'free explore carries the open question into the band — band says: "' + ex.say.replace(/\s+/g, ' ').slice(0, 90) + '"');
  await page.evaluate(() => window.BEA.bus.emit('tours:rejoin'));
  await page.waitForTimeout(600);
  ok((await snap()).words >= 12, 'rejoining returns to the same beat with its panel');

  /* -------------------------------------------------------------- the end */
  await page.locator('.tr-bar__next').click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await shot('close');
  const close = await page.evaluate(() => ({
    title: (document.querySelector('.cx-sheet__title') || {}).textContent || '',
    names: (document.querySelector('.cl-remaining__names') || {}).textContent || '',
    lines: document.querySelectorAll('.cl-line').length,
    end: !!document.querySelector('.tr-bar__end'),
    band: (document.querySelector('.cx-lede__say') || {}).innerText || '',
  }));
  ok(/defend/i.test(close.title), 'the last Next lands on the Close');
  ok(close.lines >= 12, 'the Close prints its twelve lines (' + close.lines + ')');
  ok(close.end, 'the transport says the lesson is over instead of still counting gates');
  ok(!/place it to go on/i.test(close.band), 'the band is not still holding the last gate instruction');
  ok(!/(^|·\s)Ireland(\s·|$)/.test(close.names), 'the Close does not call Ireland British');
  ok(/Northern Ireland only/.test(close.names) && /Sovereign Base Areas only/.test(close.names),
     'it prints the open span label for every partly-returned record');

  /* ------------------------------------------------ a cross-piece watch --
     NOT counted in this piece's verdict, because the fix is not in this
     piece's files. Under 62rem the rail is a bottom sheet that covers the
     lower two-thirds of the map's element, and `map/index.js::_dossierRect()`
     — the function that keeps the plate off the panel it is dodging — queries
     `.app__dossier` only. It has never heard of `.app__sheet`. Measured
     consequences: at 768x1024 the enlarged plate paints over the beat panel's
     head; at 390x844 the definition dial lays out 200px under the open sheet;
     and a beat that flies to Bengal centres it in a 476px box of which only
     the top 150px are visible, so the plate looks empty. One line in a file
     this piece does not own. This prints the measurement so nobody has to
     take it on trust. */
  const cross = await page.evaluate(() => {
    const sheet = document.querySelector('.app__sheet');
    const map = document.querySelector('.map');
    if (!sheet || !map) return null;
    const s = sheet.getBoundingClientRect(), m = map.getBoundingClientRect();
    if (!s.height || !m.height) return null;
    const ox = Math.max(0, Math.min(s.right, m.right) - Math.max(s.left, m.left));
    const oy = Math.max(0, Math.min(s.bottom, m.bottom) - Math.max(s.top, m.top));
    return { overlap: Math.round(ox * oy), mapH: Math.round(m.height), visible: Math.round(Math.max(0, s.top - m.top)) };
  });
  if (cross) log('WATCH  map element ' + cross.mapH + 'px tall, ' + cross.visible + 'px of it above the rail, ' + cross.overlap + 'px² under it. tours.css §1b is holding this from outside; the real fix is one line in map/index.js — `_dossierRect()` should match `.app__sheet` as well as `.app__dossier`. Delete §1b when it does.');

  log('walked in ' + Math.round((Date.now() - t0) / 1000) + 's of machine time');
  log(fails.length ? '>>> PATH BROKEN — ' + fails.length : '>>> the path holds');
  for (const f of fails) log('   ! ' + f);
};
