/**
 * teacher/unit.js — THE PACK'S AUTHORED CONTENT, AND THE ONE FILE THAT SAYS
 * WHICH LESSON EACH PIECE OF IT BELONGS TO.
 *
 * ================================ WHY THIS FILE ===========================
 *
 * Wave 9 amended DIDACTIC_SPEC §8: the empire is a TWO-LESSON UNIT. §3 wants
 * fourteen of its twenty must-stick items and §8 wants thirty minutes, and
 * `tours/budget.js` proved by exhaustive search that one period buys seven to
 * nine. So there are two lessons, each a whole thing, and §8.5 makes it a law
 * that every surface naming a route says WHICH LESSON IT IS, WHAT IT COVERS,
 * AND WHAT THE OTHER ONE COVERS. The teacher's pack is named in that list.
 *
 * A pack per lesson means every printed page has to know which lesson it is
 * for, and that is the whole reason this file exists as a file. Two charges
 * from the wave-9 critics, both of the same class:
 *
 *   · the board sheet asked the class to check a fact the route never taught
 *     ("about a thousand British officers of the Indian Civil Service…", whose
 *     only evidence is on the `princely` beat, which the route omitted);
 *   · a printed step 1 asked a population-share question the app's step 1 does
 *     not ask.
 *
 * A teacher cannot run a page that disagrees with the projector. Both defects
 * were repaired in the renderers, and a repair in a renderer is a repair that
 * lasts until the next time somebody edits the data. So the data now states
 * the claim a checker can falsify — every board line, every plan row, every
 * segment and every task carries the LESSON it is printed in and the BEAT that
 * puts its evidence on screen — and `tools/check-pack.js` fails the build when
 * a lesson's route does not run one of its own pack's beats. That is what
 * check-gloss.js does for the record and check-timing.js does for the clock.
 *
 * ============================ WHY IT HAS NO IMPORTS =======================
 *
 * `tools/check-pack.js` has to read this content in Node. check-timing.js
 * loads `tours/budget.js` by inlining its import graph into a data URL, and
 * that works because budget.js's graph is three files deep. `pack.js` reaches
 * timing.js, steps.js, parts.js, util.js and the tours module, and inlining it
 * base64-encodes each subtree once per edge: the URL blows past what Node will
 * parse and `import()` answers "Invalid URL" — measured, before this file was
 * written. So the authored content moved HERE, where there is nothing to
 * inline: NO IMPORTS, NO DOM, NO `window`, NO `this`. Feed it the routes and it
 * answers. `pack.js` and `classroom.js` re-export from it; nothing is copied.
 *
 * ============================= WHAT IT DOES NOT DO ========================
 *
 * It states no minute figure, no step number and no route id. Which route each
 * lesson runs on is DISCOVERED — `bindLessons()` below — from the line-up the
 * guided path publishes, by matching each lesson's authored beats against each
 * published route's actual beats. Nothing here names `period`, `lessonOne` or
 * any other key, because the route line-up belongs to the tours module and has
 * been re-cut in four of the last five waves. A lesson whose route this build
 * does not publish prints as a lesson with no route, in words, and takes no
 * clock — it does not borrow another lesson's.
 */

/* ------------------------------------------------------------------ the unit -- */

/**
 * THE TWO LESSONS, AS DIDACTIC_SPEC §8 CUTS THEM.
 *
 * `beats` is what §8 assigns to that lesson, in route order. It is a claim
 * about the SPEC, not about this build: `bindLessons()` matches it against the
 * routes the guided path actually publishes and every surface prints the route's
 * beats, not these. `anchors` are the beats without which a route is not this
 * lesson at all, and they stop a short "quick look" route being bound to a
 * lesson because it happens to share an opening.
 *
 * `covers` and `other` are §8.5's coverage sentences — items in words, never
 * counts, because "8 of 20" is the sentence §8.4 bans. `throughLine` is the
 * sentence §8 prints under that lesson and §8.4(3) has the student sign; it is
 * a whole sentence on its own and neither lesson is ever shown the other's half
 * greyed out.
 */
export const LESSONS = [
  {
    n: 1, key: 'one', name: 'Lesson One', title: 'How it was taken',
    phases: 'Phases I and II — the Atlantic, and the Company',
    beats: ['poster', 'spine', 'barbados', 'resistance', 'compensation', 'who-took-bengal', 'revenue-loop'],
    anchors: ['poster', 'revenue-loop'],
    covers: 'sugar islands and the crossing that supplied them, the people who never stopped '
      + 'rebelling, the ledger that paid the owners and nothing to the freed, and a London '
      + 'shareholder company that discovered taxing people paid better than trading with them',
    other: 'Lesson Two covers how Britain ruled what it had taken and how it lost it: 1857 and the '
      + 'Crown, the 565 princely states, the Scramble and Berlin 1884–85, who was given self-rule '
      + 'and who was refused, February 1942, how the exits actually happened, and what is still British',
    throughLine: 'Britain’s empire began as sugar islands worked by enslaved Africans, and as a '
      + 'shareholder company that found taxing people paid better than trading with them.',
    /* The extension items §3.1 assigns to this lesson's beats — named in the
       Close, one press away, and named on the pack so a teacher can find them. */
    raises: [
      { say: 'Bengal 1770 — the loop’s first product', at: 'revenue-loop', t: 'T16' },
      { say: 'the African supply side of the crossing', at: 'barbados', t: 'T3' },
    ],
    /* §8's OWN DEMOTION ORDER, in §8's order — see `demotes` on Lesson Two. */
    demotes: [
      { beat: 'who-took-bengal', t: 'T6',
        why: 'DIDACTIC_SPEC §8 permits T6 to demote only if the trim of `resistance` fails, and '
          + 'keeps its reveal — the charter of 1600 — as the opening clause of the loop beat' },
    ],
  },
  {
    n: 2, key: 'two', name: 'Lesson Two', title: 'How it was ruled, and how it ended',
    phases: 'Phases III and IV — the formal empire, and its dissolution',
    beats: ['spine', 'nationalisation', 'princely', 'scramble', 'egypt', 'two-track', 'singapore', 'exits', 'fourteen'],
    anchors: ['fourteen'],
    covers: 'the Crown taking the Company over in 1858, the 565 princely states the single colour '
      + 'hides, Berlin 1884–85 and how Africa was actually taken, self-rule given above the line and '
      + 'refused below it, February 1942, how the exits happened, and what is still British today',
    other: 'Lesson One covers how it was taken: the sugar islands and the crossing, the people who '
      + 'never stopped rebelling, the compensation ledger, and how a shareholder company came to '
      + 'govern twenty to thirty million people',
    throughLine: 'It turned into a global system painted one colour on a map that hid a dozen kinds '
      + 'of rule, and it came apart between 1942 and 1997 because the people it ruled organised, and '
      + 'Britain went broke.',
    raises: [
      { say: 'a thousand ICS officers over three hundred million', at: 'princely', t: 'T10' },
      { say: 'Amritsar, 13 April 1919', at: 'two-track', t: 'T17' },
      { say: 'famine as policy — Bengal 1943', at: 'two-track', t: 'T16' },
    ],
    /* THE DEMOTION ORDER §8 PUBLISHES FOR THIS LESSON, IN §8'S ORDER.
       This is why the field exists. Round two, the rubric scorer and the
       historian both, on `check-pack`'s own warning: "check-pack warns four
       times that Lesson Two's plan row 'One place, four legal labels', segment
       s6 and two tasks name `egypt`, which that lesson's route does not run,
       and explains it as 'The pack is right and the route is behind the amended
       §8.' That is backwards: §8 makes T12 first on the demotion order and the
       route demoted it exactly as published."
       They are right. A route that took a demotion §8 published is a route
       OBEYING the specification, and a warning that calls it "behind" sends a
       builder to un-demote it and overrun the period. So the order is stated
       here — where the checker can read it — and `auditUnit` distinguishes a
       demotion taken in order from a beat nobody planned to lose. */
    demotes: [
      { beat: 'egypt', t: 'T12',
        why: 'DIDACTIC_SPEC §8 makes T12 the FIRST item on Lesson Two’s demotion order: “if it '
          + 'must go, LO2 is still served by T11’s paramountcy, by the status recolour that '
          + 'shatters the single pink across the whole map, and by the dossier’s legal-status '
          + 'field, which fires on every territory a student opens”' },
      { beat: 'two-track', t: 'T15',
        why: 'DIDACTIC_SPEC §8 makes T15 the LAST item on Lesson Two’s demotion order — “and only '
          + 'then T15” — so it goes only after T12 has gone and the period still does not close' },
    ],
  },
];

/**
 * IS THIS BEAT ON ITS LESSON'S PUBLISHED DEMOTION ORDER, and where?
 * `{ i, t, why }` — `i` 0-based, so 0 is the first thing §8 says to lose — or
 * null when §8 names no demotion for it.
 */
export function demotionOf(lesson, beat) {
  const L = lessonNo(lesson);
  const list = (L && L.demotes) || [];
  const i = list.findIndex((d) => d.beat === beat);
  return i < 0 ? null : { i, ...list[i] };
}

/** The unit's own sentence — DIDACTIC_SPEC §2.3 entire. It belongs to the UNIT
 *  and §8.4(3) allows it to be signed only where both lessons are finished, so
 *  no lesson's board sheet ever prints it. */
export const UNIT_SENTENCE =
  'Britain’s empire started as ____________ worked by ____________, became a ____________ that '
  + 'ended up ruling ____________, turned into a global system painted one colour on a map that hid '
  + '____________, and came apart between ______ and ______ because ____________.';

export const UNIT_NAME = 'The British Empire — a two-lesson unit';

/** The lesson with this number, or null. */
export function lessonNo(n) { return LESSONS.find((l) => l.n === Number(n)) || null; }

/** The OTHER lesson of the unit. §8.5: every surface says what it covers. */
export function otherLesson(n) { return LESSONS.find((l) => l.n !== Number(n)) || null; }

/* --------------------------------------------------------- binding a route -- */

const inter = (a, b) => a.filter((x) => b.includes(x));

/**
 * WHICH PUBLISHED ROUTE IS WHICH LESSON — matched, never named.
 *
 * `routes` is the guided path's own published line-up, normalised to
 * `{ id, label, for, fitsPeriod, beats: [beatId] }`. The browser builds it from
 * `tours:routes` plus the checked step index; `tools/check-pack.js` builds the
 * same shape in Node from tours.json and `budget.js`. Nothing else is needed.
 *
 * THE TEST, IN ORDER:
 *   1. A route is a candidate only if it ENDS INSIDE A PERIOD and says in its
 *      own `for` that it is a lesson. `budget.js` computes `fitsPeriod` from
 *      the slow reading rate, and `for` is the authored phrase a teacher
 *      chooses on at 08:55 — "one lesson" is a lesson, "a quick look" is not.
 *   2. A candidate must carry every one of the lesson's ANCHOR beats. This is
 *      what stops the five-beat taster being bound to Lesson One because both
 *      of them open on the poster.
 *   3. Of what is left, the best overlap with that lesson's authored beats
 *      wins, scored as intersection over union, and each route is bound to at
 *      most one lesson. Ties are broken by the longer route, because more of
 *      the lesson is better.
 *
 * A lesson with no candidate is returned with `route: null` and a `why` that
 * says so in words. Every surface prints that sentence instead of a clock.
 */
export function bindLessons(routes) {
  const pool = (routes || []).filter((r) => r && r.id && Array.isArray(r.beats));
  const cand = pool.filter((r) => r.fitsPeriod === true && /\blessons?\b/i.test(String(r.for || '')));
  const pairs = [];
  for (const l of LESSONS) {
    for (const r of cand) {
      if (!l.anchors.every((b) => r.beats.includes(b))) continue;
      const hit = inter(l.beats, r.beats).length;
      const union = new Set([...l.beats, ...r.beats]).size;
      pairs.push({ l, r, score: union ? hit / union : 0, hit });
    }
  }
  pairs.sort((a, b) => b.score - a.score || b.r.beats.length - a.r.beats.length);
  const takenL = new Set(), takenR = new Set();
  const out = new Map();
  for (const p of pairs) {
    if (takenL.has(p.l.n) || takenR.has(p.r.id)) continue;
    takenL.add(p.l.n); takenR.add(p.r.id);
    out.set(p.l.n, {
      lesson: p.l, route: p.r.id, label: p.r.label || p.r.id, beats: p.r.beats,
      score: p.score,
      why: 'the guided path publishes “' + (p.r.label || p.r.id) + '” as a route that runs in one '
        + 'period, and it carries ' + p.hit + ' of ' + p.l.beats.length + ' of the beats '
        + 'DIDACTIC_SPEC §8 assigns to ' + p.l.name,
    });
  }
  return LESSONS.map((l) => out.get(l.n) || {
    lesson: l, route: null, label: '', beats: [], score: 0,
    why: pool.length
      ? 'the guided path in this build publishes no single-period route carrying ' + l.name + '’s '
        + 'beats, so this lesson has no route to time and no page here prints a clock for it'
      : 'the guided path has not published its routes in this build, so no lesson can be timed',
  });
}

/* ------------------------------------------------------------ the contract -- */

/**
 * WHAT A PIECE OF PACK CONTENT PROMISES, AND WHAT tools/check-pack.js FALSIFIES.
 *
 *   `lesson`  1 or 2 — which lesson's pages print it. 0 means EXTENSION: it
 *             belongs to the unit but to neither lesson's taught route.
 *   `beat`    the tours beat id that puts its evidence on screen.
 *   `off`     true on a piece deliberately worked from a beat the lesson does
 *             NOT run — the Ink sheet's "one case from off this map". It is
 *             printed under the extension label and it is the only way a
 *             lesson's sheet may name an off-route beat.
 *
 * THE RULES, applied by `auditUnit()` and by `tools/check-pack.js`:
 *   A  a piece with `lesson: N` and no `off` — the route bound to N MUST run
 *      its beat. This is the board line that asked a class to check a fact the
 *      route never taught.
 *   B  a piece with `off: true` — the route bound to its lesson must NOT run
 *      its beat, or the extension label is a lie.
 *   C  a piece with `lesson: 0` — no lesson's route may run its beat.
 *   D  every beat id must exist in tours.json.
 *   E  a plan row whose beat asks the class a question ON SCREEN may not carry
 *      a typed question of its own. This is the printed step 1 asking for a
 *      population share the app's step 1 never asks.
 *   F  every required beat on a lesson's route must be named by a segment of
 *      that lesson's plan — a stop with no script is a cover teacher stranded.
 */
export function auditUnit(bound, beatsById, list) {
  const all = Array.isArray(list) ? list : pieces();
  const find = [];
  const say = (severity, code, where, message, hint) =>
    find.push({ severity, code, where, message, hint: hint || '' });
  const byLesson = new Map(bound.map((b) => [b.lesson.n, b]));
  const runs = (n, beat) => {
    const b = byLesson.get(n);
    return b && b.route ? b.beats.includes(beat) : null;
  };
  const anyRuns = (beat) => bound.some((b) => b.route && b.beats.includes(beat));

  for (const p of all) {
    const rec = beatsById ? beatsById.get(p.beat) : true;
    if (!rec) {
      say('error', 'pack/unknown-beat', p.where,
        'names the beat “' + p.beat + '”, and the guided path has no beat with that id',
        'Beat ids are tours.json’s own. A typo here prints a page number for a page that is not there.');
      continue;
    }
    if (p.lesson === 0) {
      if (anyRuns(p.beat)) {
        say('error', 'pack/extension-is-taught', p.where,
          'is filed as extension, and a lesson route in this build teaches “' + p.beat + '”',
          'Extension that the lesson teaches is not extension. Give it a lesson number.');
      }
      continue;
    }
    const on = runs(p.lesson, p.beat);
    if (on === null) continue;              /* the lesson has no route; reported once, below */
    if (p.off && on === true) {
      say('error', 'pack/marked-off-but-taught', p.where,
        'is printed as extension — a case from off this lesson — and Lesson ' + p.lesson
        + '’s route does run “' + p.beat + '”',
        'Drop the `off` flag: this is on the lesson, and marking it extension tells a class it is optional.');
    } else if (!p.off && on === false) {
      /* THREE DIFFERENT SITUATIONS, AND ONLY ONE OF THEM IS A FAULT.
         · §8 assigns the beat to this lesson AND names it on the lesson's
           demotion order, and the route took the demotion: the route is
           OBEYING §8, the pack prints the piece under the extension label, and
           nothing anywhere is behind. A note, and it says so — see `demotes`.
         · §8 assigns the beat to this lesson and names no demotion for it: the
           route is short of §8 and the pack is right. A note.
         · §8 assigns it elsewhere — or nowhere — and the pack is printing
           another lesson's material on this lesson's sheet. That is the wave-9
           board line in one sentence, and it is an error. */
      const mine = (lessonNo(p.lesson) || { beats: [] }).beats.includes(p.beat);
      const dem = mine ? demotionOf(p.lesson, p.beat) : null;
      if (dem) {
        say('warn', 'pack/beat-demoted', p.where,
          'names “' + p.beat + '” (' + dem.t + '), which DIDACTIC_SPEC §8 puts at position '
          + (dem.i + 1) + ' on Lesson ' + p.lesson + '’s demotion order and this build’s route has '
          + 'demoted, so this piece prints under the extension label',
          'THE ROUTE IS RIGHT AND SO IS THE PACK — do not “fix” this by putting the beat back on '
          + 'the route, which would overrun the period. ' + dem.why + '.');
      } else if (mine) {
        say('warn', 'pack/beat-not-yet-on-route', p.where,
          'DIDACTIC_SPEC §8 assigns “' + p.beat + '” to Lesson ' + p.lesson + ', names no demotion '
          + 'for it, and the route bound to that lesson does not run it, so this piece prints under '
          + 'the extension label',
          'The pack is right and the route is short of §8. Either the route gains the beat or §8 '
          + 'gains a demotion entry for it; nothing here prints as a finding the class has checked.');
      } else {
        say('error', 'pack/off-route', p.where,
          'is printed as part of Lesson ' + p.lesson + ' and that lesson’s route does not run “'
          + p.beat + '” — the beat that puts its evidence on screen, which DIDACTIC_SPEC §8 does '
          + 'not assign to this lesson either',
          'A teacher cannot run a page that disagrees with the projector. Move it to the lesson '
          + 'whose route runs it, mark it `off: true` so it prints as extension, or delete it.');
      }
    }
    if (p.kind === 'plan' && p.typedAsk && rec && rec.panel
      && (rec.panel.question || rec.panel.input)) {
      say('error', 'pack/ask-not-the-beats', p.where,
        'prints its own question beside a beat that puts a question on screen — the class is being '
        + 'asked “' + String(p.typedAsk).slice(0, 70) + '…” while the projector asks something else',
        'Delete the typed question. `classroom.js::lessonAsk()` prints the beat’s own.');
    }
  }

  for (const b of bound) {
    if (!b.route) {
      say('warn', 'pack/lesson-unbound', b.lesson.name,
        b.why, 'The pack prints this lesson with no clock and says so. Not a defect in the pack.');
      continue;
    }
    const scripted = new Set(all
      .filter((p) => p.kind === 'segment' && (p.lesson === b.lesson.n || p.segLesson === b.lesson.n))
      .map((p) => p.beat));
    for (const id of b.beats) {
      const rec = beatsById ? beatsById.get(id) : null;
      if (rec && rec.optional) continue;
      if (scripted.has(id)) continue;
      /* Same split as above. A beat this build's route runs that §8 gives to
         the OTHER lesson is the route lagging the amendment, and the pack says
         so on the page rather than inventing a script for it. A beat §8 gives
         to nobody is a stop with nothing to say at it, and that strands a cover
         teacher. */
      const other = LESSONS.find((l) => l.n !== b.lesson.n && l.beats.includes(id));
      if (other) {
        say('warn', 'pack/beat-from-other-lesson', b.lesson.name,
          'the route runs “' + id + '”, which DIDACTIC_SPEC §8 assigns to ' + other.name
          + ', so this lesson’s plan has a stop its own script does not cover',
          'The pack prints ' + other.name + '’s script for it and says which lesson it belongs to. '
          + 'It goes away when the guided path publishes the two lesson routes.');
      } else {
        say('error', 'pack/unscripted-beat', b.lesson.name,
          'the route runs “' + id + '” and no segment of either lesson’s plan names it, so the plan '
          + 'has a stop with nothing to say at it',
          'Add the beat to a segment in SEGMENTS, or the cover teacher meets it cold.');
      }
    }

    /* RULE G — THE DEMOTION ORDER IS AN ORDER.
       §8 publishes, per lesson, the order in which items go when the period
       does not close, and says "stop as soon as it closes". A route that has
       dropped the second item while the first is still on it has not taken
       §8's cut; it has taken a different one, and every printed page that
       explains the loss by quoting §8 is then explaining something that did not
       happen. Cheap to check, and there is no other check in this repository
       that reads the order at all. */
    const order = b.lesson.demotes || [];
    for (let i = 1; i < order.length; i++) {
      if (b.beats.includes(order[i].beat)) continue;          /* still on the route */
      const earlier = order.slice(0, i).filter((d) => b.beats.includes(d.beat));
      if (!earlier.length) continue;
      say('error', 'pack/demotion-out-of-order', b.lesson.name,
        'the route has demoted “' + order[i].beat + '” (' + order[i].t + ', position ' + (i + 1)
        + ' on DIDACTIC_SPEC §8’s demotion order for this lesson) while still running '
        + earlier.map((d) => '“' + d.beat + '” (' + d.t + ')').join(' and ')
        + ', which §8 puts ahead of it',
        '§8’s order is “close it in this order, and stop as soon as it closes”. Demote the earlier '
        + 'item first, or amend §8 in writing. Until then every page explaining the loss quotes a '
        + 'reason that is not the one that applied.');
    }
  }

  /* RULE H — THE TASK NUMBER ON THE PLAN IS THE TASK NUMBER ON THE SHEET.
     The plan says "They write. Task N", the key heads a segment "Task N", and
     a student's sheet prints "Task N" from the task's own `n`. Round two, the
     classroom critic: "Task 3 on the Lesson One core sheet prints 'screen: 2/9'
     for a beat the plan itself lists at step 3, and shares that anchor with
     Task 2 — on a sheet whose own rubric says a mismatch means 'you are on the
     wrong task'." The anchor was one half; the number was the other. A segment
     hosting two tasks made a segment INDEX diverge from a task NUMBER four
     segments running, so the plan pointed a class at the wrong sheet.
     Read off the PIECES, so the rule is replayable. */
  const segsSeen = new Map();     /* lesson|seg -> title */
  for (const p of all) {
    if (p.kind !== 'segment' || !p.seg) continue;
    segsSeen.set((p.segLesson || p.lesson) + '|' + p.seg, p.title || p.seg);
  }
  for (const [k, title] of segsSeen) {
    const [ln, sid] = k.split('|');
    const mine = all.filter((p) => p.kind === 'task' && String(p.lesson) === ln && p.seg === sid);
    const where = 'Lesson ' + ln + ' · segment ' + sid + ' “' + title + '”';
    if (!mine.length) {
      say('error', 'pack/segment-has-no-task', where,
        'no task on any tier of this lesson is set on this segment, and the plan’s “They write” '
        + 'line promises one at every segment',
        'Give the segment a task, or stop the plan promising one.');
      continue;
    }
    const per = new Map();
    for (const t of mine) per.set(t.tier, [...(per.get(t.tier) || []), t.n].sort((a, b) => a - b).join(','));
    if (new Set(per.values()).size > 1 || per.size < 3) {
      say('warn', 'pack/task-number-varies', where,
        'the three tiers do not set the same task numbers here — '
        + [...per].map(([t, v]) => t + ' ' + v).join(' · ')
        + (per.size < 3 ? ' (and no task at all on the others)' : ''),
        'Not a defect as long as the page says so: `sheets.js::taskCall` names the numbers per '
        + 'tier at a segment like this rather than printing “all three versions, same number”, '
        + 'which would be false. This note is here so nobody restores that sentence.');
    }
  }
  return find;
}

/** Every addressable piece of authored pack content, flattened, for the audit
 *  and for the checker. One shape: where it prints, which lesson, which beat. */
export function pieces() {
  const out = [];
  for (const l of LESSONS) {
    const b = BOARDS[l.n] || { hold: [] };
    (b.hold || []).forEach((h, i) => out.push({
      kind: 'board', where: l.name + ' · board line ' + (i + 1) + ' (“' + h.lead + '”)',
      lesson: l.n, beat: h.beat, off: !!h.off,
    }));
  }
  PLAN.forEach((r) => out.push({
    kind: 'plan', where: 'Lesson ' + r.lesson + ' · plan row “' + r.title + '”',
    lesson: r.lesson, beat: r.beat, off: !!r.off, typedAsk: r.ask || '',
  }));
  SEGMENTS.forEach((s) => s.beats.forEach((b) => out.push({
    kind: 'segment', where: 'segment ' + s.id + ' “' + s.title + '” · beat ' + b.id,
    lesson: b.optional ? 0 : s.lesson, segLesson: s.lesson, beat: b.id, off: !!b.off,
    /* `seg` and `title` are here so rule H can be run against a REPLAYED set of
       pieces rather than against this module's own constants — which is what
       makes it testable by `check-pack --selftest`. A rule that can only be
       run on the real content cannot be shown to catch anything. */
    seg: s.id, title: s.title,
  })));
  TASKS.forEach((t) => out.push({
    kind: 'task', where: 'task ' + t.n + ' · ' + t.tier + ' (' + t.seg + ')',
    lesson: t.lesson, beat: t.beat, off: !!t.off,
    n: t.n, tier: t.tier, seg: t.seg,
  }));
  return out;
}


/* ---------------------------------------------------------------- the board -- */

/**
 * WHAT GOES ON THE BOARD, PER LESSON.
 *
 * Each lesson has its own question, its own three held findings, and its own
 * through-line sentence with the blanks in it. §8.4(3): a lesson signs its own
 * sentence and never §2.3 entire with the other half greyed out; that sentence
 * is `UNIT_SENTENCE` and only the unit Close may offer it.
 *
 * EVERY HELD LINE NAMES THE BEAT THAT CARRIES ITS EVIDENCE. That is the wave-9
 * charge in one field: a line whose beat this lesson's route does not run is a
 * line asking a class to check a fact they were never shown, and
 * `tools/check-pack.js` rule A now fails the build for it rather than a critic
 * finding it in the printed sheet.
 *
 * `text` may be a function of the dataset where the quantity is counted rather
 * than typed — see `parts.js::kindsOfRuleChecked`.
 */
export const BOARDS = {
  1: {
    question: 'Britain did not build one empire. It built four, overlapping, each with a different '
      + 'engine. Two of them are in this lesson: what were they, and what made each one grow?',
    hold: [
      {
        lead: 'One map, many kinds of rule.',
        beat: 'poster',
        /* THE QUANTITY IS COUNTED, NOT TYPED. `{{kindsChecked}}` is resolved
           by `pack.js::keyText()` from the dataset, with the year it was
           counted at, so the board and the poster beat cannot disagree. */
        text: 'The single pink of the old atlases covers {{kindsChecked}}. Colour on our map means '
          + 'status, and the ribbon under it names each one.',
      },
      {
        lead: 'Taken slowly, lost quickly.',
        beat: 'spine',
        text: 'Half of this empire was taken over 123 years. Half of it went in 28.',
      },
      {
        lead: 'Somebody was paid, and it was not the people freed.',
        beat: 'compensation',
        text: '£20,000,000 went to the owners in 1834 — and £0 to the people they had owned. '
          + 'The loan raised to pay it was not finished until 2015.',
      },
    ],
    sentence: 'Britain’s empire began as ____________ worked by ____________, and as a '
      + '____________ that found ____________ paid better than ____________.',
  },
  2: {
    question: 'By 1921 Britain ruled a quarter of the world’s people, through a dozen different '
      + 'kinds of law, and thirty years later almost none of it. How was it held, and what broke it?',
    hold: [
      {
        lead: 'It was run by the people it ruled.',
        beat: 'princely',
        text: 'About a thousand British officers of the Indian Civil Service governed 300 million '
          + 'people, through Indian clerks, police, revenue collectors and soldiers.',
      },
      {
        lead: 'The rulebook was written where nobody affected was in the room.',
        beat: 'scramble',
        text: 'Berlin, November 1884 to February 1885: fourteen states wrote the rules for '
          + 'partitioning Africa. No African state was represented.',
      },
      {
        lead: 'It was biggest after it started losing.',
        beat: 'exits',
        text: 'The empire reached its greatest extent after 1918, not in 1914 — and it was gone '
          + 'inside another forty years.',
      },
    ],
    sentence: 'It turned into a global system painted ____________ on a map that hid '
      + '____________, and it came apart between ______ and ______ because ____________ '
      + 'and because ____________.',
  },
};

/** The board for one lesson. */
export function boardOf(n) { return BOARDS[Number(n)] || null; }

/* ----------------------------------------------------------------- the plan -- */

/**
 * ONE ROW PER BEAT, PER LESSON — the lesson as one page for the desk.
 *
 * `ask` IS NOT THE LAST WORD ON WHAT THE LESSON ASKS, and on a beat that puts
 * its own question on screen it may not exist at all. Wave 9, the phone critic:
 * "the step-1 row hard-codes `do:` and `ask:` for a population-share question
 * the app's step 1 does not ask… Do not leave a printed page telling a teacher
 * to ask something the projector is not asking." `classroom.js::lessonAsk()`
 * prints the BEAT's own question wherever the beat has one; a typed `ask` here
 * beside such a beat is dead copy waiting to drift, so rule E of
 * `tools/check-pack.js` fails the build for one.
 *
 * `spine` has a row in both lessons and they are different rows: in Lesson One
 * it is the sweep that introduces the four engines, in Lesson Two it is a
 * forty-second re-entry for a class that did Lesson One last week.
 */
export const PLAN = [
  /* ---------------------------------------------------------- Lesson One -- */
  { lesson: 1, beat: 'poster', title: 'Commit to a wrong answer first',
    do: 'Show 1921 with the poster’s one colour and nothing else on screen. Do not name any '
      + 'territory. Take three guesses out loud at the question on the card and write them up. Do '
      + 'not confirm any of them; press Next only when three students have committed a number.',
    link: '#year=1921' },
  { lesson: 1, beat: 'spine', title: 'The four engines',
    do: 'Scrub 1600 to 1997 and let the phase band do the talking. Stop at 1820 and point out that '
      + 'three engines are running at once. Name each engine in one clause. The map redraws once in '
      + 'equal-area: say out loud that the shape changed and the land did not.',
    ask: 'Why do the four bands overlap instead of following one another?',
    link: '#year=1820' },
  { lesson: 1, beat: 'barbados', title: 'Three islands, three crops — and the crossing',
    do: 'Run Chesapeake → Barbados → Jamaica with the sugar curve climbing beside it. Then stop on '
      + 'the flow map and make the class read the gap: arrow width is the number, and the space '
      + 'between embarked and disembarked is people who died on the crossing.',
    ask: 'The two arrows are different widths. What is the difference?',
    link: '#year=1660&sel=barbados' },
  { lesson: 1, beat: 'resistance', title: 'They never stopped',
    do: 'Open Jamaica at 1831 — the Baptist War. Put Tacky 1760, Haiti 1791, Barbados 1816, '
      + 'Demerara 1823 and Sam Sharpe 1831–32 on the axis, and leave abolition off it until '
      + 'somebody asks where it goes.',
    ask: 'The rebellion is 1831 and the Act is 1833. Does the order change your explanation?',
    link: '#year=1831&sel=jamaica' },
  { lesson: 1, beat: 'compensation', title: 'Who was paid',
    do: 'Put the two figures side by side and say nothing for five seconds: £20,000,000 to the '
      + 'owners, £0 to the people freed. Then 1807, 1833, 1838 and 2015 on one axis, in that order.',
    ask: 'Twenty million pounds was paid, and none of it to the people freed. What does that tell '
      + 'you about what Parliament thought it was ending?',
    link: '#year=1834&sel=jamaica' },
  { lesson: 1, beat: 'who-took-bengal', title: 'Who conquered Bengal?',
    do: 'Four options on screen. Take a show of hands for each before you press anything — the '
      + 'wrong answers are the lesson. Then the reveal: a charter, 31 December 1600.',
    link: '#year=1757&sel=bengal-presidency' },
  { lesson: 1, beat: 'revenue-loop', title: 'A company that became a government',
    do: 'Open Bengal at 1765. Read the acquisition line aloud — the Diwani, the right to tax perhaps '
      + '20 to 30 million people — then step the loop one box at a time: revenue, sepoys, conquest, '
      + 'more revenue. Press the cut and stop talking until somebody names what stalls.',
    ask: 'What would have broken this loop, and when?',
    link: '#year=1765&sel=bengal-presidency' },

  /* ---------------------------------------------------------- Lesson Two -- */
  { lesson: 2, beat: 'spine', title: 'Where we got to',
    do: 'Forty seconds, not the full sweep. The four-colour band, and one sentence: a London '
      + 'shareholder company is now the government of Bengal. Name the third thing the poster map '
      + 'hides — the single colour — as this lesson’s business.',
    ask: 'Last lesson ended with a company collecting a country’s taxes. Who stops that, and how?',
    link: '#year=1820' },
  { lesson: 2, beat: 'nationalisation', title: 'The Crown takes the company over',
    do: 'Press 1857, then 1859, and let the class watch the India polygon change ownership colour. '
      + 'Name the instrument on the card out loud: the Government of India Act, 1858. Then 1876 and '
      + 'the title Empress of India.',
    ask: 'The Company is abolished. What actually changed for a cultivator in Bihar?',
    link: '#year=1858&sel=british-india' },
  { lesson: 2, beat: 'princely', title: 'British India was never all of India',
    do: 'Toggle “show princely states” on and off twice and let them watch direct rule shrink. Say '
      + 'the number: 565. Then read the Indian Civil Service ratio off the card and write it on the '
      + 'board — it is the second held line.',
    ask: 'If Britain did not govern these places, in what sense did it rule them?',
    link: '#year=1909&sel=hyderabad' },
  { lesson: 2, beat: 'scramble', title: 'How Britain took Africa',
    do: 'Play 1870 → 1914 across the map without commentary. Then Berlin, November 1884 to February '
      + '1885, and the two texts side by side — what the chief was told, and what the English '
      + 'version said. Finish on the counter-line: Isandlwana 1879, four Asante wars, Adwa 1896.',
    ask: 'Berlin wrote the rules. Who actually took the land, and how?',
    link: '#year=1885' },
  { lesson: 2, beat: 'egypt', title: 'One place, four legal labels',
    do: 'Step Egypt through 1882, 1914, 1922 and 1936 and read the legal label off the screen each '
      + 'time. Stop at 1922 and ask what changed on the ground. The answer is: the label.',
    ask: 'Was Egypt part of the British Empire in 1890? What does your answer depend on?',
    link: '#year=1882&sel=egypt' },
  { lesson: 2, beat: 'two-track', title: 'Given, and refused',
    do: 'Self-rule above the line — Durham 1839, Canada 1867, Australia 1901, New Zealand 1907, '
      + 'South Africa 1910, Westminster 1931 — and refused below it, in the same years. Do not '
      + 'summarise the criterion. Make the class say what the two rows have in common.',
    link: '#year=1913' },
  { lesson: 2, beat: 'singapore', title: 'February 1942',
    do: 'Open Singapore at 1942. Read the troop figures off the card and make the class copy them '
      + 'down with what each one counts. Then Quit India, that August, in the card’s own order.',
    ask: 'Who fought the wars that broke the empire, and who paid for them?',
    link: '#year=1942&sel=singapore' },
  { lesson: 2, beat: 'exits', title: 'How they left, and when it was biggest',
    do: 'Run the “who” ribbon first — a face, a name, one sentence. Then colour the exits by HOW '
      + 'they happened and let the class see the map is not the colour they guessed. Take the peak '
      + 'guess before you show it: it is to the right of 1914.',
    link: '#year=1947&sel=punjab-province' },
  { lesson: 2, beat: 'fourteen', title: 'It is not finished',
    do: 'Go to the last year on the scrubber. Fourteen dots. What is still administered from '
      + 'London, what is still disputed, and who settled the most recent one.',
    ask: 'Write the through-line sentence from the board in your own words.',
    /* NOT A YEAR FROM THE CLOCK. `@last` is filled in from the dataset's own
       last recorded change — see `lastRecordedChange` in parts.js. */
    link: '#year=@last' },
];

/** The plan rows for one lesson, in route order where the route is known. */
export function planOf(n) { return PLAN.filter((r) => r.lesson === Number(n)); }


/* ------------------------------------------------------------- the segments -- */

/**
 * THE NINE SEGMENTS — four in Lesson One, five in Lesson Two.
 *
 * `lesson` is which lesson's plan prints this segment, and it is the field
 * `tools/check-pack.js` falsifies: every non-optional beat listed here must be
 * on that lesson's own route, and every non-optional beat on that route must be
 * named by one of these segments. A segment used to straddle the two — "A
 * company that became a government" carried the Bengal loop AND the 1857
 * takeover, which are now the ending of one lesson and the beginning of the
 * next — so it is cut in two, and the takeover gets the beginning it is owed.
 *
 * `beats` are tours beat ids and nothing else: whether the lesson route runs a
 * beat is asked of the checked step index at the moment a sheet is drawn, never
 * asserted here. `board` names which held line of that lesson's board framing
 * this segment is the moment to write up.
 */
export const SEGMENTS = [
  /* =============================================== LESSON ONE ============== */
  {
    id: 's1', lesson: 1, board: 1,
    title: 'The poster that lies',
    t: ['T1'], lo: ['LO4'], m: ['M4'],
    beats: [{ id: 'poster', head: 'One colour, or more?' }],
    link: '#year=1921&layer=status',
    open: 'Open the link before the class comes in. The map is 1921, one colour, on Mercator.',
    say: [
      '“This map hung on classroom walls for seventy years. It is not a description of the world. It is an argument about it, printed in ink.”',
      '“Do not tell me what it shows. Write down what you think it hides.”',
      '“Three things about this map mislead. Two of them are this lesson. The third is next lesson.”',
    ],
    do: [
      'Show the map with nothing else on screen. Do not name any territory.',
      'Take three guesses out loud at the beat’s question. Do not confirm or deny any of them.',
      'Press Next only when at least three students have committed a number.',
    ],
    watch: 'Nobody comes near the real number unaided. Take the guesses without grading them, and let the silence sit for five seconds before you press Next.',
    ifShort: 'Cut nothing. This opening is what every later segment is spending.',
  },
  {
    id: 's2', lesson: 1, board: 2,
    title: 'Four engines, and the first one',
    t: ['T1', 'T2', 'T3'], lo: ['LO1', 'LO5'],
    beats: [
      { id: 'spine', head: 'Four engines, not one line' },
      { id: 'barbados', head: 'Three islands, three crops' },
    ],
    link: '#year=1820',
    open: 'The sweep runs 1600 → 1997 in about thirty seconds. Let it finish without talking over it.',
    say: [
      '“Four empires, not one. Each had a different engine — the thing that actually made it grow.”',
      '“Stop. It is 1820 and three of the four are running at the same time. Nobody planned this.”',
      '“The map just redrew itself in equal-area. The shapes changed. The land did not. That is the first of the three misleads.”',
      '“Arrow width is the number of people. Now look at the gap between the two arrows.”',
    ],
    do: [
      'Play the sweep once without commentary.',
      'Scrub back to 1820 and hold it there while they fill in the table.',
      'Name each engine in one clause: sugar and slavery · a company that found land tax · industry, steam and the route to India · bankruptcy and organised opposition.',
      'On the crossing chart, make them read the gap before you name it.',
    ],
    ask: 'Why do the four bands overlap instead of following one another?',
    watch: 'Students want a relay race. If someone says “then it became…”, ask them which year the handover happened. There isn’t one.',
    ifShort: 'Play the sweep, name the four engines, and set the table for homework. Do not cut the crossing.',
  },
  {
    id: 's3', lesson: 1, board: 3,
    title: 'Who resisted, and who was paid',
    t: ['T4', 'T5'], lo: ['LO5'], m: ['M8'],
    beats: [
      { id: 'resistance', head: 'A woman’s book and a man’s gallows' },
      { id: 'compensation', head: 'Put these in order' },
    ],
    link: '#year=1831&sel=jamaica',
    open: 'Jamaica, 1831 — the Baptist War. The compensation beat follows it, at 1838.',
    say: [
      '“Mary Prince published her life in London in 1831. Sam Sharpe was hanged in Montego Bay in 1832. Both of them are evidence. They are not evidence of the same thing.”',
      '“When slavery ended, twenty million pounds was paid out. Write down who you think received it.”',
    ],
    do: [
      'Put the rebellion and the Act on the board in that order — 1831, then 1833 — and leave the order visible.',
      'Run the ordering task on screen with the class before they write it down.',
      'Say the apprenticeship years out loud: freedom in 1834 was not freedom until 1838.',
    ],
    ask: 'The rebellion is 1831 and the Act is 1833. Does the order change your explanation?',
    watch: 'The class will assume Parliament freed people and rebellion followed. The dates are the other way round and they are on screen.',
    ifShort: 'Keep the ordering task. Drop the two-source comparison to the extension sheet.',
  },
  {
    id: 's4', lesson: 1,
    title: 'A company that became a government',
    t: ['T6', 'T7', 'T8'], lo: ['LO3'], m: ['M2'],
    beats: [
      { id: 'who-took-bengal', head: 'Who conquered Bengal?' },
      { id: 'revenue-loop', head: 'revenue → sepoys → conquest → revenue' },
    ],
    link: '#year=1765&sel=bengal-presidency',
    open: 'The one thing to protect if the period runs short, and the ending of this lesson’s argument.',
    say: [
      '“On 12 August 1765 a London shareholder company was granted the right to collect the land tax of Bengal, Bihar and Orissa. Not a king. A company.”',
      '“Now watch what that money buys.” — step the loop one box at a time and say each box out loud.',
      '“Cut Bengal’s revenue.” — press the cut and let them see where it stalls before you explain it.',
    ],
    do: [
      'Take the four-way guess first. The wrong answers are the teaching; do not shorten them.',
      'Step the loop forward one box at a time. Do not skip to the end.',
      'Press the cut control and stop talking until somebody in the room names what stops.',
      'Draw the same four boxes on the board while they draw them on the sheet.',
    ],
    ask: 'What would have broken this loop, and when?',
    watch: 'Almost everyone assumes the army was British. It was overwhelmingly Indian and paid out of Indian land tax. That is the whole argument.',
    ifShort: 'Protect this. Take the time out of segment 2, not out of this one.',
  },

  /* =============================================== LESSON TWO ============== */
  {
    id: 's5', lesson: 2, board: 1,
    /* THE HINGE, AND WHY IT IS A BEGINNING RATHER THAN A CONTINUATION.
       DIDACTIC_SPEC §3.1: "It is the hinge, and a hinge belongs to the door it
       opens." A class arriving here a week after Lesson One needs its first
       three minutes to be about the machine they built, and then about the
       state taking it away from the people who built it. */
    title: 'The Crown takes the company over',
    t: ['T9', 'T11'], lo: ['LO2'], m: ['M2', 'M9'],
    beats: [
      { id: 'spine', head: 'Where we got to' },
      { id: 'nationalisation', head: 'Press 1857, then 1859' },
      { id: 'princely', head: 'Press 2, then 1 again' },
    ],
    link: '#year=1858&sel=british-india',
    open: 'Forty seconds of re-entry, then the hinge. A class that missed Lesson One is offered it in one press and is not blocked.',
    say: [
      '“Last lesson ended with a shareholder company collecting the taxes of twenty to thirty million people. This lesson is what happened to that.”',
      '“1857. A rebellion across northern India, and the answer to it is an Act of Parliament: the Government of India Act, 1858. The Company is abolished.”',
      '“Now press the princely toggle. Everything that just vanished was ruled by an Indian prince under British paramountcy. Five hundred and sixty-five of them.”',
    ],
    do: [
      'Play the four-colour band for forty seconds only. Do not re-run the whole sweep.',
      'Press 1857 and then 1859 and let them watch the India polygon change ownership colour.',
      'Read the instrument off the card by name. Then 1876 and the title Empress of India.',
      'Toggle “show princely states” twice. Write the Indian Civil Service ratio on the board.',
    ],
    ask: 'The Company is abolished. What actually changed for a cultivator in Bihar?',
    watch: 'Classes hear “the Crown took over” as a moral improvement. Ask what changed in the revenue system. The answer is: the letterhead.',
    ifShort: 'Keep 1858 and the princely toggle. The 1876 title can go.',
  },
  {
    id: 's6', lesson: 2, board: 2,
    title: 'How Britain took Africa, and what it called it',
    t: ['T13', 'T12'], lo: ['LO2', 'LO4'], m: ['M10', 'M6'],
    beats: [
      { id: 'scramble', head: 'Four lines you write first' },
      { id: 'egypt', head: 'One place, four labels' },
    ],
    link: '#year=1885',
    open: 'The Scramble is required and cannot be cut (DIDACTIC_SPEC §3.1). Egypt is the first thing to go if the period is short.',
    say: [
      '“Between 1870 and 1914 almost the whole continent was claimed. Watch it happen and count how many years it takes.”',
      '“Berlin, November 1884 to February 1885. Fourteen states wrote the rules. No African state was in the room.”',
      '“Here is what the chief was told, and here is what the English version said. They are not the same document.”',
      '“Berlin wrote a rulebook. The land was taken on the ground, with guns, against people who fought back — and sometimes won.”',
      '“Britain invaded Egypt in 1882 for a canal and for the people who held Egypt’s debt. It stayed seventy-four years and never annexed it.”',
    ],
    do: [
      'Play 1870 → 1914 across the map without commentary. Let them count the years.',
      'Put the two treaty texts side by side and read both aloud.',
      'Say Isandlwana 1879, the four Asante wars and Adwa 1896 out loud before anybody concludes it was easy.',
      'Step Egypt through 1882, 1914, 1922 and 1936 and read the legal label off the screen each time.',
    ],
    ask: 'Berlin wrote the rules. Who actually took the land, and how?',
    watch: 'The word “scramble” makes it sound like a rush for empty ground. Ask who was living there. Every answer to that is on the map.',
    ifShort: 'Drop Egypt’s middle two labels — 1882 and 1922 make the point. Do not drop Berlin.',
  },
  {
    id: 's7', lesson: 2,
    title: 'Given, and refused',
    t: ['T15'], lo: ['LO2', 'LO7'], m: ['M6'],
    beats: [{ id: 'two-track', head: 'Which of these had an elected legislature in 1913?' }],
    link: '#year=1913',
    open: 'One frame, two rows, the same years. The asymmetry is the lesson and it is not summarised for them.',
    say: [
      '“Above the line: Durham 1839, Canada 1867, Australia 1901, New Zealand 1907, South Africa 1910, Westminster 1931.”',
      '“Below the line, in the same years, the same request is refused. Do not tell me why yet. Tell me what the two rows have in common.”',
    ],
    do: [
      'Run the sorting question on screen before anybody writes.',
      'Wait for the class to name the criterion themselves. Do not say the word first.',
      'Then name it, and show the evidence the card carries for it.',
    ],
    ask: 'What did the territories above the line have in common that the ones below did not?',
    watch: 'Someone will say “they were more developed”. Ask them to define that, then put South Africa 1910 and Bengal 1913 side by side.',
    ifShort: 'This is the cheapest morally load-bearing beat in the unit. Take the time from segment 6.',
  },
  {
    id: 's8', lesson: 2, board: 3,
    title: 'The war the empire fought, and how they left',
    t: ['T19', 'T18', 'T14'], lo: ['LO7', 'LO8'], m: ['M16', 'M3', 'M14'],
    beats: [
      { id: 'singapore', head: 'The war the empire fought' },
      { id: 'exits', head: 'How did they leave?' },
      { id: 'two-in-tension', head: 'Two men, one garden', off: true },
    ],
    link: '#year=1942&sel=singapore',
    open: 'Singapore, 15 February 1942. The card is three paragraphs of troop numbers and two dates; the dates are the argument.',
    say: [
      '“A British garrison surrendered Singapore to a smaller Japanese force. What went was not a fortress. It was the idea that this could not happen.”',
      '“Read the numbers on the card. That is who fought the empire’s wars — and Britain finished the second one owing more than it could pay for an empire it could no longer garrison.”',
      '“Names first. Naoroji, Gandhi, Ambedkar, Jinnah, Nkrumah, Kenyatta, Kimathi, Aung San. None of these people is scenery.”',
      '“Guess the year the empire was biggest. Then look at where the peak actually is.”',
    ],
    do: [
      'Read the three troop figures off the card. Do not paraphrase them; make the class copy them down with what each one counts.',
      'Put Singapore and Quit India on the board in the card’s own order, and ask what the order shows.',
      'Run the “who” ribbon before the exit map, not after it.',
      'Take the peak guess in writing before you reveal it.',
    ],
    ask: 'Who fought the wars that broke the empire, and who paid for them?',
    watch: 'Classes reach for “Britain granted independence”. The dates on this card are in the other order, and they are on screen.',
    ifShort: 'Keep the two dates and the peak. The troop numbers can be read off the card for homework.',
  },
  {
    id: 's9', lesson: 2,
    title: 'It is not finished',
    t: ['T20'], lo: ['LO12'], m: ['M13'],
    beats: [
      { id: 'fourteen', head: 'What is still British' },
      /* Reachable from every route: `tours/_flatten` appends the optional beat
         past the end of the counter, so it is not a beat a lesson omits — it is
         a beat no route requires. The two are different things on a cover
         teacher's sheet and the warning must not confuse them. */
      { id: 'congo', head: 'One empire that is not this one', optional: true },
    ],
    /* `@last` is resolved from the dataset's own last recorded change at print
       time (parts.js `resolveYearLink`). A typed year here would either be
       stale or, worse, be taken from the clock. */
    link: '#year=@last',
    open: 'Do not start anything new; close the loop the unit opened.',
    say: [
      '“1997 fades and the map does not go blank. Count what is left.”',
      '“Now write the sentence. In your own words, not mine.”',
    ],
    do: [
      'Go to the last year on the scrubber.',
      'Give them sixty seconds of silence to write this lesson’s through-line sentence.',
      'Take one read-out. Do not correct it in public; mark it on the sheet.',
    ],
    ask: 'What is still administered from London, and what is still disputed?',
    watch: 'Most classes say the answer is zero. It is fourteen, and the Chagos Archipelago is why that is still news.',
    ifShort: 'If this is gone, the lesson has no ending. Take the time from segment 6 instead.',
  },
];


/* ----------------------------------------------------------------- the tiers -- */
/* The three tiers. `note` is printed on the sheet's own standfirst so a student
   who has been handed the supported sheet is not told it is the supported
   sheet — the sheets are named by colour word, not by ability. */
export const TIERS = [
  {
    id: 'core', name: 'Core', word: 'Slate',
    strap: 'The task sheet the class works from.',
    note: 'One task for each part of this lesson. Write in the spaces. '
      + 'You will need the map on the screen for every one of them.',
  },
  {
    id: 'supported', name: 'Supported', word: 'Chalk',
    strap: 'The same tasks with the scaffolding built in — starters, a word bank, and one choice instead of a blank page.',
    note: 'One task for each part of this lesson. The words you need are in the box at the '
      + 'top of each task. Start your sentences with the beginnings given — then finish them yourself.',
  },
  {
    id: 'extension', name: 'Extension', word: 'Ink',
    strap: 'The harder judgement, the second interpretation, and one case from off this map.',
    note: 'One task for each part of this lesson. Every one asks you to weigh two things against '
      + 'each other, and the last asks you to break this atlas’s own best claim. Short answers '
      + 'score nothing here.',
  },
];
/**
 * THE TASKS — five per lesson per tier, thirty in all, keyed to the beat that
 * puts their evidence on screen and to the LESSON that prints them.
 *
 * `space` is what the task needs on paper, IN ORDER, and it is the answer to
 * the eight-ruled-lines charge. It is an array of steps rather than a bag of
 * options because the order is load-bearing: `{ then: … }` is an instruction
 * that must land between two writing spaces, and the first version of these
 * sheets printed the supported tick list above the words "after the reveal,
 * tick the four words", which invites a student to tick before the reveal.
 * The steps are `{ then }` an instruction, `{ bank }` a word bank, `{ box }` a
 * boxed short answer, `{ circle }` options to circle, `{ ticks }` a checklist,
 * `{ order }` a numbered ordering strip with a year box per slot, `{ loop }`
 * the four-box feedback loop to label, `{ match }` two columns to join,
 * `{ grid }` a table with cells a pencil fits in, `{ sentence }` the
 * through-line sentence with ruled blanks, `{ lead }` a sentence starter, and
 * `{ rules: n }` n ruled lines at 9mm. Nothing is given fewer lines than the
 * answer in the key actually needs.
 *
 * `beat` is the beat the task depends on — the one that puts the evidence on
 * screen — and `lesson` is whose sheet it prints on. Together they are the
 * claim `tools/check-pack.js` falsifies: a task on Lesson N's sheet whose beat
 * Lesson N's route does not run fails the build. `off: true` is the one
 * exception and it is the Ink sheet's own definition — "one case from off this
 * map" — so a piece carrying it must be off the route, and a piece carrying it
 * that IS on the route fails too, because calling a taught thing optional is
 * the same lie the other way round.
 *
 * `key` is what a non-specialist marks with: the answer, the three band
 * descriptors, the wrong answer classes actually give, why they give it, and
 * the one sentence to say back to the room.
 *
 * `fig` on a key names a row in the Evidence Ledger. The printed key sets that
 * row's value and its citation; this file states no quantity of its own.
 */
export const TASKS = [
  /* ---- */
  {
    lesson: 1, seg: 's1', tier: 'core', n: 1, beat: 'poster',
    prompt: 'Before the reveal: how many different kinds of British rule do you think are painted on this one colour? Write a number, and then leave it alone.',
    space: [
      { box: 'My number, before the reveal' },
      { then: 'After the reveal: the atlas gives you four buttons that change what the word “British” means on the map. Write the four words, then finish the sentence.' },
      { grid: { cols: ['1', '2', '3', '4'], rows: 1 } },
      { lead: 'The poster is misleading because…' },
      { rules: 3 },
    ],
    key: {
      answer: 'The four words are the atlas’s own four thresholds, printed below from the map’s data. The count of KINDS of rule is a different and larger number — the beat computes it from the dataset and prints it on screen — so accept the guess as a guess and mark the four words.',
      defs: true,
      weak: 'Gives a number and stops, or names one word (“colonies”).',
      secure: 'Names three or four of the atlas’s words and says the colour hides a difference.',
      strong: 'Names all four AND says what the difference is — that “claimed” and “administered” can differ by millions of square kilometres in the same year, so the size of the empire depends on which word you chose, not on the facts.',
      wrong: 'One. Or two, after a prompt.',
      why: 'The poster is one colour and the question sounds like it is about the picture. Students answer the picture, not the rule underneath it.',
      say: '“You counted the ink. Count the kinds of rule instead — and then notice the map has four buttons that each give you a different empire.”',
    },
  },
  {
    lesson: 1, seg: 's1', tier: 'supported', n: 1, beat: 'poster',
    prompt: 'Before the reveal: how many different kinds of British rule are painted on this one colour? Write a number in the box, and then leave it alone.',
    space: [
      { box: 'Your number, before the reveal' },
      { then: 'After the reveal, tick the four words the atlas uses on its buttons for what counts as “British”. The other four are ways a place was TAKEN — leave those.' },
      { ticks: ['claimed', 'administered', 'controlled', 'influenced', 'invaded', 'purchased', 'settled', 'defended'] },
      { lead: 'The poster is misleading because it uses one colour for…' },
      { rules: 3 },
    ],
    key: {
      answer: 'The four to tick are the atlas’s four thresholds, printed below from the map’s own data. The other four in the list are ways a place was TAKEN — mechanisms — not thresholds.',
      defs: true,
      weak: 'Ticks fewer than three, or ticks the mechanism words.',
      secure: 'Ticks all four and completes the sentence with “different kinds of rule”.',
      strong: 'Completes the sentence with a contrast — one colour for a place London governed directly and a place it only influenced.',
      wrong: 'Ticking “invaded” and “settled”.',
      why: 'Both are true things Britain did, and the sheet does not say the list is deliberately mixed. They are answering “what did Britain do” instead of “what did it hold”.',
      say: '“Those two are how a place was taken. I’m asking what it was once Britain had it.”',
    },
  },
  {
    lesson: 1, seg: 's1', tier: 'extension', n: 1, beat: 'poster',
    prompt: 'The poster is drawn on Mercator. That is the second thing it hides. Name what Mercator does to the map, and then say who the argument was aimed at.',
    space: [
      { rules: 5 },
      { then: 'A poster map is an argument. State the argument in one sentence, and say what a reader in the 1890s was meant to conclude from it.' },
      { rules: 4 },
    ],
    key: {
      answer: 'Mercator holds compass bearings true by stretching everything away from the equator, so high-latitude territory is inflated and equatorial territory shrunk: Canada reads as a continent, India as a smudge. The poster’s pink is therefore biggest exactly where Britain’s settler colonies were and smallest where most of its subjects lived. The audience was British, and the decades the posters sold best were the decades of most anxiety about Germany and Russia.',
      weak: 'Says Mercator “distorts” without saying in which direction, or says the map is “propaganda” without an audience.',
      secure: 'Says high latitudes are inflated and names Canada or Greenland; identifies a British domestic audience.',
      strong: 'Connects the two: the projection flatters the settler empire and shrinks the subject empire, and the argument is aimed at British voters at the moment when holding the empire was in doubt.',
      wrong: '“It makes the empire look bigger.”',
      why: 'True but unearned — it is the conclusion without the mechanism. Students have met “Mercator distorts” as a slogan and not as a geometry.',
      say: '“Bigger where? Point at the part of the map it inflates and tell me who lived there.”',
    },
  },

  /* ---- */
  {
    lesson: 1, seg: 's2', tier: 'core', n: 2, beat: 'spine', title: 'Four engines, not one line',
    prompt: 'Fill the table. One row per engine. “Engine” means the thing that actually made that empire grow — not the date and not the place.',
    space: [
      { grid: { cols: ['Empire', 'Rough span', 'The engine', 'How it ended'], rows: 4 } },
      { then: 'Now stop the sweep at 1820. How many engines are running at that moment?' },
      { lead: 'At 1820 there are ______ engines running at once, which tells me…' },
      { rules: 3 },
    ],
    key: {
      answer: 'I Atlantic, c.1585–1838, sugar and tobacco grown by enslaved Africans on land taken from Indigenous people, ended by abolition and by 1776–83. '
        + 'II Company, 1600–1858, a chartered monopoly that found land revenue more profitable than trade, ended by the 1857 rebellion and the Government of India Act 1858. '
        + 'III Imperial, c.1815–1947, industrial output needing markets plus the strategic route to India plus rivalry with France, Russia and Germany, ended by two world wars. '
        + 'IV Dissolution, 1942–1997, organised anticolonial mass politics plus British insolvency.',
      weak: 'Fills the span column and leaves the engine column as a place name or a date.',
      secure: 'Three of the four engines named as causes rather than events.',
      strong: 'All four engines named as mechanisms, and the “how it ended” column of one empire is the “engine” column of the next — Atlantic capital financing the imperial phase, the Company’s collapse producing Crown India.',
      wrong: 'Writing “trade” in all four engine cells.',
      why: 'Trade is true of every one of them, which is exactly why it explains none of them. Students reach for the word that is never wrong.',
      say: '“Trade is in all four rows, so it cannot be what tells them apart. What did each one sell, and who did the work?”',
    },
  },
  {
    lesson: 1, seg: 's2', tier: 'supported', n: 2, beat: 'spine', title: 'Four engines, not one line',
    prompt: 'Fill the table. Two columns are done for you. The engine words are in the box — one goes in each row.',
    space: [
      { bank: ['sugar, grown by enslaved Africans', 'land tax collected by a company', 'factories, steamships and the route to India', 'people organising, and Britain going broke'] },
      { grid: {
        cols: ['Empire', 'Rough span', 'The engine (choose from the box)'],
        rows: 4,
        prefill: [
          ['I  Atlantic', 'c.1585–1838', ''],
          ['II  Company', '1600–1858', ''],
          ['III  Imperial', 'c.1815–1947', ''],
          ['IV  Dissolution', '1942–1997', ''],
        ],
      } },
      { then: 'The coloured bands under the map overlap — they do not follow one another. Finish the sentence.' },
      { lead: 'The four bands overlap because…' },
      { rules: 3 },
    ],
    key: {
      answer: 'In order: sugar grown by enslaved Africans; land tax collected by a company; factories, steamships and the route to India; people organising and Britain going broke. They overlap because nobody planned them — in 1820 three are running at once.',
      weak: 'Matches two of four, or completes the sentence with “they happened at the same time”.',
      secure: 'All four matched; sentence says the empires ran at the same time.',
      strong: 'Sentence says WHY they ran at the same time — no one was in charge of the whole thing, so a new engine started before the old one stopped.',
      wrong: 'Putting them in the wrong order because “Imperial” sounds like it should be first.',
      why: 'The word “imperial” reads as the most important, so it gets the earliest slot. The spans in column two settle it and students have not used them.',
      say: '“Read column two before column three. The dates already tell you the order.”',
    },
  },
  {
    lesson: 1, seg: 's2', tier: 'extension', n: 2, beat: 'spine', title: 'The projection, and the argument',
    prompt: 'Stop the sweep at 1820. Three engines are running at once. Explain why that is a problem for anyone who writes “the British Empire” as though it were one thing.',
    space: [
      { rules: 5 },
      { then: 'Now name the one year you would defend as a genuine turning point, and say what changed at it. One year, not a decade.' },
      { lead: 'The turning point is ________, because…' },
      { rules: 4 },
    ],
    key: {
      answer: 'In 1820 the Atlantic system is still running on enslaved labour, the Company is collecting Bengal’s land tax, and the post-1815 imperial phase has begun with the Cape, Ceylon, Malta, Trinidad, Mauritius and Guyana kept at Vienna. A single noun forces one cause on three different machines. Defensible turning points: 1765 (a company acquires a tax base and stops being a trading firm), 1838 (the labour system the Atlantic ran on is gone), 1858 (the state nationalises a private empire), 1942 (Singapore destroys the prestige the Asian empire rested on). 1783 is the trap — P. J. Marshall’s point is that the same decades lost America and won Bengal.',
      weak: 'Says the empire was “complicated” or “varied” without naming what was running in 1820.',
      secure: 'Names the three simultaneous engines and picks a turning point with a reason.',
      strong: 'Names the three, picks a turning point, AND says what the alternative periodisation gets wrong — most sharply, why 1783 is not the hinge.',
      wrong: 'Choosing 1776 or 1783 as the turning point.',
      why: 'It is the date the American story trains them on, and it is a real ending — of thirteen colonies. It is not an ending of the empire, which was larger in 1820 than in 1770.',
      say: '“Britain lost about 2.5 million subjects in 1783 and within forty years ruled tens of millions more in Asia. What ended?”',
    },
  },

  /* ---- */
  {
    lesson: 1, seg: 's3', tier: 'core', n: 4, beat: 'compensation',
    prompt: 'Put these five on the line in the right order, with the year against each: the Baptist War in Jamaica · the Act abolishing slavery · the end of apprenticeship · the abolition of the slave trade · Bussa’s rebellion in Barbados.',
    space: [
      { order: 5 },
      { then: 'Now finish the sentence, using the order you have just written.' },
      { lead: 'The order of these events matters because…' },
      { rules: 4 },
    ],
    key: {
      answer: '1807 the trade abolished · 1816 Bussa’s rebellion, Barbados · 1831–32 the Baptist War, Jamaica · 1833 the Act (in force 1 August 1834) · 1838 apprenticeship ends. The rebellions come before the Act, and freedom in 1834 was not freedom for four more years.',
      weak: 'Correct chronology, sentence says “it shows what happened first”.',
      secure: 'Correct chronology, sentence says rebellion came before abolition.',
      strong: 'Correct chronology AND the sentence makes it causal and cautious: enslaved people’s own action raised the cost of holding the system, which is not the same as saying rebellion alone abolished it.',
      wrong: 'Putting 1833 before 1831, or treating 1834 as the end of the story.',
      why: 'The Wilberforce version has Parliament acting and gratitude following, so the Act gets pulled to the front. Apprenticeship is simply not taught.',
      say: '“Check your own line. Sharpe was hanged in 1832 and the Act is 1833 — so which one was the news the other one answered?”',
    },
  },
  {
    lesson: 1, seg: 's3', tier: 'supported', n: 4, beat: 'compensation',
    prompt: 'The five years are given. Write the right event next to each one, choosing from the box. Then finish the two sentences.',
    space: [
      { bank: ['the slave trade is abolished', 'Bussa’s rebellion in Barbados', 'the Baptist War in Jamaica', 'the Act abolishing slavery', 'apprenticeship ends — people are actually free'] },
      { grid: {
        cols: ['Year', 'What happened (choose from the box)'],
        rows: 5,
        prefill: [['1807', ''], ['1816', ''], ['1831', ''], ['1833', ''], ['1838', '']],
      } },
      { then: 'Look at your own table. One word goes in the gap: before, or after.' },
      { lead: 'Enslaved people rebelled ____________ the Act was passed, which matters because…' },
      { rules: 4 },
    ],
    key: {
      answer: '1807 trade abolished · 1816 Bussa · 1831 Baptist War · 1833 the Act · 1838 apprenticeship ends. The missing word is “before”.',
      weak: 'Three or four matched; sentence completed with “after”.',
      secure: 'All five matched and “before” written in.',
      strong: '“Before”, plus a reason: the people who were enslaved were acting first, so the story where Parliament simply decided to be kind is not what the dates show.',
      wrong: 'Writing “after”.',
      why: 'It matches the story they have been told, and 1833 is the only date most of them arrive already knowing.',
      say: '“Look at your own table. 1831 is above 1833 on the page. Which is earlier?”',
    },
  },
  {
    lesson: 1, seg: 's3', tier: 'extension', n: 4, beat: 'resistance',
    prompt: 'Two texts, both from the atlas: Mary Prince’s narrative, published in London in 1831, and Henry Bleby’s report of Sam Sharpe’s words, printed twenty-one years after Sharpe was hanged.',
    space: [
      { then: 'Which is more useful to a historian asking how slavery in the British Caribbean ended? Answer that question first.' },
      { rules: 6 },
      { then: 'Now say what NEITHER of them can tell you.' },
      { rules: 4 },
    ],
    key: {
      answer: 'Prince is a first-person account of what enslavement in Bermuda, the salt ponds and Antigua actually was, produced to be campaigned with; Bleby is a missionary’s recollection at twenty-one years’ distance, printed to defend the missionaries and to argue that enslaved people ended slavery themselves. Sharpe’s words are not a transcript and the chain of transmission is the point. Neither can tell you what the majority of enslaved people who left no text thought, and neither can settle what moved Parliament in 1833.',
      weak: 'Picks one and says it is “more reliable” because it is first-hand or because it is closer in time.',
      secure: 'Uses purpose as well as proximity, and does not treat Bleby as a transcript.',
      strong: 'Answers the actual question — usefulness for THIS question, not in general — and names what neither establishes: the silent majority, and the calculation inside Parliament.',
      wrong: '“Mary Prince is biased because she was enslaved.”',
      why: 'Students are taught to look for bias and find it fastest in the person with most at stake. It inverts the test: her position is what makes her account evidence.',
      say: '“Being there is not a flaw in a source. Tell me instead what her book was FOR, and who published it.”',
    },
  },

  /* ---- */
  {
    lesson: 1, seg: 's4', tier: 'core', n: 5, beat: 'revenue-loop',
    prompt: 'Draw the loop. Four boxes, four arrows. Write in each box what it is, and on each arrow what it does.',
    space: [
      { loop: true },
      { then: 'Now cut one arrow. Which one, and what stops when you cut it? Name a real year in which that happened.' },
      { lead: 'I would cut the arrow between ____________ and ____________, and then…' },
      { rules: 5 },
    ],
    key: {
      answer: 'Revenue → sepoys → conquest → more revenue. The diwani of 12 August 1765 gave the Company the land tax of Bengal, Bihar and Orissa; the tax pays soldiers; the soldiers take the next province; the next province’s tax pays for more soldiers. Nothing in the loop needs a decision in London. Cut the revenue arrow and there is no standing army to pay for — which is not a thought experiment: in 1857 the Bengal Army mutinied and rule across northern India wobbled within weeks.',
      weak: 'Four boxes with no arrow labels, so it is a list of four things rather than a machine.',
      secure: 'Loop correct and closed, with a plausible cut.',
      strong: 'Loop correct AND the cut is argued with a real event — 1770, when the famine did not stop the collection, or 1857, when the soldiers stopped.',
      wrong: '“Cut the conquest arrow — Britain should have stopped conquering.”',
      why: 'It is a moral answer to a mechanical question. The task asks what the loop needs, not what would have been right.',
      say: '“You have told me what should have happened. Tell me what the machine could not run without.”',
      fig: 'bengal-presidency:acq1.deaths',
      figLead: 'If a student asks what happened when the revenue was taken through a famine, the ledger holds the figure for Bengal in 1770:',
    },
  },
  {
    lesson: 1, seg: 's4', tier: 'supported', n: 5, beat: 'revenue-loop',
    prompt: 'The four boxes are drawn for you and the words are in the box. Write one word in each, then write on each arrow what it does.',
    space: [
      { bank: ['revenue', 'sepoys', 'conquest', 'more revenue'] },
      { loop: 'prefilled' },
      { then: 'Now finish the sentence. Think about which box the money reaches first.' },
      { lead: 'If Britain lost Bengal’s tax money, the first thing that would stop is…' },
      { rules: 4 },
    ],
    key: {
      answer: 'Revenue → pays for → sepoys → who take → conquest → which produces → more revenue. Lose Bengal’s tax and the soldiers cannot be paid.',
      weak: 'Boxes filled, arrows blank.',
      secure: 'Boxes filled and at least two arrows labelled with a verb.',
      strong: 'All four arrows carry a verb, and the last sentence says the soldiers — not the conquest — stop first.',
      wrong: '“The British army would stop.”',
      why: 'The word “army” carries “British” with it in every previous lesson they have had. The atlas says the Company’s army was overwhelmingly Indian.',
      say: '“Whose army? By the 1850s it was about a quarter of a million men and most of them were Indian.”',
    },
  },
  {
    lesson: 1, seg: 's4', tier: 'extension', n: 5, beat: 'revenue-loop',
    prompt: 'The loop ran on Indian revenue, Indian bankers, Indian clerks and Indian soldiers. About a thousand covenanted British officers administered a population that passed three hundred million.',
    space: [
      { then: 'Whose empire was it? Use the word “collaboration”, and say clearly what that word does and does not excuse.' },
      { rules: 7 },
      { then: 'If rule really did depend on collaboration, what should happen when the collaboration is withdrawn? Name a year that tests it.' },
      { rules: 4 },
    ],
    key: {
      answer: 'The machine could not run without Indian participation, so “Britain conquered India” is a description of the flag and not of the labour. But collaboration is a description of how power worked, not a distribution of blame: it was extracted under conquest, and the people who staffed the system were paid by it, threatened by it, or both. The strongest answers say that the argument cuts the other way from the way it is usually deployed — a rule that thin was also a rule that could be stopped by withdrawing the collaboration, which is what 1857 and 1942 both are.',
      weak: 'Says Indians “helped”, or slides into “so it was really their own fault”.',
      secure: 'Names the mechanism — revenue, bankers, sepoys, clerks — and refuses the blame-shift explicitly.',
      strong: 'Turns the thesis into a prediction and tests it: if rule depended on collaboration, withdrawing it should break rule — and names 1857, 1919, or the 1946 Royal Indian Navy mutiny as the test.',
      wrong: '“India was conquered by Indians, so Britain is not responsible.”',
      why: 'The collaboration thesis is genuinely counter-intuitive and students, hearing it for the first time, over-apply it. It is also a conclusion some popular writing pushes at them directly.',
      say: '“Who wrote the orders, who kept the revenue, and who could be hanged for refusing? Collaboration under conquest is not consent.”',
    },
  },

  /* ---- */
  {
    lesson: 2, seg: 's6', tier: 'core', n: 3, beat: 'egypt', title: 'One place, four legal labels',
    prompt: 'Egypt, one place, four legal labels. Write the label the atlas gives against each date.',
    space: [
      { grid: { cols: ['Year', 'What Egypt legally was'], rows: 4, prefill: [['1882', ''], ['1914', ''], ['1922', ''], ['1936', '']] } },
      { then: 'Now answer: was Egypt part of the British Empire in 1890? Name the definition your answer uses.' },
      { lead: 'Egypt in 1890 was / was not part of the empire, depending on…' },
      { rules: 4 },
    ],
    key: {
      answer: '1882 occupied — a veiled protectorate, never annexed · 1914 protectorate declared · 1922 nominally independent kingdom with British troops and four reserved matters · 1936 treaty moving the garrison to the Canal Zone. Evacuation completed 13 June 1956; Suez that November was a re-entry. The 1890 answer is “it depends on the definition”: under “controlled”, yes; under “administered” or “claimed”, no.',
      weak: 'Two labels correct; final answer is a bare yes or no.',
      secure: 'Three or four labels correct; final answer names that the definition decides it.',
      strong: 'Names the definition being used AND says what changes on the map when you switch it — the same year gives a different empire.',
      wrong: '“Yes, because Britain had troops there.”',
      why: 'Troops are the most visible fact and the map does colour Egypt. The student has picked one definition without knowing they picked one.',
      say: '“That is one of the four definitions and it is a defensible one. Say which one you used — then press the next button along and see what happens to your answer.”',
      fig: 'egypt:acq0.deaths',
      figLead: 'If the class asks what the 1882 invasion cost, the ledger holds the figure for Tel el-Kebir:',
    },
  },
  {
    lesson: 2, seg: 's6', tier: 'supported', n: 3, beat: 'egypt', title: 'One place, four legal labels',
    prompt: 'Draw a line from each year to what Egypt legally was in that year. The words are in the box.',
    space: [
      { match: { left: ['1882', '1914', '1922', '1936'], right: ['occupied, but never annexed', 'a British protectorate', 'independent — with British troops still there', 'a treaty moves the troops to the Suez Canal'] } },
      { then: 'One place had four different legal names in fifty years. Finish the sentence.' },
      { lead: 'That tells us that “part of the empire”…' },
      { rules: 4 },
    ],
    key: {
      answer: '1882 occupied but never annexed · 1914 protectorate · 1922 independent with British troops · 1936 treaty moving troops to the Canal. The sentence should end “…is not one thing, and depends on which definition you use.”',
      weak: 'Two matched; sentence completed with “was complicated”.',
      secure: 'All four matched; sentence says “part of the empire” meant different things.',
      strong: 'Sentence names the consequence: you cannot count the empire without first saying what counts.',
      wrong: 'Matching 1922 to “a British protectorate”.',
      why: 'The word “independent” beside British troops reads as a contradiction, so students discard it and look for a word that sounds like control.',
      say: '“Both are true at once in 1922, and that is what makes it worth learning: independent on paper, garrisoned in fact.”',
    },
  },
  {
    lesson: 2, seg: 's7', tier: 'extension', n: 3, beat: 'two-track', title: 'Given, and refused',
    prompt: 'Same Crown, same decade. Canada, Australia, New Zealand and the Cape had elected legislatures. India, Nigeria, Kenya and the Caribbean colonies did not.',
    space: [
      { then: 'State the operative criterion, in one sentence.' },
      { rules: 3 },
      { then: 'Now give the evidence that would have to exist for the usual alternative explanation — “they were not ready yet” — to be true, and say whether it does.' },
      { rules: 7 },
    ],
    key: {
      answer: 'The criterion is race, and the sources of the period say so without embarrassment. The “not ready” explanation predicts a sequence — that self-government arrives later where institutions arrive later — and the dates refuse it: the grants are simultaneous, and the places refused had older bureaucracies, older universities and, in India, an elected element from 1892 that was then held short of responsibility for another forty years. The evidence that would rescue “not ready” would be a stated, measurable threshold applied to both groups. None exists; the tests were applied only downwards.',
      weak: 'Says “racism” and stops.',
      secure: 'Names race and cites the simultaneity of the dates as the reason the development story fails.',
      strong: 'Falsifies rather than asserts: states what “not ready” would predict, shows the prediction failing, and names the asymmetry — the test was never applied to the settler colonies.',
      wrong: '“The white colonies were richer and more developed.”',
      why: 'It is the explanation the sources of the period themselves offer, and it feels analytical rather than moral. It is also testable, and it fails the test.',
      say: '“Then show me the threshold and show me it applied in both directions. It was never applied to Australia.”',
    },
  },

  /* ---- */
  {
    lesson: 2, seg: 's8', tier: 'core', n: 4, beat: 'singapore',
    /* RE-POINTED WITH ITS SEGMENT. This task used to ask for a prediction on the
       exit map, which the one-period route does not run: a task keyed to a beat
       the class never saw is a task nobody can answer. It now asks about the
       beat the route does reach, and the exit-map task survives on the
       extension sheet where it is offered rather than set. */
    prompt: 'Singapore, February 1942. Everything below is on the card in front of you. Copy it down before you write anything of your own.',
    space: [
      { then: 'Three figures are on the card. Write each one down and say what it counts.' },
      { grid: { cols: ['The figure', 'What it counts', 'Which war'], rows: 3 } },
      { then: 'Two dates are on the card, in an order that matters. Write them in that order.' },
      { lead: 'Quit India began: ____________ .  The Royal Indian Navy mutinied: ____________ .' },
      { then: 'One sentence: what does that order show about how the empire ended?' },
      { rules: 5 },
    ],
    key: {
      answer: 'The three figures are printed on the card with their sources and should be copied, not remembered: Indians who served in the First World War, Indians who died in it, and Indian volunteers in the Second — the largest volunteer army in history. Hundreds of thousands of African soldiers fought in Burma and East Africa. The two dates are Quit India, August 1942, and the Royal Indian Navy mutiny, February 1946 — both before the transfer of power in 1947. The order shows pressure coming before concession.',
      weak: 'The numbers copied with nothing said about what each one counts.',
      secure: 'Three figures correctly labelled, both dates in the right order, and a sentence that puts the pressure before the concession.',
      strong: 'Adds the second cause — Britain finished the war owing more than it could pay for an empire it could no longer garrison — and says the two are one argument rather than two.',
      wrong: '“Britain granted independence after the war because it had become more liberal.”',
      why: 'It is the version in most summaries, and the wartime dates are usually left out, so the transfer of power reads as a decision rather than as a position Britain had already lost.',
      say: '“Look at your own two dates. Both of them are before 1947. What was Britain answering?”',
    },
  },
  {
    lesson: 2, seg: 's8', tier: 'supported', n: 4, beat: 'singapore',
    prompt: 'Singapore, February 1942. Use the card on the screen. Everything you need is on it.',
    space: [
      { bank: ['served', 'died', 'volunteered', 'Quit India', 'the Royal Indian Navy mutiny'] },
      { then: 'Three numbers are on the card. Write each one down, and choose the word from the box that says what it counts.' },
      { grid: { cols: ['The number on the card', 'What it counts'], rows: 3 } },
      { then: 'Two events are on the card. Put them in the order the card gives them, with the year against each.' },
      { order: 2 },
      { then: 'Finish the sentence. Both of your years are before 1947.' },
      { lead: 'Britain left India in 1947 because…' },
      { rules: 4 },
    ],
    key: {
      answer: 'The three numbers count Indians who served in the First World War, Indians who died in it, and Indian volunteers in the Second. The order is Quit India, 1942, then the Royal Indian Navy mutiny, 1946 — both before the transfer of power in 1947. The sentence should say that Britain could no longer pay for or police the empire, not that it chose to be generous.',
      weak: 'Numbers copied, order guessed.',
      secure: 'Both events in the right order with the right years, and a sentence naming either the cost or the opposition.',
      strong: 'The sentence names both — the opposition and the money — and notices that they are one argument.',
      wrong: 'Putting the mutiny first, because a mutiny sounds like the start of something.',
      why: 'It reads like a beginning. It was the end of a sequence that began with a mass movement four years earlier, and both dates are on the card.',
      say: '“Which came first — a movement of millions, or a mutiny? Look at your own two years.”',
    },
  },
  {
    lesson: 2, seg: 's8', tier: 'extension', n: 4, beat: 'two-in-tension', off: true,
    prompt: 'Amritsar, 13 April 1919. Dyer gave evidence to the Hunter Committee. Tagore renounced his knighthood from Calcutta and had not been to the Punjab, which was sealed under martial law.',
    space: [
      { then: 'Write the question you are answering FIRST. Then say which source is more useful for it, and why.' },
      { lead: 'The question I am asking is…' },
      { rules: 5 },
      { then: 'Now name a second question about 1919 for which the OTHER source is the more useful one.' },
      { rules: 4 },
    ],
    key: {
      answer: 'For “was the firing deliberate?”, Dyer’s own evidence settles it — he told the Committee the effect on the whole Punjab was intended, and the enclosure’s geography corroborates him: he knew the exits were narrow and said he would have used the armoured cars had they fitted through. For “what did Amritsar do to Indian opinion?”, Tagore is the better source, precisely because he was outside and reacted anyway. A source’s distance from the event is a fact about which question it answers, not a score out of ten.',
      weak: 'Picks Dyer because he was there.',
      secure: 'Names a question and matches the source to it.',
      strong: 'Names two different questions and shows the ranking reverses between them — which is the whole move.',
      wrong: '“Dyer panicked, so his account is unreliable.”',
      why: 'It is the humane reading and it is what a film would show. His own testimony refuses it: he described the firing as deliberate and calculated to produce an effect.',
      say: '“Read what he actually told the Committee. He was not defending himself as frightened — he was defending himself as effective.”',
    },
  },

  /* ---- */
  {
    lesson: 2, seg: 's9', tier: 'core', n: 5, beat: 'fourteen',
    prompt: 'Fill the blanks in the sentence. Then write the whole thing again underneath, in your own words — not these words.',
    space: [
      { sentence: true },
      { then: 'Now, in your own words. This is the one sentence worth carrying out of the lesson.' },
      { rules: 7 },
      { then: 'Last: name one place still administered from London, and one claim still disputed.' },
      { grid: { cols: ['Still British', 'Still disputed'], rows: 2 } },
    ],
    key: {
      answer: 'One colour · {{kindsOfRule}} — crown colonies, protectorates, protected states, mandates, a condominium, princely states under paramountcy · 1942 · 1997 · the people it ruled organised, and named leaders and mass parties · Britain was insolvent and could no longer garrison it. Fourteen Overseas Territories remain; the Chagos Archipelago and Diego Garcia are the live dispute, with the Falklands and Gibraltar also contested. (This is Lesson Two’s half of the sentence. The whole thing — all four engines — belongs to the unit and is signed only when both lessons are done.)',
      weak: 'Copies the board sentence back with the blanks filled from memory of the words, not the meaning.',
      secure: 'The sentence in the student’s own words, with the single colour and at least three kinds of rule named.',
      strong: 'Own words, three or more kinds of rule named, AND the last clause carries both causes — the organising and the insolvency — rather than one.',
      wrong: '“Nothing is still British.”',
      why: 'The lesson has just narrated an ending, so the class supplies the ending it was cued for. The map is still showing fourteen dots when they write it.',
      say: '“Look back at the screen and count the dots. The number is fourteen, and one of them is why the Chagos Islands are in the news.”',
    },
  },
  {
    lesson: 2, seg: 's9', tier: 'supported', n: 5, beat: 'fourteen',
    prompt: 'Finish the sentence using the words in the box. Each word is used once.',
    space: [
      { bank: ['sugar islands', 'enslaved Africans', 'trading company', 'India', 'many different kinds of rule', '1942', '1997', 'people organised and Britain ran out of money'] },
      { sentence: true },
      { then: 'Now name one place from the map for each column.' },
      { grid: { cols: ['One place still ruled from London', 'One place still argued over'], rows: 1 } },
      { then: 'And one line: what surprised you most in this lesson?' },
      { rules: 3 },
    ],
    key: {
      answer: 'Sugar islands · enslaved Africans · trading company · India · many different kinds of rule · 1942 · 1997 · people organised and Britain ran out of money. Still British: any of the fourteen — Gibraltar, Bermuda, the Falklands, the Cayman Islands. Still argued over: the Chagos Archipelago, the Falklands, Gibraltar.',
      weak: 'Five or six blanks filled.',
      secure: 'All eight filled correctly.',
      strong: 'All eight, and the two named places are correct and different from each other.',
      wrong: 'Putting 1997 before 1942.',
      why: 'The blanks are “between ______ and ______” and students fill left to right with whichever date they saw last, which is 1997 from the final beat.',
      say: '“Which of those two years is earlier? The empire came apart in that direction.”',
    },
  },
  {
    lesson: 2, seg: 's9', tier: 'extension', n: 5, beat: 'congo', off: true,
    prompt: 'This atlas’s strongest claim is: an empire ends when the metropole can no longer afford it. Run it against one case it never draws — the Belgian Congo, independent 30 June 1960.',
    space: [
      { circle: ['it holds', 'it bends', 'it breaks'] },
      { then: 'Now say why — and if it does not hold, repair the claim rather than throwing it away.' },
      { rules: 6 },
      { then: 'What would you need to know to be sure? Name the evidence, not the conclusion.' },
      { rules: 4 },
    ],
    key: {
      answer: 'It breaks. The Congo’s mines were profitable in 1960 and Belgium expected to keep them: Union Minière went on operating straight through the secession of Katanga. What ran out was not the money but the assumption that there was time — Belgium had planned a thirty-year transition and conceded in six months. So affordability is not sufficient; the claim needs a second term about legitimacy and speed. To be sure you would want Belgian budget figures for the Congo administration, Union Minière’s returns for 1959–61, and evidence about what Brussels believed in January 1960.',
      weak: 'Says the claim holds because Belgium was a small country.',
      secure: 'Says it breaks, and names the profitability of the mines as the reason.',
      strong: 'Says it breaks, names the mechanism, AND repairs the claim rather than discarding it — proposing the second term and naming the evidence that would test it.',
      wrong: '“It fits — Belgium could not afford to keep it.”',
      why: 'The frame has just been taught and students apply it because it is the tool in their hand. It also sounds like every decolonisation story they have heard.',
      say: '“Union Minière was still paying out in 1961. Whose money ran out?”',
    },
  },

  /* ------------------------------------------------- Lesson One · task 3 -- */
  {
    lesson: 1, seg: 's2', tier: 'core', n: 3, beat: 'barbados', title: 'Three islands, and the crossing',
    prompt: 'The flow map draws two arrows for the same voyages. Read both numbers off the screen, then say what the difference between them is.',
    space: [
      { grid: { cols: ['Embarked in Africa', 'Disembarked in the Americas', 'The difference'], rows: 1 } },
      { then: 'Now the crops. Three islands, three moments — write what each one was growing and who was doing the growing.' },
      { grid: { cols: ['Place', 'Crop', 'Who worked it'], rows: 3 } },
      { lead: 'The gap between the two arrows is…' },
      { rules: 3 },
    ],
    key: {
      answer: 'The two figures are the Trans-Atlantic Slave Trade Database’s own — people embarked on the African coast, and people landed alive. The difference is deaths on the crossing, and the database is the source printed under the chart. Chesapeake: tobacco, indentured English labour giving way to enslaved Africans. Barbados after the 1640s: sugar, enslaved Africans. Jamaica after 1655: sugar, enslaved Africans on a far larger scale.',
      weak: 'Copies both numbers and calls the difference “people who did not arrive”.',
      secure: 'Names the difference as deaths during the Middle Passage and gets the three crops right.',
      strong: 'Says the difference is deaths on the crossing AND notices that the chart therefore counts the same people twice over — once as cargo loaded and once as cargo landed — which is what the record was for.',
      wrong: '“They escaped” or “they were sold somewhere else.”',
      why: 'Fifteen-year-olds reach for an outcome they can live with. The chart does not label the gap, deliberately, so that somebody has to say the word.',
      say: '“Nobody escaped mid-Atlantic. Say what the gap is. Then look at who wrote the number down and why they were counting.”',
    },
  },
  {
    lesson: 1, seg: 's2', tier: 'supported', n: 3, beat: 'barbados', title: 'Three islands, and the crossing',
    prompt: 'Read the two numbers off the flow map and write them in the boxes. Then use the word bank to finish the sentence.',
    space: [
      { grid: { cols: ['Left Africa', 'Arrived alive'], rows: 1 } },
      { bank: ['the crossing', 'sugar', 'tobacco', 'enslaved Africans', 'the Middle Passage', 'died'] },
      { lead: 'The two numbers are different because…' },
      { rules: 3 },
      { then: 'Match each island to what it grew.' },
      { match: { left: ['Chesapeake', 'Barbados', 'Jamaica'], right: ['sugar, on the largest scale', 'tobacco', 'sugar, from the 1640s'] } },
    ],
    key: {
      answer: 'Left Africa and arrived alive are both on the chart; the difference is people who died on the crossing — the Middle Passage. Chesapeake–tobacco, Barbados–sugar from the 1640s, Jamaica–sugar on the largest scale.',
      weak: 'Copies the numbers without using any bank word in the sentence.',
      secure: 'Uses “died” and “the crossing”, and matches all three islands.',
      strong: 'Uses “the Middle Passage” by name and says the number is an estimate from a database of voyages, not a headcount.',
      wrong: 'Matching Jamaica to tobacco because it is listed first.',
      why: 'The right-hand column is deliberately out of order and the sheet does not say so.',
      say: '“Read the right-hand column before you draw a line. It is not in the same order.”',
    },
  },
  {
    lesson: 1, seg: 's2', tier: 'extension', n: 3, beat: 'barbados', title: 'Three islands, and the crossing',
    prompt: 'The chart’s number is an estimate built from voyage records kept by the people doing the shipping. State one thing that makes it strong evidence and one thing it cannot tell you — then say what a historian should do about the second.',
    space: [
      { rules: 5 },
      { then: 'Sugar made Barbados the richest English colony in the Americas by the 1660s. Britain also imported tobacco, and later tea and cotton. Why does the atlas put SUGAR at the centre of Phase I rather than any of the others?' },
      { rules: 5 },
    ],
    key: {
      answer: 'Strong: the records are contemporaneous, commercial, and kept for people who needed accurate counts to be paid — and the database aggregates tens of thousands of them, so individual gaps do not swing the total. Cannot tell you: anything about the people as people; deaths on the African side of the coast before embarkation; and it under-counts illegal voyages after abolition. What a historian does: says so, gives the range rather than the point figure, and reads the silences alongside testimony — Equiano, Mary Prince — rather than instead of the numbers. Sugar is central because it is the crop whose labour demand drove the volume: it is worked year-round, it kills the workforce, and the plantation therefore has to keep buying people.',
      weak: 'Says the source is “biased” and stops.',
      secure: 'Names one real strength and one real limit, and gives a labour-demand answer for sugar.',
      strong: 'Both, plus the move: state the range, name the silence, and pair the series with testimony rather than replacing one with the other.',
      wrong: '“It was written by slavers so it cannot be trusted.”',
      why: 'Students are taught to test provenance and stop there. Provenance tells you what a source is good FOR, not that it is worthless.',
      say: '“Whose interest was served by an accurate count? Now say what that makes the number good for, and what it still cannot tell you.”',
    },
  },

  /* ------------------------------------------------- Lesson Two · task 1 -- */
  {
    lesson: 2, seg: 's5', tier: 'core', n: 1, beat: 'nationalisation',
    prompt: 'In 1858 the East India Company was abolished and the Crown took over. Write down what changed and what did not.',
    space: [
      { grid: { cols: ['Changed in 1858', 'Did not change in 1858'], rows: 4 } },
      { then: 'Name the law that did it, and the year Victoria was proclaimed Empress.' },
      { box: 'The Act, and its year' },
      { box: 'Empress of India, from' },
      { lead: 'Calling it “the Crown” instead of “the Company” mattered because…' },
      { rules: 4 },
    ],
    key: {
      answer: 'Changed: sovereignty and the chain of command — the Government of India Act 1858 abolished Company rule, created a Secretary of State for India answerable to Parliament and a Viceroy in Delhi; Victoria was proclaimed Empress of India in 1876. Did not change: the land-revenue system, the army’s composition, the personnel, the debt, or who paid for it. The rebellion of 1857–58 was the cause, and the response was constitutional rather than economic.',
      weak: 'Fills only the left column, or writes “Britain took over” in both.',
      secure: 'Names the Act and 1876, and puts at least two real items in each column.',
      strong: 'Both columns full, AND says the change was of accountability rather than of extraction — the money moved the same way afterwards.',
      wrong: '“India became a British colony in 1858.”',
      why: 'It sounds like the moment of conquest because it is the moment of naming. Most of India had been under Company rule for a century by then, and a third of it was never directly ruled at all.',
      say: '“It had been ruled from London for a hundred years already. What 1858 changed was who in London was answerable for it.”',
    },
  },
  {
    lesson: 2, seg: 's5', tier: 'supported', n: 1, beat: 'nationalisation',
    prompt: 'Use the word bank. Fill in the two boxes from the screen, then tick what changed in 1858 and cross what did not.',
    space: [
      { bank: ['Government of India Act', '1858', '1876', 'Viceroy', 'land revenue', 'sepoys'] },
      { box: 'The law that abolished the Company, and its year' },
      { box: 'The year Victoria was proclaimed Empress of India' },
      { then: 'Tick the things that changed in 1858. Leave the others.' },
      { ticks: ['who answered to Parliament', 'the land-revenue system', 'the title of the ruler in Delhi', 'who served in the army', 'who owned the debt'] },
      { lead: 'After 1858 the person in charge in India was called the…' },
      { rules: 2 },
    ],
    key: {
      answer: 'Government of India Act, 1858. Empress from 1876. Ticked: who answered to Parliament; the title of the ruler in Delhi (Governor-General becomes Viceroy). Not ticked: the land-revenue system, who served in the army, who owned the debt — all three continued.',
      weak: 'Ticks everything, or fewer than one.',
      secure: 'Both boxes right and at least one correct tick with no more than one wrong one.',
      strong: 'Exactly the two right ticks, and the sentence names the Viceroy.',
      wrong: 'Ticking “the land-revenue system”.',
      why: 'A change of government sounds like a change of everything. The revenue system is precisely what did not change, and it is the point.',
      say: '“The tax stayed the same. That is why the takeover is about who is answerable, not about who pays.”',
    },
  },
  {
    lesson: 2, seg: 's5', tier: 'extension', n: 1, beat: 'princely',
    prompt: 'Toggle the princely states on and off. Direct British rule shrinks visibly. In what sense, then, did Britain “rule” the 565 states — and what does that do to any map of the empire drawn in one colour?',
    space: [
      { rules: 6 },
      { then: 'One of the two claims below is defensible from this map and one is not. Circle the defensible one and say why the other fails.' },
      { circle: ['British India was about two thirds of the subcontinent by area', 'Britain governed the whole subcontinent directly from 1858'] },
      { rules: 4 },
    ],
    key: {
      answer: 'Paramountcy: the princely states kept internal government, courts, taxes and in some cases armies, and surrendered external relations and defence to the Crown, with a British Resident attached and the ultimate power to depose a ruler. So Britain ruled the states’ FOREIGN relations and the states ruled their own subjects — which is a real distinction, not a legal fiction, and it is why Partition in 1947 had to be negotiated state by state. A single-colour map erases it: the same pink covers a district officer collecting revenue in Bihar and a Nizam running his own administration in Hyderabad. The first claim is defensible from the map; the second is false — a third of the subcontinent by area was never directly governed.',
      weak: 'Says the princely states were “independent” or “puppets” without evidence either way.',
      secure: 'Names paramountcy or the Resident, and circles the first claim.',
      strong: 'Both, plus the consequence: the single colour hides a difference that had to be un-hidden, state by state, in 1947.',
      wrong: '“They were independent countries.”',
      why: 'The toggle makes them disappear from British India, so students read absence from one category as presence in another. Neither the map nor the treaty says independent.',
      say: '“Could Hyderabad have signed a treaty with France? Then say what kind of rule that is.”',
    },
  },

  /* ------------------------------------------------- Lesson Two · task 2 -- */
  {
    lesson: 2, seg: 's6', tier: 'core', n: 2, beat: 'scramble', title: 'How Britain took Africa',
    prompt: 'Watch 1870 → 1914 play across Africa. Then answer from the screen and from the two documents.',
    space: [
      { box: 'Roughly how many years does the claiming take?' },
      { then: 'The Berlin Conference. Write down when it met, who was in the room, and the rule it agreed.' },
      { grid: { cols: ['When it met', 'Who was there', 'The rule it agreed'], rows: 1 } },
      { then: 'The two texts of the same treaty do not say the same thing. Write the difference in one sentence.' },
      { rules: 4 },
      { then: 'Berlin wrote a rulebook. Name two occasions on this map where Africans defeated a European force.' },
      { rules: 2 },
    ],
    key: {
      answer: 'About forty years, and most of it inside twenty-five. Berlin met from November 1884 to February 1885; fourteen states attended — European powers, the Ottoman Empire and the United States — and NO African state was represented. The rule was “effective occupation”: a claim to a coast counted only if it was actually administered, which turned a paper race into an occupation race. The two texts differ because the version the chief agreed to described protection and friendship while the English version transferred sovereignty and land rights. Defeats of European forces: Isandlwana, 1879 (Zulu over British); Adwa, 1896 (Ethiopia over Italy); the Asante wars also cost Britain repeated defeats before 1900.',
      weak: 'Gives the years and stops, or says “Europe divided Africa” without the rule or the room.',
      secure: 'Dates Berlin, says no African state was present, names effective occupation, and gives one defeat.',
      strong: 'All of that, plus the consequence: “effective occupation” is what turned lines on a map into soldiers on the ground, so the rulebook caused the violence rather than replacing it.',
      wrong: '“Africa was divided up at Berlin.”',
      why: 'It is the sentence in every textbook, and it makes a conference sound like a partition. Berlin agreed procedure; the partition was done afterwards, on the ground, over twenty years, against resistance.',
      say: '“Point at the line Berlin drew. There isn’t one. Now say what Berlin actually agreed and what happened next.”',
    },
  },
  {
    lesson: 2, seg: 's6', tier: 'supported', n: 2, beat: 'scramble', title: 'How Britain took Africa',
    prompt: 'Use the word bank and the screen. Berlin, and then the two documents.',
    space: [
      { bank: ['1884–85', 'effective occupation', 'no African state', 'sovereignty', 'protection', 'Isandlwana', 'Adwa'] },
      { box: 'The Berlin Conference met in…' },
      { box: 'Who from Africa was in the room?' },
      { then: 'Circle the rule Berlin agreed.' },
      { circle: ['effective occupation', 'equal shares for every European power', 'free elections in each colony'] },
      { then: 'The chief’s version of the treaty promised ______________. The English version transferred ______________.' },
      { rules: 3 },
      { then: 'Name one battle Africans won.' },
      { box: 'Battle, and year' },
    ],
    key: {
      answer: 'Berlin met 1884–85; no African state was in the room; the rule was effective occupation. The chief’s version promised protection or friendship; the English version transferred sovereignty and land. Isandlwana 1879 or Adwa 1896.',
      weak: 'Fills the boxes but leaves the two-version sentence blank.',
      secure: 'All boxes, the right rule circled, and both halves of the treaty sentence from the bank.',
      strong: 'Adds that the difference between the two texts was not an accident of translation.',
      wrong: 'Circling “equal shares for every European power”.',
      why: 'It sounds like what a conference of rival powers would agree, and “scramble” implies sharing out. The rule was about occupation, not about shares.',
      say: '“Read the rule again. It says you only keep what you actually hold. What does that make everybody do next?”',
    },
  },
  {
    lesson: 2, seg: 's6', tier: 'extension', n: 2, beat: 'scramble', title: 'Berlin, and what it did and did not decide',
    prompt: 'The two texts of the treaty are the same agreement in two languages, and they transfer different things. Weigh them as evidence: what does the pair prove, what does it not prove, and what would you need to settle the question?',
    space: [
      { rules: 6 },
      { then: 'Now the harder judgement. Historians disagree about whether Berlin CAUSED the partition of Africa or merely regulated a partition already under way. State the strongest version of each case, then say which the evidence on this map supports.' },
      { rules: 8 },
    ],
    key: {
      answer: 'The pair proves that the two parties were agreeing to different things in writing, and that the English text was the one enforced. It does not prove that every treaty was fraudulent, that the chief was deceived rather than coerced, or what was said out loud at the signing. To settle it you would want the interpreter, the standard printed forms the concession companies carried, and later disputes in which the African party said what they thought they had signed. On causation: Berlin as cause — the effective-occupation rule converted claims into obligations to occupy, and the pace of annexation rises sharply after 1885. Berlin as regulator — Britain was already in Egypt (1882), the Cape and the Gold Coast, and Leopold and the French were already moving; the conference recognised facts and set procedure. The map supports the second with a qualification: the claiming was under way before 1884, but the RATE after 1885 is what the effective-occupation rule explains.',
      weak: 'Says the treaty was a trick and stops; or picks a side on causation without stating the other.',
      secure: 'States what the pair does and does not prove, and gives both sides of the causation argument.',
      strong: 'Both, plus the qualification: the map distinguishes the fact of claiming from the rate of claiming, and only the second is Berlin’s.',
      wrong: '“Berlin divided Africa with a ruler and that is why the borders are straight.”',
      why: 'The straight-border story is memorable, teachable and mostly false — most boundaries were fixed in later bilateral treaties, not at Berlin.',
      say: '“Find a border Berlin drew. Then find who drew the one you are pointing at, and in what year.”',
    },
  },
];

/** Tasks for one lesson and one tier, in segment order. */
export function tasksOf(lesson, tier) {
  const order = new Map(SEGMENTS.map((s, i) => [s.id, i]));
  return TASKS.filter((t) => t.lesson === Number(lesson) && t.tier === tier)
    .sort((a, b) => (order.get(a.seg) - order.get(b.seg)) || (a.n - b.n));
}

/** The segments of one lesson, in plan order. */
export function segmentsOf(lesson) {
  return SEGMENTS.filter((s) => s.lesson === Number(lesson));
}

/** The segment a task belongs to. */
export function segmentOf(task) {
  return SEGMENTS.find((s) => s.id === task.seg) || null;
}

export default {
  LESSONS, UNIT_SENTENCE, UNIT_NAME, BOARDS, PLAN, SEGMENTS, TIERS, TASKS,
  lessonNo, otherLesson, boardOf, planOf, tasksOf, segmentsOf, segmentOf,
  bindLessons, auditUnit, pieces,
};
