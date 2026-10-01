/**
 * teacher/path.js — the four moves, ON the lesson path, whichever route that is.
 *
 * THE CHARGE THIS FILE ANSWERS, verbatim from round two:
 *   "C8 … held at 4 because the Workshop is a full-screen takeover reached from
 *    a surface labelled 'Teaching desk', and Moves 2, 3 and 4 are never met by
 *    a student on the default lesson path."
 *
 * That is correct and it is fatal to the transfer criterion, because a portable
 * skill a student never picks up is not portable. So the moves now come to the
 * student, at the four beats where the move is the thing the beat is already
 * making them do:
 *
 *   MOVE 1  Source utility               compensation                Sharpe on the gallows
 *   MOVE 2  The interpretation paragraph  princely, else two-track
 *   MOVE 3  Comparing two extracts        egypt                       Urabi 1881 / 1922
 *   MOVE 4  The scope test                exits, else fourteen        → and off this map
 *
 * ROUND TWO, AND TWO OF THE FOUR HAD SILENTLY GONE AGAIN. This file was
 * written against a default route of `thirty` and named ONE beat per move.
 * The default became `core` — twelve beats — and `core` does not run
 * `princely`, so MOVE 2 was offered on no beat a student ever reached. And at
 * `exits` the charts piece now holds the shared aux slot with "Count it ↓", so
 * `offer()` stood down, exactly as it promises to, and MOVE 4 was never
 * offered either. Measured, by walking the beats and reading the slot:
 *
 *   compensation  Move 1 · Source utility →
 *   princely      (not on this route; the slot still held Move 1)
 *   egypt         Move 3 · Comparing two extracts →
 *   exits         Count it ↓            ← somebody else's, and ours stood down
 *
 * Two of four met on the default lesson is the C8 charge back in its original
 * form. So a move now names its homes as an ORDERED LIST. A home the route
 * does not carry is dropped — `steps.js` `carries()` answers that from the
 * tour's own checked step index, and answers `null` rather than guessing while
 * the index is still loading, in which case nothing is re-routed. A home whose
 * slot another piece holds is skipped and the move is offered at its next
 * home instead of being lost. `where` (and, where the fallback beat has not
 * taught the thing the card's sentences are about, a one-line primer) is
 * authored per home, so a card never opens by referring to a beat this student
 * did not see.
 *
 * HOW IT REACHES THE PATH WITHOUT TOUCHING ANOTHER PIECE. `app/js/tours/index.js`
 * publishes an extension point — `bus.emit('tours:aux', {label, emit, payload})`
 * puts one quiet `.cx-more` control in the tour's own Back/Next bar and calls
 * back on the event you name. We use exactly that, and nothing else. The tour
 * clears the slot on every beat (`_paint()` empties it after it announces the
 * beat), so the offer is re-made one task later, and it disappears by itself
 * when the beat moves on. Nothing here can block Next, lock a gate, or change
 * the year, the selection or the layer.
 *
 * AND BELOW 62rem THE SLOT IS NOT THERE AT ALL. `tours.css` line 781 reads
 * `.tr-dock .tr-bar__escape, .tr-dock .tr-bar__aux { display: none }` — when the
 * transport docks over the plate on a narrow screen the tour keeps it to Back,
 * the counter and Next, which is the right call for a 390px bar and is not ours
 * to overrule. Measured: at 390, 768 and 900 the aux control has a zero-size
 * box. So on exactly that band the offer moves into the one masthead control
 * this piece owns: the `chrome-end` entry stops saying "Teaching desk" and says
 * "Move 1 →" for as long as the move is standing. It is still ONE control in
 * chrome-end (FEATURE_SPEC P20 acceptance test 6), its label says exactly what
 * it does, and the desk is still reachable from inside the card and from
 * `#panel=workshop`. The media condition is the one the shell and the tour
 * both key on, quoted rather than re-derived.
 *
 * THE SLOT IS SHARED, and we measured who else is in it before choosing beats:
 * the charts piece answers Barbados with "Count the crossing" and revenue-loop
 * with "Count the army". Those are the two figures round two asked for and they
 * belong there. Our four beats are ones nobody else offers on, and if that ever
 * changes the offer stands down rather than overwriting theirs — see `offer()`.
 *
 * WHERE THE CARD OPENS. The rail sheet (`ask:sheet`), which LAYOUT_BUDGET §3
 * level 3 guarantees at least 280 px and its own scroll, beside a live map.
 * It is not a takeover: the map, the spine band, the year and the Back/Next bar
 * are all still there and still working. Our sheet id begins `teacher:` so the
 * tours piece — which only drops a sheet whose id begins `tours:` — will not
 * fight us for the column, and we do the same in return.
 *
 * EACH CARD IS NINETY SECONDS. The move in one line, a question about the beat
 * the reader is standing in, three answers, a commit, and then sixty words on
 * why one of them is the move. The full worked example, the model and the mark
 * scheme stay in the Workshop; the card says so and links to it.
 *
 * WHAT IT WRITES. One key in localStorage — which options this reader chose —
 * so a return visit does not ask them to re-commit and the printed revision
 * sheet can quote their own answers back at them. No timings, no counts, no
 * network. Methods says the same in the same words.
 *
 * EVENTS EMITTED   teacher:move {n, id} · teacher:moveDone {n} · ask:sheet · tours:aux
 * EVENTS HEARD     tours:beat · teacher:moveOpen (our own aux callback) · chrome:sheet
 */

import { el, storage, announce } from '../core/util.js';
import { carries, currentRoute, routeBeats } from './steps.js';
import { lessonRoute } from './timing.js';

const STORE_KEY = 'teacher.path.v1';
export const PATH_STORE_KEY = STORE_KEY;

/* ============================================================== content == */

/**
 * `at` is the beat id the card is offered on; `srcIds` are ids in the atlas's
 * transcribed corpus, and every provenance line printed below is read out of
 * that corpus at the moment of drawing rather than re-typed here. If the
 * dossier piece is missing the card still works — it simply says nothing about
 * the source's provenance instead of inventing it.
 */
export const PATH_MOVES = [
  {
    n: 1,
    at: ['compensation'],
    slug: 'utility',
    name: 'Source utility',
    one: 'Nature, origin, purpose — then never “is it reliable?” but “useful for what?”',
    where:
      'You have just put the abolition sequence in order. The line most often quoted about why it ' +
      'happened was spoken in a Montego Bay gaol, and it does not reach us in the speaker’s own hand.',
    srcIds: ['sharpe-gallows-1832'],
    q: 'A historian is asking why Parliament abolished slavery in 1833. What is this report of Samuel Sharpe’s words good for?',
    options: [
      {
        k: 'a',
        text: 'Little. Bleby had a case to make, so the source is unreliable.',
        good: false,
        why:
          'This is the commonest way to lose the marks: it treats a purpose as a defect. Every source ' +
          'was made by someone who wanted something. Knowing what Bleby wanted is what tells you what ' +
          'the book is good for — it does not cancel the book.',
      },
      {
        k: 'b',
        text: 'It proves Sharpe said those words, because a missionary who was there wrote them down.',
        good: false,
        why:
          'Bleby was not there when Sharpe spoke to the court, he visited him in gaol, and he printed ' +
          'the sentence twenty-one years later. Reported speech across two decades is evidence of a ' +
          'memory and an argument, not a transcript.',
      },
      {
        k: 'c',
        text: 'Weak evidence of Sharpe’s exact words; strong evidence that by 1853 the abolitionist case needed the rebellion to be the reason.',
        good: true,
        why:
          'Two scoped judgements in one sentence — not for this, yes for that — and the second one ' +
          'uses the very thing that made the source look suspect. The purpose is the finding.',
      },
    ],
    close:
      'Do this to any source in the atlas: what kind of thing is it, who made it and when, what for — ' +
      'and then name one question it settles and one it cannot.',
  },
  {
    n: 2,
    /* THREE HOMES, AND THE THIRD ONE IS ROUND EIGHT'S. The one-period route runs
       neither `princely` nor `two-track`, so Move 2 was offered on no beat a
       student on the default lesson ever reached — the exact C8 defect this
       file exists to answer, returning for the third time because the default
       route changed under it. `singapore` is the last beat on that route whose
       aux slot no other piece holds (the viz module holds it wherever a beat
       declares an on-path figure), and it is where the class has just been
       given three paragraphs of which one is an argument. */
    at: ['princely', 'two-track', 'singapore'],
    slug: 'paragraph',
    name: 'The interpretation paragraph',
    one: 'State the claim in one sentence, give it a mechanism, then say where it stops.',
    where:
      'You have just pressed 2, then 1, and watched the word change while the year stood still. ' +
      'That gap — between what the map claims and how a place was actually governed — is a finding. ' +
      'Now put it in a sentence somebody could argue with.',
    /* Some routes do not run the princely-states beat, so on those this card
       opens on the settler two-track instead — where
       the class has just sorted places by whether the people living in them
       could vote for the government that taxed them, which is the same gap. */
    whereAt: {
      'two-track': 'You have just sorted places by whether the people living in them could vote for the '
        + 'government that taxed them, and found the same Crown running two systems in the same year. '
        + 'That gap — between what one colour on the map claims and how a place was actually governed '
        + '— is a finding. Now put it in a sentence somebody could argue with.',
      singapore: 'You have just read three paragraphs about who fought the empire’s wars and what they '
        + 'cost. Two of them tell you what happened. One of them tells you what it meant, and could be '
        + 'argued with. Telling those apart is the move.',
    },
    /* And on that route the class has not met the princely states, which the
       three sentences below are about. One line, before the question, so the
       card is self-contained. It carries no quantity: this piece states no
       number that is not in the dataset with its citation. */
    primerAt: {
      'two-track': 'The sentences below are about the princely states: the part of India Britain ruled '
        + 'through its own rulers, each bound by treaty with a British resident at the court, rather '
        + 'than administering it directly. This lesson does not stop there; you need only the '
        + 'arrangement, which is in the first sentence.',
      singapore: 'The sentences below are about the princely states: the part of India Britain ruled '
        + 'through its own rulers, each bound by treaty with a British resident at the court, rather '
        + 'than administering it directly. This lesson does not stop there; you need only the '
        + 'arrangement, which is in the first sentence.',
    },
    srcIds: [],
    q: 'Three sentences about how India was governed. Which one is an interpretation, rather than a description or a verdict?',
    options: [
      {
        k: 'a',
        text: 'The Government of India ruled the provinces directly, and ruled the princely states through treaties and a British resident at each court.',
        good: false,
        why:
          'True, and it is a description. It says what the arrangement was. An interpretation says what ' +
          'the arrangement was <em>for</em>, and can be wrong.',
      },
      {
        k: 'b',
        text: 'Indirect rule was a trick. The princes were puppets and the treaties meant nothing.',
        good: false,
        why:
          'A verdict, and the evidence cuts both ways against it. Hyderabad ran its own government, its ' +
          'own currency and its own army, and Britain could not simply replace its ruler. Calling an ' +
          'arrangement a trick saves you from having to say how it worked.',
      },
      {
        k: 'c',
        text: 'Indirect rule was cheap and it bought allies, which is why the 1858 proclamation guaranteed the princes their thrones in the same year as Parliament abolished the Company — and why it explains India and the Malay states far better than it explains Barbados, where there was no ruler left to deal with.',
        good: true,
        why:
          'Claim, mechanism, and the edge of the claim, in one sentence. The last clause — where it ' +
          'stops — is the half most students leave out, and it is the half that is marked. Notice that ' +
          'it can be argued with: someone could answer that the princes were kept for prestige rather ' +
          'than for cost, and then you would both be arguing about evidence.',
      },
    ],
    close:
      'A paragraph that names a mechanism and its edge beats a paragraph that lists four causes and ' +
      'weighs none. Two of the three sentences above are true. Only one of them is an argument.',
  },
  {
    n: 3,
    at: ['egypt'],
    slug: 'compare',
    name: 'Comparing two extracts',
    one: 'Where do they agree, where exactly do they diverge, what explains the divergence, and which is better evidence for which question?',
    where:
      'You have just watched one country carry four legal labels. Two texts in this atlas argue about ' +
      'who Egypt belongs to, forty-one years apart.',
    srcIds: ['urabi-abdin-1881', 'egypt-declaration-1922'],
    q: 'Both texts are about who owns Egypt. What does putting them side by side establish that neither establishes alone?',
    options: [
      {
        k: 'a',
        text: 'That the British said one thing and did another.',
        good: false,
        why:
          'A verdict, and one you could have reached without reading either text. A comparison has to ' +
          'name the words that differ before it is allowed a conclusion.',
      },
      {
        k: 'b',
        text: 'That Egyptians wanted independence and Britain granted it in 1922.',
        good: false,
        why:
          'The declaration was unilateral — no Egyptian government would sign a treaty on those terms — ' +
          'and the Wafd rejected the reserved points. “Granted” is the losing side’s word for losing, ' +
          'and it is doing the work here that the evidence should be doing.',
      },
      {
        k: 'c',
        text: 'That the demand of 1881 and the declaration of 1922 use the same word — independence — for two different things, and that the four reserved points are where the difference is written down.',
        good: true,
        why:
          'That is a comparison: the shared word, the exact divergence, and the place in the text where ' +
          'you can point at it. British troops stayed until 1956 and the Sudan was not settled until ' +
          '1953, which is the divergence turned into forty years of history.',
      },
    ],
    close:
      'Two sources are not twice one source. The distance between them is itself evidence, and naming ' +
      'what causes the distance — purpose, audience, position, date — is the answer.',
  },
  {
    n: 4,
    at: ['exits', 'fourteen'],
    slug: 'scope',
    name: 'The scope test',
    one: 'Where does this argument work, where does it stop, and what is it still good for once it is cut down?',
    where:
      'You have just seen how the departures are filed. Now take the atlas’s strongest claim about why ' +
      'they happened, and take it somewhere the atlas does not draw.',
    /* The exits beat's one quiet control is often already taken by the charts
       piece ("Count it ↓"), which is the right offer to make there. This move
       then stands down and is offered on the last beat instead — the one that
       is already about what the claim does and does not reach. */
    whereAt: {
      fourteen: 'You have just counted what is still British, which is what the atlas’s strongest claim '
        + 'about why empires end has to explain last. Take that claim somewhere the atlas does not draw.',
    },
    srcIds: [],
    q: '“An empire ends when the metropole can no longer afford it.” France left Algeria on 5 July 1962, after eight years of war. Does the claim fit, strain, or break there?',
    options: [
      {
        k: 'a',
        text: 'Fits. Eight years of war is exactly the cost the claim is about.',
        good: false,
        why:
          'The war was expensive, but France in 1962 was in the fastest growth of its modern history ' +
          'and was not being forced out by a bill. If the claim means money, this case does not show it.',
      },
      {
        k: 'b',
        text: 'Strains it. France could pay; what it could not carry was the war inside French politics.',
        good: true,
        why:
          'That is the scope test done properly: the claim is not refuted, it is made to say which ' +
          'currency it means. Alistair Horne’s A Savage War of Peace (1977) argues the army had broken ' +
          'the FLN inside Algeria by about 1960 and still lost, because the war that counted was at ' +
          'home. Keep the claim; write “cost of what, felt by whom” into it.',
      },
      {
        k: 'c',
        text: 'Breaks. Algeria was legally part of France, so it is not an empire and the claim does not apply.',
        good: false,
        why:
          'The law said departments; the practice was settler citizens and Muslim subjects under ' +
          'different law in the same place. Letting a ruling power’s own legal label decide what counts ' +
          'is the same mistake the pink map makes, and you spent beat 9 undoing it.',
      },
    ],
    close:
      'Two more cases — the Congo, where the colony was still paying and Belgium went anyway, and ' +
      'Portugal, where the cost brought down the government rather than the treasury — are in the ' +
      'Workshop, with the books, and a box in which you write the frame in your own words.',
    toPortable: true,
  },
];

/**
 * WHERE A MOVE FIRES ON THE ROUTE THIS READER IS ACTUALLY ON.
 *
 * `carries()` answers from the checked step index and answers `null` while the
 * index is still loading — in which case the list is left alone, because
 * re-routing a lesson card on the strength of an unloaded file is worse than
 * offering it at a beat that may not come.
 */
/**
 * DOES THIS ROUTE RUN THIS BEAT? Asked of the mirrored BEAT LIST, which is a
 * fact about tours.json, rather than of `carries()`, which is gated on the
 * step-COUNT check and answers null until that check passes. The two are
 * different questions and only the second one is a page number. Measured while
 * the tours module was re-cutting its line-up: `carries()` answered null for
 * every beat on a route the beat list had perfectly well, and every surface
 * here fell back to naming a beat the lesson does not run.
 */
function runs(id, r) {
  const list = routeBeats(r);
  if (list && list.length) return list.includes(id);
  const c = carries(id, r);
  return c === null ? null : c;              /* nothing known: not a denial */
}

function homesOf(move, route) {
  const r = route || currentRoute() || lessonRoute();
  const on = move.at.filter((id) => runs(id, r) !== false);
  return on.length ? on : move.at;
}

/**
 * IS THIS MOVE OFFERED AT ALL ON THIS ROUTE? `homesOf` falls back to the
 * move's authored beats when none of them is on the route, which is right for
 * the runtime — the offer simply never fires — and wrong for a printed plan,
 * which then names a beat the lesson does not run. Measured on the two-lesson
 * split: Move 3 fires at `egypt`, the guided path demoted `egypt` off both
 * lesson routes (DIDACTIC_SPEC §3.1 puts T12 first on the demotion order), and
 * both lessons' plans printed "offered at the egypt beat".
 */
function offeredOn(move, route) {
  const r = route || currentRoute() || lessonRoute();
  /* `!== false`, NOT `=== true`, and the difference is the third state:
     unknown is not a denial. Matches `homesOf` above, deliberately — the two
     must agree about which beats a move can fire on. */
  return move.at.some((id) => runs(id, r) !== false);
}

/**
 * WHERE THE FOUR MOVES ARE OFFERED ON A ROUTE, for the surfaces that print it.
 * The classroom tab and the printed lesson plan used to carry four typed
 * sentences naming the beat each move fires on ("at the princely-states beat"),
 * and two of the four went silently wrong the moment the default route changed.
 * They ask this instead, so a printed plan cannot name a beat the lesson does
 * not run.
 */
export function movePlan(route) {
  return PATH_MOVES.map((m) => {
    const homes = homesOf(m, route);
    return {
      n: m.n, name: m.name, one: m.one, slug: m.slug,
      beat: homes[0],
      /* Every beat this move can fire on, on this route, best first. The second
         is not a duplicate: it is where the offer goes when the first beat's
         one quiet control is already held by another piece — which is a fact
         about the running page, not about the route, so a surface that prints
         a step number has to print both. */
      homes,
      /* False when no beat this move can fire on is on this route. A surface
         that prints where a move is offered must say "not on this lesson"
         rather than name a beat the class never reaches. */
      offered: offeredOn(m, route),
      at: m.at.slice(),
      moved: homes[0] !== m.at[0],
    };
  });
}

/** The move a beat is a home for, and the words this home opens with. */
function moveAtBeat(id) {
  for (const m of PATH_MOVES) {
    const homes = homesOf(m);
    const i = homes.indexOf(id);
    if (i < 0) continue;
    return {
      move: m,
      home: id,
      first: i === 0,
      where: (m.whereAt && m.whereAt[id]) || m.where,
      primer: (m.primerAt && m.primerAt[id]) || null,
    };
  }
  return null;
}

/* ================================================================ mount == */

/**
 * @param {object} ctx  the module context: { bus, store, util }
 * @param {object} api  { texts: () => Promise<Array>, openDesk: (panel) => void }
 * @returns {function} teardown
 */
export function mountPath(ctx, api) {
  const { bus } = ctx;
  const offs = [];
  let armed = null;          // the move currently offered, if any
  let armedWhere = null;     // and which of its homes it is being offered at
  let sheetIsOurs = false;
  let texts = null;
  let timer = null;

  /* The same condition `tours/index.js` uses to decide where its bar lives, and
     the same one `layout.css` uses for the rail. If it changes there it must
     change here; that is why it is written out rather than inferred. */
  const narrow = typeof matchMedia === 'function' ? matchMedia('(max-width: 62rem)') : null;
  const tell = () => {
    if (api && typeof api.onArm === 'function') {
      api.onArm(armed && narrow && narrow.matches ? armed : null, armed);
    }
  };
  if (narrow && narrow.addEventListener) {
    narrow.addEventListener('change', tell);
    offs.push(() => narrow.removeEventListener('change', tell));
  }

  /* Which moves have actually been PLACED in the slot in this session. A move
     with two homes must not be offered twice when the first offer stood: the
     second home is a recovery, not a repeat. */
  const shown = new Set();

  const offer = (spot) => {
    const move = spot.move;
    armed = move;
    armedWhere = spot;
    tell();
    /* The tour empties its aux slot in `_paint()`, which it runs immediately
       AFTER announcing the beat — so an offer made inside the handler is wiped
       one line later. One task's delay puts us after it, and re-offering is
       harmless if the beat has already moved on because `armed` is checked
       again on the way in. */
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (armed !== move) return;
      /* The aux slot is shared. Another piece answers the same beat on some
         beats with its own control (the charts piece offers "Count the
         crossing" at Barbados), and one quiet control is the whole point of
         that slot. If somebody else got there first on this beat, they keep
         it: a second offer would either replace theirs or start a race, and
         neither is worth a move the reader can still reach from the desk. */
      const held = document.querySelector('.tr-bar__auxb');
      if (held && held.textContent && !/^Move \d/.test(held.textContent)) return;
      const done = (storage.get(STORE_KEY, {}) || {}).picks || {};
      bus.emit('tours:aux', {
        label: 'Move ' + move.n + ' · ' + move.name + (done[move.n] ? ' ✓' : '') + ' →',
        emit: 'teacher:moveOpen',
        payload: { n: move.n },
      });
      shown.add(move.n);
    }, 0);
  };

  const withdraw = () => {
    armed = null;
    armedWhere = null;
    clearTimeout(timer);
    tell();
  };

  offs.push(bus.on('tours:beat', (p) => {
    const id = p && p.id;
    const spot = id ? moveAtBeat(id) : null;
    if (!spot || (p && p.exploring)) { withdraw(); return; }
    /* A later home is a recovery for an offer that could not be made. If the
       first one stood, this beat keeps its own quiet control. */
    if (!spot.first && shown.has(spot.move.n)) { withdraw(); return; }
    offer(spot);
  }));

  /* Once a move has been committed the offer has done its job, so the masthead
     entry goes back to being the teaching desk. On a narrow screen that control
     is the only route to the desk, and holding it hostage to a card the reader
     has already answered would be a worse trade than losing the tick. */
  offs.push(bus.on('teacher:moveDone', () => tell()));

  offs.push(bus.on('chrome:sheet', (p) => {
    const id = p && p.open ? String(p.id || '') : null;
    sheetIsOurs = !!id && id.startsWith('teacher:');
  }));

  offs.push(bus.on('teacher:moveOpen', async (p) => {
    const move = PATH_MOVES.find(m => m.n === (p && p.n)) || armed;
    if (!move) return;
    /* The card opens with the words of the home it was offered at. Opened from
       the desk rather than from the path there is no home, so it opens with the
       move's own first-home words. */
    const spot = (armedWhere && armedWhere.move === move)
      ? armedWhere
      : { where: move.where, primer: null };
    if (!texts && api && typeof api.texts === 'function') {
      try { texts = await api.texts(); } catch (_) { texts = []; }
    }
    bus.emit('ask:sheet', {
      id: 'teacher:move:' + move.n,
      /* Short on purpose. The sheet head puts the eyebrow and the title in one
         row, so a long eyebrow pushes the title into two columns of wrapped
         type; "move 3 of 4" is the whole of what the eyebrow has to say. */
      eyebrow: 'move ' + move.n + ' of 4',
      title: move.name,
      node: card(move, texts || [], ctx, api, spot),
    });
    bus.emit('teacher:move', { n: move.n, id: move.slug });
    tell();
    announce('Move ' + move.n + '. ' + move.name + '. ' + move.one);
  }));

  return () => {
    armed = null;
    tell();
    clearTimeout(timer);
    offs.forEach(f => { try { f(); } catch (_) { /* already gone */ } });
    if (sheetIsOurs) { try { bus.emit('ask:sheet', null); } catch (_) { /* shell gone */ } }
  };
}

/* =============================================================== the card = */

function card(move, texts, ctx, api, spot) {
  const root = el('div.tp-mv');
  const where = (spot && spot.where) || move.where;
  const primer = (spot && spot.primer) || null;

  root.appendChild(el('p.tp-mv__one', move.one));
  root.appendChild(el('p.tp-mv__where', where));
  /* Only on a fallback home, and only when the beat the card's material comes
     from is one this route does not run. */
  if (primer) root.appendChild(el('p.tp-mv__primer', primer));

  /* One source gets its nature and its purpose; a pair gets nature only. Two
     full provenance blocks made the compare card 350 words before the question,
     and a ninety-second card that opens with 350 words is not a ninety-second
     card. What the pair is FOR is the thing the reader is about to work out. */
  const pair = move.srcIds.length > 1;
  for (const id of move.srcIds) {
    const t = texts.find(x => x.id === id);
    if (!t) continue;
    root.appendChild(el('div.tp-mv__src',
      el('p.tp-mv__srcq', '“' + (t.quote || '') + '”'),
      el('p.tp-mv__srcc', t.speaker || [t.author, t.work, t.year].filter(Boolean).join(', ')),
      t.nature ? el('p.tp-mv__srcf', el('span.tp-mv__srck', 'What it is'), ' ', t.nature) : null,
      !pair && t.purpose ? el('p.tp-mv__srcf', el('span.tp-mv__srck', 'What it was for'), ' ', t.purpose) : null));
  }

  /* the commit */
  const ask = el('div.cx-ask.tp-mv__ask',
    el('p.cx-ask__eyebrow', 'Commit before you read on'),
    el('p.cx-ask__q', move.q));
  root.appendChild(ask);

  const saved = storage.get(STORE_KEY, {}) || {};
  const picks = saved.picks || {};
  /* No `role="status"` here. The verdict is announced explicitly on commit, and
     a live region as well would read the whole card twice. */
  const result = el('div.tp-mv__result', { hidden: true });
  const buttons = [];

  const settle = (opt, fresh) => {
    buttons.forEach((b, i) => {
      const on = move.options[i].k === opt.k;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.classList.toggle('is-on', on);
      b.classList.toggle('is-right', move.options[i].good);
      b.disabled = false;
    });
    /* `replaceChildren` is the native DOM method and it stringifies whatever it
       is given: a `null` in this list printed the word "null" as a paragraph in
       the middle of the answer. Filter first. */
    result.replaceChildren(...[
      el('p.tp-mv__verdict', { 'data-good': opt.good ? 'yes' : 'no' },
        opt.good ? 'That is the move.' : 'Not this one — and this is the useful wrong answer.'),
      el('p.tp-mv__why', { html: opt.why }),
      opt.good ? null : el('p.tp-mv__why.tp-mv__why--right',
        el('span.tp-mv__rk', 'The move is ' + move.options.find(o => o.good).k), ' — ',
        el('span', { html: move.options.find(o => o.good).why })),
      el('p.tp-mv__close', move.close),
      el('p.tp-mv__out',
        el('button.cx-more', {
          type: 'button',
          onclick: () => { if (api && api.openDesk) api.openDesk('workshop'); },
        }, move.toPortable
          ? 'The Congo, Portugal, and the frame in your own words'
          : 'Move ' + move.n + ' in full — a worked example, a model and a mark scheme')),
    ].filter(Boolean));
    result.hidden = false;
    if (fresh) {
      picks[move.n] = opt.k;
      const s = storage.get(STORE_KEY, {}) || {};
      s.picks = picks;
      storage.set(STORE_KEY, s);
      ctx.bus.emit('teacher:moveDone', { n: move.n });
      announce(opt.good ? 'That is the move.' : 'Not this one. ' + opt.why);
    }
  };

  const list = el('ul.tp-mv__opts');
  move.options.forEach((opt) => {
    const b = el('button.tp-mv__opt', { type: 'button', 'aria-pressed': 'false' },
      el('span.tp-mv__optk', opt.k), el('span.tp-mv__optt', opt.text));
    b.addEventListener('click', () => settle(opt, true));
    buttons.push(b);
    list.appendChild(el('li', b));
  });
  root.appendChild(list);
  root.appendChild(result);

  const prior = picks[move.n];
  if (prior) {
    const opt = move.options.find(o => o.k === prior);
    if (opt) settle(opt, false);
  }

  return root;
}

/** Has this reader already committed on this move? Drives the tick on the label. */
export function moveDone(n) {
  return !!((storage.get(STORE_KEY, {}) || {}).picks || {})[n];
}

/** What this reader answered, for the printed revision sheet. Derived, not stored twice. */
export function pathPicks() {
  const picks = (storage.get(STORE_KEY, {}) || {}).picks || {};
  return PATH_MOVES
    .filter(m => picks[m.n])
    .map(m => {
      const opt = m.options.find(o => o.k === picks[m.n]);
      return { n: m.n, name: m.name, said: opt ? opt.text : null, right: !!(opt && opt.good) };
    });
}
