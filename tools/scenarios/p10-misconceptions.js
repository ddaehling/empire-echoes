/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p10-misconceptions — DIDACTIC_SPEC §4, audited against the running app.
 *
 * WHAT §4 DEMANDS, and it is emphatic about it: stating a correct fact does not
 * displace a wrong model. The wrong model has to be ACTIVATED (the student
 * commits to it), contradicted by EVIDENCE the student processes themselves,
 * and then REPLACED by a model that explains the same things better. "Build all
 * three or you have built nothing."
 *
 * So this file does not read a manifest and report what the manifest says. It
 * does three separate measurements and prints all three side by side:
 *
 *   1. THE ROUTE. It walks the 24-step guided lesson pressing Next and nothing
 *      else — the student who does the minimum — and records which of the
 *      eighteen that student was actually made to commit on. Round 2's
 *      historian asked for exactly this ("the flagship 24-step route never
 *      presents a sympathetic oversimplification"), and a hand-set `onPath`
 *      flag is not an answer to it.
 *   2. THE TREATMENT. For each of the eighteen it finds the items that carry
 *      it, OPENS each one in the real app, ANSWERS IT WRONG, and prints the
 *      three things the student sees on the glass: the question they had to
 *      commit to, the correction that came back, and the replacement model
 *      underneath it. A misconception whose treatment dropped out of the bank
 *      because the dataset stopped supporting it reports as UNCOVERED here,
 *      which is the point of measuring instead of asserting.
 *   3. THE OTHER SURFACES. It reads tours.json and gates.json by hand — beat
 *      id, gate id, and the sentence each one activates — plus a scan of every
 *      other file under app/js that claims a misconception id. The quiz is not
 *      §4's only owner and §4 does not make it one.
 *
 *   node tools/inspect.js tools/scenarios/p10-misconceptions.js --out /tmp/p10m --w 1366 --h 768
 */
const fs = require('fs');
const path = require('path');

const M18 = Array.from({ length: 18 }, (_, i) => 'M' + (i + 1));
const ROOT = path.resolve(__dirname, '..', '..');

/** Every file under app/js that names a misconception id, and which piece it is. */
function surfaceScan() {
  const hits = new Map(M18.map((m) => [m, new Set()]));
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) { walk(f); continue; }
      if (!/\.(js|json)$/.test(e.name)) continue;
      const rel = path.relative(path.join(ROOT, 'app', 'js'), f);
      const piece = rel.split(path.sep)[0];
      const text = fs.readFileSync(f, 'utf8');
      for (const m of M18) {
        /* Only a real tag counts: a quoted id, or a `misconception: 'M7'`
           field. A prose mention of "M7" in a comment is not a surface. */
        const re = new RegExp('(["\'‘“]' + m + '["\'’”])', 'g');
        if (re.test(text)) hits.get(m).add(piece + '/' + path.basename(f));
      }
    }
  };
  walk(path.join(ROOT, 'app', 'js'));
  return hits;
}

/**
 * The path's own activations, named. Not "tours/tours.json carries M6" but
 * "beat `congress` carries M6, and this is the sentence it commits them to".
 * Read straight off the two files P05 owns; if they are renamed this reports
 * nothing rather than reporting something stale.
 */
function pathActivations() {
  const out = new Map(M18.map((m) => [m, []]));
  const read = (rel) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); } catch (_) { return null; } };
  const tours = read('app/js/tours/tours.json');
  const gates = read('app/js/tours/gates.json');
  const put = (m, s) => { if (out.has(m)) out.get(m).push(s); };
  /* A beat's sentence is `say`, and it carries markup for the shell. */
  const plain = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const short = (s) => { const t = plain(s); return t.length > 96 ? t.slice(0, 95).replace(/\s+\S*$/, '') + '…' : t; };
  for (const b of (tours && tours.beats) || []) {
    if (b.misconception) put(b.misconception, 'beat ' + (b.n != null ? b.n + ' ' : '') + '“' + (b.id || '?') + '” — ' + (short(b.say) || '(no sentence in the record)'));
    for (const k of ['commit', 'prompt', 'dispute', 'recallAfter']) {
      const v = b[k];
      if (v && v.misconception) put(v.misconception, 'beat “' + (b.id || '?') + '” · ' + k + ' — ' + short(v.ask || v.question || v.claim || v.say));
    }
  }
  for (const g of (gates && (gates.gates || gates.items)) || []) {
    if (g.misconception) put(g.misconception, 'complication gate “' + (g.id || '?') + '” — ' + short(g.claim || g.fact || g.title));
  }
  return out;
}

module.exports = async ({ page, shot, log }) => {
  /* ------------------------------------------------------------------ 1 --
     THE ROUTE. Walk it first, on a cleared record, pressing nothing but Next
     and answering whatever the lesson puts on the rail. */
  await page.goto('http://localhost:8777/app/#tour=thirty&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz && window.BEA.quiz.misconceptions, null, { timeout: 25000 });
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    try { BEA.quiz.forget(); } catch (_) {}
    window.__asked = [];
    BEA.bus.on('quiz:asked', (p) => window.__asked.push(p.id));
  });

  for (let i = 0; i < 40; i++) {
    await page.evaluate(async () => {
      if (!document.querySelector('.qz')) return;
      const id = window.__asked[window.__asked.length - 1];
      const item = id ? BEA.quiz.items().find((x) => x.id === id) : null;
      if (!item) return;
      /* Right, not wrong: a student who is getting it right is the harder case
         for this measurement, because band 0 and band 1 of the scheduler stop
         firing and the choice falls to §4's own debt ranking. */
      let said = null;
      if (item.kind === 'choose' || item.kind === 'who') said = item.answer;
      else if (item.kind === 'order' || item.kind === 'match') said = item.answer.slice();
      else if (item.kind === 'estimate') said = item.answer;
      else if (item.kind === 'year') said = typeof item.answer === 'string' ? parseInt(item.answer, 10) : item.answer;
      else if (item.kind === 'explain') said = 'An answer, so the card can be finished.';
      if (said !== null) BEA.quiz.answer(said);
      await new Promise((r) => setTimeout(r, 320));
    });
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
    await page.waitForTimeout(180);
    const more = await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return false;
      b.click(); return true;
    });
    if (!more) break;
    await page.waitForTimeout(380);
  }

  const route = await page.evaluate(() => {
    const items = BEA.quiz.items();
    const tags = (id) => {
      const it = items.find((x) => x.id === id);
      if (!it) return [];
      return [it.misconception, ...(it.alsoMisconceptions || [])].filter(Boolean);
    };
    const met = {};
    for (const id of window.__asked) for (const m of tags(id)) (met[m] = met[m] || []).push(id);
    return { asked: window.__asked.slice(), met };
  });
  await shot('after-the-route');

  /* ------------------------------------------------------------------ 2 --
     THE TREATMENT. Clear the record the walk just wrote, then drive each item
     in turn: open it, answer it WRONG, read the three stages back off the DOM.
     Wrong on purpose — the correction and the replacement model are only
     rendered after a commitment, which is the design and is the thing being
     checked. */
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz && window.BEA.quiz.misconceptions, null, { timeout: 25000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { try { BEA.quiz.forget(); } catch (_) {} });

  const table = await page.evaluate(() => BEA.quiz.misconceptions());
  const bankSize = await page.evaluate(() => BEA.quiz.items().length);
  const dropped = await page.evaluate(() => BEA.quiz.dropped());

  const seen = {};
  for (const row of table) {
    for (const it of row.items) {
      if (seen[it.id]) continue;
      const shown = await page.evaluate(async (id) => {
        const item = BEA.quiz.items().find((x) => x.id === id);
        BEA.quiz.close();
        BEA.quiz.open(id);
        await new Promise((r) => setTimeout(r, 260));
        const q = (document.querySelector('.qz .cx-ask__q') || {}).textContent || '';
        let wrong = null;
        if (item.kind === 'choose' || item.kind === 'who') {
          wrong = (item.options.find((o) => o.id !== item.answer) || {}).id;
        } else if (item.kind === 'order' || item.kind === 'match') {
          wrong = item.answer.slice().reverse();
        } else if (item.kind === 'estimate') {
          wrong = item.min;
        } else if (item.kind === 'year') {
          wrong = 1888;
        } else if (item.kind === 'explain') {
          wrong = 'I am not sure and this is a deliberately empty answer.';
        }
        if (item.kind === 'map') {
          const other = BEA.data.territories.find((t) => !item.targets.includes(t.id));
          BEA.quiz.answer(other ? other.id : 'x');
        } else {
          BEA.quiz.answer(wrong);
        }
        await new Promise((r) => setTimeout(r, 420));
        /* An `explain` item withholds the replacement model until the student
           has checked their own words against the model answer, which is the
           whole design of that kind. Complete the move, or the audit reads a
           card the student has not finished as a card with no replacement. */
        if (item.kind === 'explain') {
          for (const box of document.querySelectorAll('.qz-check input[type=checkbox]')) { box.checked = false; box.dispatchEvent(new Event('change', { bubbles: true })); }
          const done = [...document.querySelectorAll('.qz__ans .qz__commit')].pop();
          if (done) done.click();
          await new Promise((r) => setTimeout(r, 320));
        }
        const txt = (s) => { const n = document.querySelector(s); return n ? n.innerText.replace(/\s+/g, ' ').trim() : ''; };
        return {
          activation: q.replace(/\s+/g, ' ').trim(),
          said: txt('.qz__said'),
          evidence: txt('.qz__truth'),
          replacement: txt('.qz__why'),
          /* P16's renderSource returns its own node, which is not always a
             .cx-src; take whatever citation block the answer actually got. */
          source: txt('.qz__ans .cx-src') || txt('.qz__ans .src') || txt('.qz__ans [class*="src"]'),
          mapWent: BEA.store.getState().year + '/' + (BEA.store.getState().selectedTerritoryId || '—'),
        };
      }, it.id);
      seen[it.id] = shown;
    }
  }
  await page.evaluate(() => BEA.quiz.close());

  /* ------------------------------------------------------------------ 3 --
     THE TABLE. */
  const surfaces = surfaceScan();
  const onPath = pathActivations();
  const R = [];
  const t = (ok, s) => R.push((ok ? 'PASS  ' : 'FAIL  ') + s);
  const cut = (s, n) => (s && s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : (s || ''));

  const lines = [];
  lines.push('');
  lines.push('THE EIGHTEEN — DIDACTIC_SPEC §4, measured in the running app');
  lines.push('activation = what the student had to commit to · evidence = what came back · replacement = the model offered instead');
  lines.push('“met on the route” = a walk of the 24-step lesson pressing nothing but Next actually asked it');
  lines.push('');

  let uncovered = 0, noEvidence = 0, noReplacement = 0, flagWrong = [];
  for (const row of table) {
    const others = [...(surfaces.get(row.id) || [])].filter((f) => !/^quiz\//.test(f));
    const beats = onPath.get(row.id) || [];
    const metBy = route.met[row.id] || [];
    lines.push('─'.repeat(100));
    lines.push(row.id + '  “' + row.belief + '”' + (row.sympathetic ? '   [§4: a SYMPATHETIC oversimplification]' : ''));
    lines.push('     §4 owner: ' + row.owner);
    lines.push('     met on the 24-step route: ' + (metBy.length ? 'YES — ' + metBy.join(', ') : 'no'));
    for (const b of beats) lines.push('     the path also activates it: ' + b);
    lines.push('     elsewhere in the app: ' + (others.length ? others.join(', ') : 'nowhere else tagged'));
    if (!row.items.length) {
      uncovered += 1;
      lines.push('     >>> NO COMMIT-THEN-CORRECT TREATMENT IN THE BANK');
      continue;
    }
    for (const it of row.items) {
      const s = seen[it.id] || {};
      if (!s.evidence) noEvidence += 1;
      if (!s.replacement) noReplacement += 1;
      if (it.onPath !== it.reachable) flagWrong.push(it.id + ' (onPath=' + it.onPath + ', a retrieval moment can host it=' + it.reachable + ')');
      lines.push('  · ' + it.id + '  [' + it.kind + (it.primary ? ', primary' : ', also') + ', ' + (it.t || 'no T')
        + ', ' + (it.reachable ? 'the route can ask it' : 'off the route, min ' + it.minutes) + ']');
      lines.push('      ACTIVATION   ' + cut(s.activation, 190));
      lines.push('      WRONG ANSWER ' + cut(s.said, 120));
      lines.push('      EVIDENCE     ' + cut(s.evidence, 300));
      lines.push('      REPLACEMENT  ' + cut(s.replacement, 300));
      lines.push('      SOURCE       ' + cut(s.source, 190));
      lines.push('      MAP WENT TO  ' + (s.mapWent || '—'));
    }
  }
  lines.push('─'.repeat(100));

  t(uncovered === 0, 'all eighteen have a commit-then-correct treatment  — ' + (18 - uncovered) + '/18 covered');
  t(noEvidence === 0, 'every treatment renders disconfirming evidence after the commit  — ' + noEvidence + ' without');
  t(noReplacement === 0, 'every treatment renders a replacement model  — ' + noReplacement + ' without');
  t(dropped.length === 0, 'no item dropped for want of data  — ' + (dropped.join(', ') || 'none dropped'));
  t(flagWrong.length === 0, 'every bank `onPath` flag matches checkpoint.js’s own predicate  — ' + (flagWrong.join('; ') || 'all agree'));

  /* The four the first pass existed for. */
  for (const m of ['M7', 'M11', 'M12', 'M15']) {
    const row = table.find((r) => r.id === m);
    const prim = row.items.filter((i) => i.primary);
    t(prim.length > 0, m + ' has a treatment of its own (not a side effect of another item)  — '
      + (prim.map((i) => i.id).join(', ') || 'NONE'));
  }
  /* And the one the brief named by hand. */
  const rad = table.find((r) => r.id === 'M18').items.find((i) => i.id === 'm18-radcliffe');
  t(!!rad, 'partition authorship is a commit-then-correct prompt, not only a dispute  — ' + (rad ? rad.id : 'ABSENT'));

  /* ROUND 3, the C7 level-5 requirement: the route itself must put a
     sympathetic oversimplification in front of a student who presses nothing
     but Next. */
  const symp = table.filter((r) => r.sympathetic).map((r) => r.id);
  const sympMet = symp.filter((m) => (route.met[m] || []).length);
  t(symp.length > 0 && sympMet.length === symp.length,
    'the 24-step route makes a Next-only student commit on §4’s sympathetic oversimplification  — '
    + (sympMet.length ? sympMet.map((m) => m + ' via ' + route.met[m].join(', ')).join('; ') : 'NOT MET: ' + symp.join(', ')));

  const metCount = Object.keys(route.met).length;
  lines.push('');
  lines.push('THE ROUTE, WALKED: ' + route.asked.length + ' retrievals — ' + (route.asked.join(', ') || 'none'));
  lines.push('  of the eighteen, a Next-only student was made to commit on ' + metCount + ': '
    + M18.filter((m) => route.met[m]).join(', '));
  lines.push('  never committed on, on that walk: ' + M18.filter((m) => !route.met[m]).join(', '));
  lines.push('  (the route has four retrieval moments and the bank has ' + bankSize + ' items; which four a');
  lines.push('   student gets depends on what they have already produced and which beliefs are still standing.)');

  /* THE ONE-SCREEN VERSION. The long table above is the evidence; this is the
     thing a critic or a head of department actually wants to read: eighteen
     rows, and for each one where the student is made to commit, what comes
     back at them, and what model they are given instead. */
  const w = (s, n) => {
    const t = (s || '—').replace(/\s+/g, ' ').trim();
    return (t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t).padEnd(n);
  };
  const compact = [];
  compact.push('');
  compact.push('§4 COVERAGE, ONE ROW EACH');
  compact.push(w('id', 5) + w('where it is activated', 34) + w('route', 7)
    + w('activation (what they commit to)', 58) + w('disconfirming evidence', 58) + 'replacement model');
  for (const row of table) {
    const prim = row.items.find((i) => i.primary) || row.items[0] || {};
    const sh = seen[prim.id] || {};
    const beats = (onPath.get(row.id) || []).length;
    const where = prim.id + (row.items.length > 1 ? ' +' + (row.items.length - 1) : '')
      + (beats ? ' · ' + beats + ' beat' + (beats > 1 ? 's' : '') + '/gate' : '');
    compact.push(w(row.id, 5) + w(where, 34) + w((route.met[row.id] || []).length ? 'MET' : '·', 7)
      + w(sh.activation, 58) + w(sh.evidence, 58) + w(sh.replacement, 90));
  }
  log(compact.join('\n'));

  log(lines.join('\n'));
  log(R.join('\n'));
  log(R.some((r) => r.startsWith('FAIL')) ? '>>> §4 COVERAGE INCOMPLETE' : '>>> all eighteen misconceptions are activated, contradicted and replaced');
};
