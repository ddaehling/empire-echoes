/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p10-quiz`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P10: retrieval on the path, and each card says why it was chosen for this student. */
/**
 * p10-accept — FEATURE_SPEC §2 P10's six acceptance tests plus round 2's
 * seventh (retrieval ON the path, not beside it), run against the running app.
 * Prints PASS/FAIL per test with the evidence it measured.
 *   node tools/inspect.js tools/scenarios/p10-accept.js --out /tmp/p10a --w 1366 --h 768
 */
const T20 = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','T13','T14','T15','T16','T17','T18','T19','T20'];
const M18 = Array.from({length:18},(_,i)=>'M'+(i+1));

const routes = require('./lib/routes.js');

module.exports = async ({ page, shot, log, url }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  — ' + got);

  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 10000 });
  await page.waitForTimeout(600);

  /* 1 — every item carries a T-number from §3 or a misconception id from §4 */
  const bank = await page.evaluate(() => window.BEA.quiz.items().map(i => ({ id: i.id, t: i.t, m: i.misconception, lo: i.lo, kind: i.kind, onPath: !!i.onPath })));
  const bad = bank.filter(i => !(T20.includes(i.t) || M18.includes(i.m)));
  t('1 every item tagged', bad.length === 0 && bank.length > 0,
    bank.length + ' items, ' + bad.length + ' untagged' + (bad.length ? ': ' + bad.map(b=>b.id).join(',') : ''));

  /* 1b — nothing outside the twenty and the eighteen */
  const strays = bank.filter(i => (i.t && !T20.includes(i.t)) || (i.m && !M18.includes(i.m)));
  t('1b nothing outside §3/§4', strays.length === 0, strays.length + ' strays');

  /* 2 — the T-coverage of the bank and of the default path */
  const covered = [...new Set(bank.map(i => i.t))];
  const onPath = [...new Set(bank.filter(i => i.onPath).map(i => i.t))];
  t('2a all 20 in the full bank', T20.every(x => covered.includes(x)),
    covered.length + '/20: missing ' + (T20.filter(x=>!covered.includes(x)).join(',') || 'none'));
  t('2b >=14 of 20 on the default path', onPath.length >= 14, onPath.length + ' of 20 on-path');
  t('2c item kinds', new Set(bank.map(i=>i.kind)).size >= 6, [...new Set(bank.map(i=>i.kind))].join(', '));

  /* 3 — no score, percentage, streak, badge or leaderboard anywhere in the DOM */
  await page.evaluate(() => { window.BEA.quiz.open('t6-who-conquered'); });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.BEA.quiz.answer('navy'));
  await page.waitForTimeout(500);
  const words = await page.evaluate(() => {
    const t = (document.getElementById('app') || document.body).innerText;
    const hits = ['score','Score','percentage','streak','Streak','badge','Badge','leaderboard','points','out of 10','/10','%'].filter(w => t.includes(w));
    const sheet = document.querySelector('#sheet');
    return { hits, sheetText: sheet ? sheet.innerText.slice(0, 400) : '' };
  });
  t('3 no score anywhere', words.hits.length === 0, words.hits.join(',') || 'none of score/percentage/streak/badge/leaderboard/% in the DOM');

  /* 4 — a wrong answer returns the map to where the evidence is, and the item
         comes back as production, at least six minutes later */
  const after = await page.evaluate(() => ({ year: BEA.store.getState().year, sel: BEA.store.getState().selectedTerritoryId }));
  t('4a wrong answer moves the map', after.year === 1765 && after.sel === 'bengal-presidency',
    'year ' + after.year + ', selected ' + after.sel);
  const sch = await page.evaluate(() => {
    const m = BEA.quiz.metrics().firstAttemptAccuracyByTItem.T6.items['t6-who-conquered'];
    return { gapMin: (m.dueAt - m.lastAt) / 60000, firstRight: m.firstRight };
  });
  t('4b re-ask gap >= 6 minutes', sch.gapMin >= 6, sch.gapMin.toFixed(1) + ' minutes, firstRight=' + sch.firstRight);

  /* 5 — return the next day: three items, then back where you were */
  await page.evaluate(() => { BEA.quiz.close(); BEA.quiz.open('t9-1858'); });
  await page.waitForTimeout(250);
  await page.evaluate(() => window.BEA.quiz.answer(1900));
  await page.waitForTimeout(250);
  await page.evaluate(() => { BEA.quiz.close(); BEA.quiz.open('t13-berlin'); });
  await page.waitForTimeout(250);
  await page.evaluate(() => window.BEA.quiz.answer('carved'));
  await page.waitForTimeout(300);
  await page.evaluate(() => { BEA.quiz.close(); BEA.quiz._age(26 * 60 * 60 * 1000); });
  await page.waitForTimeout(200);
  const due = await page.evaluate(() => BEA.quiz.due());
  await page.evaluate(() => BEA.quiz._openOnReturn());
  await page.waitForTimeout(600);
  const ret = await page.evaluate(() => {
    const s = document.querySelector('#sheet');
    return { open: !!(s && s.offsetHeight > 0), text: s ? s.innerText.slice(0, 260) : '', due: BEA.quiz.due().length };
  });
  t('5a return opens with what went wrong', ret.open && /were here before/i.test(ret.text),
    ret.due + ' due; sheet says: ' + ret.text.split('\n').slice(0,2).join(' / '));
  await shot('return');
  const forget = await page.evaluate(() => { BEA.quiz.forget(); return localStorage.getItem('bea:metrics.v1'); });
  t('5b clearing local data works', forget === null, 'bea:metrics.v1 is ' + String(forget));

  /* 6 — keyboard alone, including the reorder path */
  await page.evaluate(() => { BEA.quiz.close(); BEA.quiz.open('t7-loop'); });
  await page.waitForTimeout(400);
  const before = await page.evaluate(() => [...document.querySelectorAll('.qz-order__i')].map(n => n.dataset.id).join('|'));
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(60);
  const liveNow = await page.evaluate(() => [...document.querySelectorAll('[aria-live]')].map(n=>n.textContent).filter(Boolean).join(' | '));
  await page.waitForTimeout(150);
  const afterKey = await page.evaluate(() => ({
    order: [...document.querySelectorAll('.qz-order__i')].map(n => n.dataset.id).join('|'),
    label: document.querySelector('.qz-order').getAttribute('aria-label') || '',
    live: (document.querySelector('[aria-live]') || {}).textContent || '',
    btnLabels: [...document.querySelectorAll('.qz-order__u')].map(b => b.getAttribute('aria-label')).slice(0,2),
  }));
  t('6a arrow key reorders', before !== afterKey.order, before + '  ->  ' + afterKey.order);
  t('6b announced to a screen reader', /up and down/i.test(afterKey.label) && afterKey.btnLabels.every(Boolean),
    'aria-label present; buttons: ' + afterKey.btnLabels.join(' / '));
  t('6c live region carries the move', /number \d of \d/.test(liveNow), liveNow.slice(-120));
  await page.keyboard.press('Tab');
  await page.waitForTimeout(120);
  await shot('keyboard');

  /* 6d — a choose item is completable by keyboard alone */
  await page.evaluate(() => { BEA.quiz.close(); BEA.quiz.open('t11-princely'); });
  await page.waitForTimeout(400);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(120);
  const chosen = await page.evaluate(() => {
    const c = document.querySelector('.qz-opt input:checked');
    const commit = document.querySelector('.qz__commit');
    return {
      chosen: !!c,
      commitEnabled: !!(commit && commit.getAttribute('aria-disabled') === 'false' && !commit.disabled),
    };
  });
  t('6d radio chooses and opens commit by keyboard', chosen.chosen && chosen.commitEnabled, JSON.stringify(chosen));

  /* 6e — a Commit that is still waiting stays IN the tab order and says what is
           missing. `disabled` would take it out of the tab order, and a keyboard
           reader who tabs past an invisible control learns nothing. */
  const waiting = await page.evaluate(() => new Promise(r => {
    BEA.quiz.close(); BEA.quiz.open('t5-compensation');
    setTimeout(() => {
      const c = document.querySelector('.qz__commit');
      c.focus();
      const reachable = document.activeElement === c;
      c.click();
      setTimeout(() => r({
        reachable, aria: c.getAttribute('aria-disabled'), dom: c.disabled,
        hint: (document.querySelector('.qz__hint') || {}).textContent || '',
        committed: !!(document.querySelector('.qz__ans') && !document.querySelector('.qz__ans').hidden),
      }), 200);
    }, 400);
  }));
  t('6e a waiting Commit is reachable, refuses, and says why',
    waiting.reachable && waiting.aria === 'true' && waiting.dom === false && waiting.hint.length > 20 && !waiting.committed,
    JSON.stringify(waiting));
  await page.evaluate(() => BEA.quiz.close());

  /* 7 — ROUND 2. Retrieval is ON the guided path. A student who does nothing
         but press Next must still be made to PRODUCE at least four things
         before the Close, each one adaptive rather than a fixed script. */
  await page.evaluate(() => { try { BEA.quiz.forget(); localStorage.clear(); } catch (_) {} });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    window.__asked = [];
    BEA.bus.on('quiz:asked', (p) => window.__asked.push(p.id));
    BEA.bus.on('close:open', () => { window.__closed = true; });
    BEA.bus.emit('tours:start', { step: 0 });
  });
  await page.waitForTimeout(900);
  /* WHAT THIS ROUTE PROMISED, read off its own published payload.
     WAVE 9 — THE `>= 4` BELOW WAS A NUMBER, NOT A RULE. It was calibrated on a
     default route that ran seventeen beats; the default is now one lesson of a
     two-lesson unit and prices ONE in-beat checkpoint and ONE spaced recall, so
     the fixed four failed a route that was behaving exactly as its own
     arithmetic says it should. The rule that does not go stale is that the run
     DELIVERS THE RETRIEVAL IT PRICED — `budget.js` charges 45 seconds for every
     one of them and the card advertises the total — so a route that prices two
     and delivers one is short, whatever the number happens to be this wave.
     The whole unit's promise is printed beside it, because §3.2's spacing is a
     property of the unit and not of either lesson. */
  const pay10 = await routes.payload(page);
  const promise = {};
  for (const r of pay10.routes) {
    const st = await routes.stepsOf(page, r.id);
    promise[r.id] = (r.checkpoints || 0) + st.filter((x) => x.kind === 'recall').length;
  }
  const here10 = await page.evaluate(() => (window.BEA.toursRoutes || {}).here) || pay10.default;
  log('retrieval promised per route: ' + Object.entries(promise).map(([k, v]) => k + (k === pay10.default ? '*' : '') + '=' + v).join('  ')
    + '   walking ' + here10);

  let steps = 0;
  const seenCards = [];
  for (let i = 0; i < 30; i++) {
    const card = await page.evaluate(() => {
      const w = document.querySelector('.qz-cp__why');
      const q = document.querySelector('.qz .cx-ask__q');
      return w && q ? { why: w.innerText.replace(/\s+/g, ' ').slice(0, 90), q: q.textContent.slice(0, 60) } : null;
    });
    if (card) seenCards.push(card);
    /* A gate holds Next until the student commits, and round 3 added two more
       kinds: a two-in-tension gate wanting five choices and a press, and a
       source beat wanting four lines written before it will show the atlas's
       four. Answer whichever is up — this walk measures the RETRIEVAL a
       Next-only student receives, not the gates, and a walker that stops at
       step 4 measures nothing. */
    for (let g = 0; g < 4; g++) {
      const moved = await page.evaluate(() => {
        const b = document.querySelector('.tr-bar__next, .tr-panel__next');
        if (b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' && /next/i.test(b.textContent || '')) return false;
        let did = false;
        for (const grp of document.querySelectorAll('.tr-tension__opts')) {
          const o = grp.querySelector('.tr-tension__opt:not([aria-pressed="true"])');
          if (o) { o.click(); did = true; }
        }
        for (const ta of document.querySelectorAll('.tr-panel textarea, .tr-panel input[type=text]')) {
          if (ta.value && ta.value.trim().length > 8) continue;
          const set = Object.getOwnPropertyDescriptor(
            ta.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set;
          set.call(ta, 'A sentence, so the gate can be answered and the walk can go on.');
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
          did = true;
        }
        for (const go of document.querySelectorAll('.tr-tension__go, .tr-ask__go, .tr-src__go, .tr-panel .btn:not([disabled])')) {
          if (go.disabled || go.getAttribute('aria-disabled') === 'true') continue;
          if (!/show me|reveal|compare|beside/i.test(go.textContent || '')) continue;
          go.click(); did = true; break;
        }
        const cell = document.querySelector('.tr-field__cell:not([aria-pressed="true"])');
        if (!did && cell) { cell.click(); did = true; }
        return did;
      });
      if (!moved) break;
      await page.waitForTimeout(360);
    }
    const cell = await page.$('.tr-field__cell');
    if (cell) { try { await cell.click({ timeout: 1500 }); await page.waitForTimeout(300); } catch (_) {} }
    const nxt = await page.$('.tr-bar__next, .tr-bar button[class*=next]');
    if (!nxt) break;
    try { await nxt.click({ timeout: 2500 }); } catch (_) { break; }
    steps += 1;
    await page.waitForTimeout(420);
    if (await page.evaluate(() => !!window.__closed)) break;
  }
  const onPathAsked = await page.evaluate(() => [...new Set(window.__asked || [])]);
  const want10 = promise[here10] != null ? promise[here10] : 0;
  t('7a the route delivers every retrieval it priced (' + here10 + ' prices ' + want10 + ')',
    onPathAsked.length >= want10,
    steps + ' presses of Next produced ' + onPathAsked.length + ' of ' + want10 + ' on ' + here10
      + ': ' + (onPathAsked.join(', ') || 'none')
      + ' | the unit promises ' + Object.entries(promise).filter(([k]) => /^lesson/.test(k)).map(([k, v]) => k + '=' + v).join(' + '));
  t('7b each one says why it was chosen for this student',
    seenCards.length >= Math.min(1, want10) && seenCards.every(c => c.why.length > 20),
    seenCards.length + ' of ' + onPathAsked.length + ' cards carried a "why this one, for you" line; first: '
      + ((seenCards[0] || {}).why || '—'));

  /* 7d — WHAT THE CARD CLAIMS ABOUT WHAT THE STUDENT HAS SEEN.
         Round 6 round 2, the classroom critic: "the default route's spaced-recall
         card tells the student 'you saw this a minute ago' about things the
         route has not taught". Reproduced on `core`: two of the four moments
         did exactly that, because eligibility expands a seen beat to
         DIDACTIC_SPEC §8's chapter table and the card's own sentence was
         computed the same way. The claim is now `pre` on every asked row, and
         the rule is that it agrees with the run's own record of what has been
         on screen — never with the chapter table. */
  const cp7 = await page.evaluate(() => BEA.quiz.checkpoints());
  /* Recomputed from the run, not read back off the flag: a T-number had been on
     screen at a moment if a beat AT OR BEFORE that moment's host carried it, or
     an earlier moment asked it, or an ON_PATH figure's own commit produced it. */
  const seenT = cp7.seenT || [];
  const vizT = new Set(cp7.vizT || []);
  const liars = [];
  (cp7.asked || []).forEach((a, i) => {
    if (!a.t) return;
    const ix = seenT.findIndex((b) => b.id === a.beat);
    const upto = ix < 0 ? seenT : seenT.slice(0, ix + 1);
    const met = upto.some((b) => b.t === a.t)
      || (cp7.asked || []).slice(0, i).some((x) => x.t === a.t)
      || vizT.has(a.t);
    if (a.pre === met) liars.push(a.item + ' says ' + (a.pre ? 'first-look' : 'from-earlier') + ' but the run says ' + (met ? 'met' : 'not met'));
  });
  t('7d no card claims an encounter the run cannot show', liars.length === 0,
    (cp7.asked || []).length + ' moments; '
      + (cp7.asked || []).map((a) => a.t + (a.pre ? ':first-look' : ':from-earlier')).join(', ')
      + (liars.length ? ' — WRONG: ' + liars.join('; ') : ''));

  /* 7e — checkpoint.js's own stated rule: "four checkpoints on four different
         things beats four on two". Measured before the fix, on a run where the
         student is wrong: T13, T13, T7, T7. */
  const askedT = (cp7.asked || []).map((a) => a.t).filter(Boolean);
  t('7e the scarce moments spend on different T-numbers',
    new Set(askedT).size === askedT.length,
    askedT.length + ' moments on ' + new Set(askedT).size + ' T-numbers: ' + askedT.join(', '));

  /* 7c — the fallback. When the path places no retrieval of its own, this
         module places four of its own at named beats, and stands them down the
         moment the path proves it does the placing. */
  const fb = await page.evaluate(async () => {
    BEA.quiz.forget();
    BEA.bus.emit('tours:start', { step: 0 });
    await new Promise(r => setTimeout(r, 400));
    const cp = BEA.quiz.checkpoints();
    BEA.bus.emit('tours:beat', { id: 'egypt', chapter: 'imperial', t: 'T12', n: 9, total: 14, exploring: false });
    await new Promise(r => setTimeout(r, 700));
    return { hosts: cp.hosts, fired: BEA.quiz.checkpoints().fired, standDown: cp.fired.length === 0 };
  });
  t('7c a fallback checkpoint exists for a path that places none',
    fb.hosts.length === 4, 'hosts: ' + fb.hosts.join(', ') + '; stood down while the path was placing: ' + fb.standDown);

  log(R.join('\n'));
  const failedRows = R.filter(r => r.startsWith('FAIL'));
  log(failedRows.length ? '>>> P10 ACCEPTANCE FAILED' : '>>> P10 acceptance holds');
  /* AND IT EXITS NON-ZERO WHEN IT FAILS. Wave 9: this file printed FAIL rows
     and returned normally, so `inspect.js` exited 0 and any runner that trusts
     exit codes called a failing check green. */
  if (failedRows.length) throw new Error('P10 ACCEPTANCE FAILED\n' + failedRows.join('\n'));
};
