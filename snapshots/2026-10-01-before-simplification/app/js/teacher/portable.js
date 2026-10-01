/**
 * teacher/portable.js — the frame, off this map.
 *
 * WHY THIS FILE EXISTS. Round two put C8 at 4 and named the ceiling exactly:
 * "the Workshop is a full-screen takeover … and Moves 2, 3 and 4 are never met
 * by a student on the 30-minute path." The rubric's own level-5 anchor is
 * harder than that: the learner "could apply the analytic frame to a different
 * empire or period, and can articulate the frame in their own words."
 *
 * So: three exits this atlas never draws, run against the atlas's own strongest
 * claim about why empires end. The student commits to fits / strains / breaks
 * before anything is revealed, and each reveal is two named historians with
 * real books, holding positions their authors would recognise. Then a box in
 * which the student writes the frame in their own words, against a five-line
 * mark scheme, unlocked only after they have written.
 *
 * WHY THESE THREE. Because they break the claim in three different ways, and a
 * student who has met all three cannot leave with "affordability explains
 * decolonisation" as a slogan.
 *   Algeria    strains it — France was not bankrupt; the price was political.
 *   The Congo  breaks it — the colony was paying, and Belgium went anyway.
 *   Angola and Mozambique  fits it, by the opposite mechanism: the cost brought
 *              down the government that was paying, not the treasury.
 *
 * NUMBERS. There are none here that are not dates. Every quantity in this app
 * comes from the dataset with its citation, and this section is deliberately
 * outside the dataset, so it carries no quantities at all. Dates and the names
 * of real books are the whole of its evidence, and each book is one a reader
 * can go and find.
 */

import { el, fill, storage } from '../core/util.js';
import { panel, head } from './parts.js';

const STORE_KEY = 'teacher.portable.v1';
export const PORTABLE_STORE_KEY = STORE_KEY;

/** The claim under test. It is the atlas's own, and the strongest one it makes. */
export const PORTABLE_CLAIM = 'An empire ends when the metropole can no longer afford it.';

const MIN_WORDS = 40;
const words = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;

const VERDICTS = [
  ['fits', 'Fits'],
  ['strains', 'Strains it'],
  ['breaks', 'Breaks it'],
];

/* ============================================================== the cases = */

export const PORTABLE_CASES = [
  {
    id: 'algeria',
    place: 'Algeria',
    power: 'France',
    span: '1830–1962',
    engine: 'Settlement, on land taken from Algerians, held by an army.',
    setup:
      'French troops took Algiers in 1830. From 1848 the north was governed not as a colony but as ' +
      'departments of France, with settler citizens and Muslim subjects living under different law in ' +
      'the same place. The war began in November 1954. France signed the Evian Accords in March 1962 ' +
      'and Algeria became independent on 5 July.',
    answer: 'strains',
    verdict:
      'It strains. France in 1962 was in the middle of the fastest growth in its modern history and ' +
      'was not being forced out by a bill it could not pay. What could not be afforded was the war ' +
      'inside French politics: a mutiny of generals in 1961, a president who had come back to power ' +
      'over Algeria and then left it, and a settler population that had been told for a century that ' +
      'this was France.',
    historians: [
      {
        who: 'Alistair Horne',
        work: 'A Savage War of Peace: Algeria 1954–1962',
        pub: 'Macmillan, 1977',
        says:
          'The French army had broken the FLN militarily inside Algeria by about 1960 and still lost, ' +
          'because the political war in France and abroad was the one that counted.',
      },
      {
        who: 'Matthew Connelly',
        work: 'A Diplomatic Revolution: Algeria’s Fight for Independence',
        pub: 'Oxford University Press, 2002',
        says:
          'The FLN won by taking the question out of Algeria — to the United Nations, to Washington, ' +
          'to the world press — which is a mechanism the affordability claim has no place for.',
      },
    ],
    adds:
      'Add to the frame: a metropole can be solvent and still unable to pay. Name the currency — money, ' +
      'conscripts, votes, legitimacy — or the claim is not yet an explanation.',
  },
  {
    id: 'congo',
    place: 'The Congo',
    power: 'Belgium',
    span: '1885–1960',
    engine: 'Extraction under concession: rubber first, then copper, cobalt and uranium.',
    setup:
      'Leopold II held the Congo as his personal possession from 1885. After an international campaign ' +
      'over the rubber regime, the Belgian state annexed it in 1908 and ran it through a partnership of ' +
      'administration, mining companies and Catholic missions. In January 1960, at a round table in ' +
      'Brussels, Belgium agreed a date. The Congo became independent on 30 June, about five months later.',
    answer: 'breaks',
    verdict:
      'It breaks. The mines were profitable in 1960 and Belgium expected to keep them; Union Minière ' +
      'kept operating through the secession of Katanga. Nothing about the ledger required the exit. ' +
      'What ran out was the assumption that there was time — a colonial state with no African officer ' +
      'class and almost no African graduates met a mass politics it had spent fifty years pretending ' +
      'would not arrive, and conceded a date rather than fight for one.',
    historians: [
      {
        who: 'Crawford Young',
        work: 'Politics in the Congo: Decolonization and Independence',
        pub: 'Princeton University Press, 1965',
        says:
          'The Belgian colonial state was administratively strong and politically hollow, and the ' +
          'speed of 1960 followed from that hollowness rather than from any calculation of cost.',
      },
      {
        who: 'Adam Hochschild',
        work: 'King Leopold’s Ghost',
        pub: 'Houghton Mifflin, 1998',
        says:
          'The Congo was built as an extraction machine and was still one in 1960, which is why the ' +
          'companies stayed after the flag changed.',
      },
    ],
    adds:
      'Add to the frame: profitability does not hold a colony. Ask who is in a position to force the ' +
      'question, and what the ruling power believes about how much time it has.',
  },
  {
    id: 'lusophone',
    place: 'Angola and Mozambique',
    power: 'Portugal',
    span: '1961–1975',
    engine: 'Settlement and extraction, defended by a dictatorship that called them provinces.',
    setup:
      'Portugal fought three wars at once — Angola from 1961, Guinea-Bissau from 1963, Mozambique from ' +
      '1964 — and refused every offer to negotiate, because the Estado Novo had written the colonies ' +
      'into the constitution as parts of Portugal. On 25 April 1974 Portuguese officers overthrew their ' +
      'own government in Lisbon. Mozambique was independent by June 1975 and Angola by November.',
    answer: 'fits',
    verdict:
      'It fits — and by a mechanism worth having. The cost did end this empire, but it did not do it ' +
      'by emptying a treasury. It did it by breaking the army that was paying, and the army removed ' +
      'the government. The exits followed the coup by a year. Read this case and the claim stops being ' +
      '“empires end when the sums stop working” and becomes “empires end when the cost lands on ' +
      'somebody in the metropole who can act on it”.',
    historians: [
      {
        who: 'Norrie MacQueen',
        work: 'The Decolonization of Portuguese Africa',
        pub: 'Longman, 1997',
        says:
          'The empire was dissolved by a revolution in the metropole, not by defeat in the colonies; ' +
          'the sequence runs Lisbon first, then Luanda and Lourenço Marques.',
      },
      {
        who: 'Malyn Newitt',
        work: 'A History of Mozambique',
        pub: 'Hurst, 1995',
        says:
          'Frelimo had not won the war in the field by 1974, and the transfer that followed the coup ' +
          'handed a movement a state it had not yet taken.',
      },
    ],
    adds:
      'Add to the frame: name who inside the ruling power has to feel the cost before anything changes. ' +
      'A claim that stops at “it got too expensive” has not said who paid or what they did about it.',
  },
];

/* ================================================================ render == */

export function portableSection(api) {
  const node = el('article.tp-move.tp-port', { id: 'tp-move-portable' });

  node.appendChild(el('header.tp-move__head',
    el('p.tp-move__n', 'The test of all four'),
    el('h3.tp-move__name', 'The frame, off this map'),
    el('p.tp-move__strap',
      'A frame that only works on the case it was built from is not a frame. It is a summary. ' +
      'Here are three exits this atlas never draws.')));

  node.appendChild(el('div.tp-move__how',
    el('p.tp-prose__p', { html:
      'This atlas argues that Britain built <strong>four empires with four different engines</strong> — ' +
      'Atlantic slavery, Company land revenue, industrial and strategic expansion, and dissolution — ' +
      'and that the fourth ended when the cost of holding on passed what Britain would pay. ' +
      'That last clause is the strongest claim in the whole application. Below, it is taken away from ' +
      'Britain entirely and run against three other empires. ' +
      '<em>Commit before you read.</em> The point is to have a position when the evidence arrives.' }),
    el('p.cx-note',
      'Nothing on this page is in the dataset, and nothing on it is a quantity. It is dates and books. ' +
      'Every book named here is one you can find in a library, and each historian’s position is written ' +
      'the way its author would write it.')));

  node.appendChild(claimBar());
  node.appendChild(caseSet(api));
  node.appendChild(ownWords());

  return node;
}

function claimBar() {
  return el('div.tp-port__claim',
    el('p.tp-port__claimk', 'The claim under test'),
    el('p.tp-port__claimv', PORTABLE_CLAIM));
}

/* ------------------------------------------------------------ the sorter -- */

function caseSet(api) {
  const saved = storage.get(STORE_KEY, {}) || {};
  const marks = saved.marks || {};
  const tally = el('p.tp-sorter__tally', { role: 'status' });
  const cards = [];

  const update = () => {
    const done = PORTABLE_CASES.filter(c => marks[c.id]).length;
    if (done < PORTABLE_CASES.length) {
      tally.textContent = done + ' of ' + PORTABLE_CASES.length + ' placed. ' +
        'Each case opens as soon as you commit to it.';
      return;
    }
    const right = PORTABLE_CASES.filter(c => marks[c.id] === c.answer).map(c => c.place);
    const wrong = PORTABLE_CASES.filter(c => marks[c.id] !== c.answer).map(c => c.place);
    tally.textContent = 'All three placed. You read ' +
      (right.length ? right.join(' and ') : 'none of them') + ' the way the historians below do' +
      (wrong.length ? ', and ' + wrong.join(' and ') + ' differently. ' : '. ') +
      'Disagreeing is allowed; disagreeing without naming the case that made you is not. ' +
      'The three together say the claim needs a mechanism: not “it cost too much”, but ' +
      '“the cost landed on someone in the metropole who could act on it”.';
  };

  for (const c of PORTABLE_CASES) {
    const reveal = el('div.tp-case__reveal', { hidden: true },
      el('p.tp-port__verdict',
        el('span.tp-port__vk', VERDICTS.find(v => v[0] === c.answer)[1]),
        ' ', c.verdict),
      el('ul.tp-port__hist', ...c.historians.map(h => el('li.tp-port__h',
        el('p.tp-port__hw', el('strong', h.who), ', ',
          el('cite', h.work), ' (' + h.pub + ')'),
        el('p.tp-port__hs', h.says)))),
      el('p.tp-port__adds', el('span.tp-port__addsk', 'What it adds to the frame'), ' ', c.adds));

    const buttons = VERDICTS.map(([v, label]) => {
      const b = el('button.tp-vote', { type: 'button', 'aria-pressed': 'false' }, label);
      b.addEventListener('click', () => {
        marks[c.id] = v;
        const s = storage.get(STORE_KEY, {}) || {};
        s.marks = marks;
        storage.set(STORE_KEY, s);
        buttons.forEach((bb, i) => {
          const on = VERDICTS[i][0] === v;
          bb.setAttribute('aria-pressed', on ? 'true' : 'false');
          bb.classList.toggle('is-on', on);
        });
        reveal.hidden = false;
        update();
      });
      return b;
    });

    const card = el('div.tp-case.tp-port__case', { id: 'tp-port-' + c.id },
      el('p.tp-case__name', c.place,
        el('span.tp-port__power', c.power + ' · ' + c.span)),
      el('p.tp-port__engine', el('span.tp-port__enk', 'Engine'), ' ', c.engine),
      el('p.tp-case__how', c.setup),
      el('div.tp-vote-row', { role: 'group', 'aria-label': 'Where does the claim sit for ' + c.place + '?' },
        ...buttons),
      reveal);

    if (marks[c.id]) {
      const i = VERDICTS.findIndex(([v]) => v === marks[c.id]);
      if (i >= 0) { buttons[i].setAttribute('aria-pressed', 'true'); buttons[i].classList.add('is-on'); }
      reveal.hidden = false;
    }
    cards.push(card);
  }

  update();
  return panel('Place all three before you read one',
    el('p.cx-note',
      'Does the claim fit this exit, strain against it, or break on it? There is no score. ' +
      'A wrong first answer you can explain is worth more than a right one you guessed.'),
    el('div.tp-cases', ...cards),
    tally);
}

/* ------------------------------------------------------- your own words --- */

const SCHEME = [
  ['Names the engine.', 'Says what actually made the empire grow — the machine, not the slogan it used about itself.'],
  ['Names who pushed back.', 'A movement, a position, a demand. “Nationalism” on its own is a label, not an actor.'],
  ['Separates the ledger from the politics.', 'Says whether the cost was money, soldiers, votes or legitimacy, and who felt it.'],
  ['Scopes itself.', 'Names one case the frame does not reach, and says why. Algeria, the Congo and Portugal are all available.'],
  ['Says what would sink it.', 'One piece of evidence that would make you drop the frame. A frame nothing could refute is not a frame.'],
];

const MODEL = [
  'Empires are built by an engine — a specific way of making money or holding a route — and they grow ' +
  'as long as that engine pays and somebody with power keeps feeding it. They end when two things ' +
  'meet: people in the colony organise well enough to make the cost of refusing them real, and ' +
  'somebody in the ruling country who can actually decide is made to feel that cost.',
  'The cost is not always money. In Algeria it was French politics; in Portugal it was the army ' +
  'itself, which removed the government rather than keep fighting. The Congo shows the reverse case: ' +
  'Belgium was still making money in 1960 and left in five months anyway, because it had built a ' +
  'state with no Congolese in it and had no answer when the question was finally put.',
  'The frame does not reach Hong Kong, where a lease signed in 1898 set the date and nobody in Hong ' +
  'Kong was asked. I would drop the frame if I found a run of cases where a ruling power paid a cost ' +
  'it could name, felt it at the top, and stayed anyway.',
];

function ownWords() {
  const saved = storage.get(STORE_KEY, {}) || {};
  const area = el('textarea.tp-write', {
    id: 'tp-write-portable', rows: '8', spellcheck: 'true',
    placeholder: 'Write the frame as you would say it to someone who has never opened this atlas. ' +
      'Forty words unlocks the model.',
    'aria-describedby': 'tp-count-portable',
  });
  area.value = saved.words || '';

  const count = el('p.tp-count', { id: 'tp-count-portable' });
  const reveal = el('button.btn.btn--primary.tp-reveal', { type: 'button' },
    'Show a model, and how to mark yourself');
  const answer = el('div.tp-model', { hidden: true });

  const refresh = () => {
    const n = words(area.value);
    const short = Math.max(0, MIN_WORDS - n);
    count.textContent = n + (n === 1 ? ' word' : ' words') +
      (short ? ' — ' + short + ' more and the model unlocks' : ' — the model is unlocked');
    count.classList.toggle('is-ready', !short);
    reveal.disabled = !!short;
  };
  area.addEventListener('input', () => {
    refresh();
    const s = storage.get(STORE_KEY, {}) || {};
    s.words = area.value;
    storage.set(STORE_KEY, s);
  });
  refresh();
  reveal.addEventListener('click', () => {
    if (reveal.disabled) return;
    answer.hidden = false;
    reveal.hidden = true;
    const h = answer.querySelector('.tp-model__h');
    if (h && h.focus) h.focus();
  });

  fill(answer,
    el('h4.tp-model__h', { tabindex: '-1' }, 'A model, and how to mark yourself'),
    el('blockquote.tp-model__body', ...MODEL.map(p => el('p', p))),
    el('p.tp-model__note',
      'This is one answer, not the answer. If yours names a different engine or a different case and ' +
      'still ticks five lines, it is the better answer, because it is yours.'),
    scheme());

  return el('div.tp-do.tp-port__own',
    head('Now say it in your own words'),
    el('p.tp-q', el('span.tp-q__mark', 'Q'),
      'In four or five sentences: what makes an empire grow, what makes one end, and what would make ' +
      'you abandon your own answer?',
      el('span.tp-q__marks', 'no marks — this one is the whole point')),
    el('p.cx-note',
      'This is the test that matters, and it is the last thing in the Workshop on purpose. ' +
      'A frame you can only use on the case you learned it from is not a frame. ' +
      'If you can write yours without naming Britain, you have one.'),
    el('div.tp-write-wrap',
      el('label.tp-write__label', { for: 'tp-write-portable' },
        'Your frame. It stays in this browser and goes nowhere else.'),
      area, count, reveal, answer));
}

function scheme() {
  const out = el('div.tp-scheme');
  const tally = el('p.tp-scheme__tally');
  const boxes = [];
  const update = () => {
    const n = boxes.filter(b => b.checked).length;
    tally.textContent = 'You have ticked ' + n + ' of ' + boxes.length + '. ' +
      (n === boxes.length ? 'That is a frame, not a summary.'
        : n >= boxes.length - 1 ? 'One line short. It is a sentence, not a rewrite.'
          : 'The unticked lines are the ones that make it portable.');
  };
  out.appendChild(head('Mark scheme — tick what your answer actually does'));
  out.appendChild(el('ul.tp-scheme__list', ...SCHEME.map((item, i) => {
    const cb = el('input', { type: 'checkbox', id: 'tp-ps-' + i });
    cb.addEventListener('change', update);
    boxes.push(cb);
    return el('li.tp-scheme__i', cb,
      el('label', { for: 'tp-ps-' + i }, el('strong', item[0]), ' ', el('span', item[1])));
  })));
  out.appendChild(tally);
  update();
  return out;
}
