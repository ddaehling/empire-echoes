/**
 * teacher/methods.js — how this was made, where it takes a position, and what
 * it does not know.
 *
 * DIDACTIC_SPEC §5.8: a book has a named author, a publisher and a date, and
 * students extend it credit an unbranded website has to earn. The only way to
 * earn it is to show the workings and to name the weaknesses before a critic
 * does. So this panel prints the two charges we CONCEDE to print — FEATURE_SPEC
 * §1 rows 12 and 14 — in our own words rather than in the spec's, and it prints
 * the list of things this atlas cannot do without hedging any of them.
 *
 * Two blocks are computed rather than written: the fifteen legal forms with
 * their control degrees, read out of the dataset manifest; and what is actually
 * running in this build, read out of the module registry. A methods note that
 * describes a build other than the one in front of you is worse than none.
 */

import { el, fill } from '../core/util.js';
import { panel, head } from './parts.js';

export function renderMethods(root, api) {
  const { corpus } = api;
  fill(root,
    el('div.tp-prose.tp-page__intro',
      el('p.tp-lede-p',
        'Everything below is checkable. The dataset is plain JSON in ' +
        'app/data/territories/, one file per region; there is no build step and nothing is ' +
        'fetched from the internet. If a claim here is wrong, it is wrong in a file you can open.'),
      el('p.tp-version', 'Content version: ', el('span.num', corpus.version.string))),

    howMade(corpus),
    whatControlledMeans(corpus),
    positions(),
    rejected(),
    notKnown(),
    conceded(),
    stored(),
    running(api),
    disagree(),
  );
}

/* --------------------------------------------------------------- how -- */

function howMade(corpus) {
  const c = (corpus.manifest.meta && corpus.manifest.meta.counts) || {};
  return panel('How it was built',
    el('p.tp-prose__p', { html:
      'The unit of the dataset is a <strong>territory</strong> — a historical entity such as ' +
      'Barbados, Bengal or British India — and separately a <strong>unit</strong>, which is a piece ' +
      'of geometry on the map. One territory covers many units, and one unit can be claimed by ' +
      'different territories at different times, which is why a princely state can sit inside ' +
      'British India without either of them being wrong.' }),
    el('p.tp-prose__p',
      'Each territory carries its extent over time and its constitutional status over time as two ' +
      'separate lists. The app crosses them into spans — one status, on one set of units, over one ' +
      'stretch of years — and a span is the thing the map paints. That crossing is where a lot of ' +
      'atlases quietly cheat, because it forces you to say what status a place had in a year rather ' +
      'than colouring it in and moving on.'),
    el('ul.tp-counts',
      countLine(c.territories || corpus.shards.reduce((n, s) => n + (s.payload.territories || []).length, 0), 'territories'),
      countLine(c.events || corpus.shards.reduce((n, s) => n + (s.payload.events || []).length, 0), 'events'),
      countLine(corpus.stats.total, 'figures, every one in the ledger'),
      countLine(corpus.shards.length, 'region files you can open in a text editor')),
    el('p.cx-note',
      'To check the dataset yourself: ', el('code', 'node tools/validate-data.js --strict'),
      '. It fails on a death toll with no note saying who counted, a low-confidence claim with no ' +
      'note saying what is disputed, a future-dated citation, a page-number locator, a date that ' +
      'runs backwards, and an invented unit id. We do not print the date of the last clean run, ' +
      'because a date printed on a page goes stale and the command does not.'),
    el('p.cx-note',
      'What you will see when you run it: no errors, and a small number of warnings that are ' +
      'arguments rather than typos. Australia’s and New Zealand’s British status ends decades after ' +
      'their independence is conventionally dated, because neither has an independence day and the ' +
      'lawyers disagree; Iraq’s formal independence in 1932 is followed by twenty-six years in which ' +
      'British troops and bases stayed. The checker flags exactly the cases this atlas exists to show ' +
      'you, which is the checker working.'));
}

function countLine(n, what) {
  return el('li.tp-counts__i', el('span.tp-counts__n.num', String(n)), ' ', what);
}

/* ------------------------------------------------------- what controlled -- */

function whatControlledMeans(corpus) {
  const st = (corpus.manifest.statuses || []).slice()
    .sort((a, b) => (b.controlDegree || 0) - (a.controlDegree || 0) || (a.order || 0) - (b.order || 0));
  /* A four-column table in a 255px rail is a table read four columns at a time
     through a sideways scrollbar. Fifteen legal forms with a degree, a threshold
     answer and a sentence are a list of records, and a list is what a column
     wants. Nothing is dropped: every cell that was a column is a field here. */
  const rows = st.map(s => el('li.tp-forms__i',
    el('p.tp-forms__n', s.label),
    el('p.tp-forms__d',
      el('span.tp-forms__deg', 'degree ', el('span.num', String(s.controlDegree === undefined ? '—' : s.controlDegree))),
      el('span.tp-forms__cc', { dataset: { on: s.controlled ? 'yes' : 'no' } },
        s.controlled ? 'counted as controlled' : 'not counted as controlled')),
    (s.short || s.definition) ? el('p.tp-forms__w', s.short || s.definition) : null));
  return panel('What “British” means here — and why the app makes you choose',
    el('p.tp-prose__p',
      'There is no single answer to “was this place British in 1900?”, and an atlas that pretends ' +
      'otherwise is teaching the wrong thing. Every status in this dataset carries a control degree ' +
      'from 0 to 5, and the map lets you set the threshold: a claimed empire, an administered one, ' +
      'a directly ruled one, or one that includes places Britain never claimed and could not be ' +
      'refused by. The same year gives four different maps and four different totals. That is not ' +
      'an interface feature; it is the argument.'),
    el('ul.tp-forms', { 'aria-label': 'The legal forms in this dataset, each with its control degree and whether the app counts it as controlled' },
      ...rows),
    el('p.cx-note',
      'Read from the dataset manifest as this page drew, not typed here. ' +
      'Control degree decides what is drawn at all; it is never a second colour ramp, because a ' +
      'hatch-density gradient on Gibraltar and Barbados is illegible and teaches nothing.'));
}

/* ---------------------------------------------------------- our positions -- */

function positions() {
  return panel('Where this atlas takes a position',
    el('p.tp-prose__p',
      'Declaring a stance is better than smuggling one. These are ours, and each is arguable.'),
    el('dl.tp-pos',
      pos('The spine is four overlapping empires, not one.',
        'Atlantic, Company, imperial, dissolution — each with a different engine, running at the ' +
        'same time as the others. A single 1600 to 1997 line teaches that empire was one thing that ' +
        'got bigger and then smaller, and that is the belief we most want to displace.'),
      pos('“Granted” is not used of independence.',
        'The word appears nowhere in this app outside a quotation. Britain set dates and drew ' +
        'borders; it did not choose whether to go. Conceding what Britain did control is the more ' +
        'accurate version and also the more damning one.'),
      pos('Conquest is called conquest.',
        'Not acquisition, not pacification. Where the plain word is contested — whether 1857 was a ' +
        'mutiny or a first war of independence — the dispute is shown as a dispute, because what ' +
        'you call it is an argument about what it was.'),
      pos('Numbers get ranges, and ranges get reasons.',
        'A confident round number where historians disagree is a lie of format. Partition’s dead ' +
        'appear here as 200,000 to 2,000,000 with a note saying nobody counted; the ledger lists ' +
        'every figure that lacks a range so you can see where we are still doing it.'),
      pos('The informal empire is drawn as an argument, not a measurement.',
        'Places under British pressure without British sovereignty carry no fill and no claimed ' +
        'border, because that distinction is the content. The layer names Gallagher and Robinson ' +
        '(1953) and names the standard objection: stretched far enough, “informal empire” becomes ' +
        'unfalsifiable.'),
      pos('We do not average moral claims into “mixed”.',
        'Empire built railways and law courts, and built them to move goods to ports and enforce ' +
        'its own rule; the same decades produced famines that killed millions. Both are stated with ' +
        'evidence, and the student is asked which evidence moved them.')));
}

function pos(k, v) { return [el('dt.tp-pos__k', k), el('dd.tp-pos__v', v)]; }

/* ------------------------------------------------------------- rejected -- */

const REJECTED = [
  ['“First and Second British Empire” (Harlow’s swing to the east)',
    'Still common in textbooks, and it makes 1783 the hinge, implying a clean Atlantic-to-Asian ' +
    'pivot. The same decades that lost America won Bengal. We mark 1783 as a shock inside the ' +
    'Atlantic phase, not as an ending — but students will meet this scheme, so it is named here.',
    'C. A. Bayly, Imperial Meridian (1989); P. J. Marshall, The Making and Unmaking of Empires (2005).'],
  ['Formal against informal empire',
    'Analytically superb, and we use it as a layer rather than as the spine, because “informal” is ' +
    'invisible on a map of colours and would leave a fifteen-year-old with no shape to hold.',
    'John Gallagher and Ronald Robinson, “The Imperialism of Free Trade” (1953).'],
  ['Metropole-centred: Elizabethan, Georgian, Victorian, post-war',
    'Organises the history of a quarter of the world by British domestic politics, which is exactly ' +
    'the vantage point we are trying to decentre.', null],
  ['Region by region',
    'How atlases usually work, and how students end up with four disconnected stories and no ' +
    'chronology. We offer it as a filter and never as the spine.', null],
  ['Resistance-centred: 1791, 1831, 1857, 1919, 1947, 1952',
    'Morally attractive and it explains a great deal. We embed all six as beats but do not ' +
    'periodise by them, because periodising by them would imply resistance mattered only when it ' +
    'produced a British reaction.',
    'Priyamvada Gopal, Insurgent Empire (2019).'],
];

function rejected() {
  return panel('Periodisations we considered and rejected',
    el('p.tp-prose__p',
      'This is on the record because it is genuine historical thinking and because you should be ' +
      'able to disagree with us on the same evidence.'),
    el('ul.tp-rej', ...REJECTED.map(([k, why, read]) => el('li.tp-rej__i',
      el('p.tp-rej__k', k),
      el('p.tp-rej__w', why),
      read ? el('p.tp-rej__r', el('span.cx-src__kind', 'Read the other case'), ' ', read) : null))));
}

/* -------------------------------------------------------- what we lack -- */

const GAPS = [
  ['The geometry is coarse where the history is fine.',
    'There are 302 map units for 260 territories. Treaty ports have no polygons; the informal ' +
    'sphere is drawn from nodes such as Buenos Aires, Tehran, Istanbul, Weihaiwei, Montevideo, ' +
    'Bangkok, Muscat and Macau. A haze on a map is not a measurement and is captioned as an argument.'],
  ['Frontiers are drawn as lines that were not lines.',
    'Every boundary here is a modern rendering of a claim. In much of Africa, Australia and northern ' +
    'India the line on a nineteenth-century map marked what a European government asserted, not ' +
    'what anybody administered or what anyone living there recognised.'],
  ['Half the figures have no range.',
    'The ledger counts them. An area given as a single number for a territory whose borders moved ' +
    'is a convention, and a population census taken by a colonial administration is a record of what ' +
    'that administration could count and chose to count.'],
  ['Most citations back the record, not the number.',
    'The ledger has a column for this and it is the column that shows us worst. A book about ' +
    'Barbados stands behind the Barbados entry; it is not a source for the area of Barbados in 1834.'],
  ['The archive is unevenly destroyed, and we can only report what is known to be missing.',
    'Where records were removed or burned we draw the territory as a hole with its coastline and ' +
    'say who removed them, when and under what instruction. Where a silence has not been documented ' +
    'we cannot draw it, and a map of documented silences understates the silence.'],
  ['The voices are unevenly held.',
    'The transcribed primary texts in this atlas are tagged by who made them — a British official, ' +
    'somebody from the place, or a document both parties signed — and the tally is published inside ' +
    'the dossier rather than left for a critic to count. It is not balanced, and saying so is more ' +
    'use to a student than pretending otherwise.'],
  ['It is in English.',
    'Two texts are given in the language they were signed in. Everything else is in English, ' +
    'including quotations from people who were not writing in it, and translation is an ' +
    'interpretation every time.'],
];

function notKnown() {
  return panel('What this atlas does not know',
    el('ul.tp-gaps', ...GAPS.map(([k, v]) => el('li.tp-gaps__i',
      el('p.tp-gaps__k', k), el('p.tp-gaps__v', v)))));
}

/* --------------------------------------------------------- the two we lose */

function conceded() {
  return el('section.cx-panel.tp-block.tp-concede',
    el('h3.cx-panel__title.tp-block__title', 'Two things a printed chapter does better, in our words'),
    el('p.tp-prose__p',
      'Fifteen arguments were made against interactive teaching material and for the printed page. ' +
      'We think we beat most of them. Two we do not, and pretending otherwise would cost more ' +
      'credibility than admitting it.'),

    el('article.tp-concede__i',
      el('p.tp-concede__n', 'Conceded, one'),
      el('h4.tp-concede__t', 'What gets measured gets taught, and we chose what to measure.'),
      el('p.tp-prose__p',
        'Software is built by watching what people use. Whatever is easy to count starts steering ' +
        'the product, and the parts of this history that matter most — a famine explained as ' +
        'entitlement failure rather than weather, a treaty in two languages that do not match — are ' +
        'exactly the parts nobody would call engaging. A printed chapter has no such feedback loop. ' +
        'It is fixed by an author and an editor, and the boring, difficult, load-bearing paragraph ' +
        'survives because nothing in the process rewards deleting it.'),
      el('p.tp-prose__p',
        'What we did about it: you cannot optimise a number you never collect. This app records ' +
        'nothing about how you use it. No dwell time, no click counts, no session length, no ' +
        '“most popular territory”, nothing sent anywhere. What we do keep is your own writing, in ' +
        'your own browser, so a reload does not eat it. That is a rule enforced by architecture ' +
        'rather than by good intentions — but a future owner could delete the rule, and the printed ' +
        'chapter has no rule to delete.')),

    el('article.tp-concede__i',
      el('p.tp-concede__n', 'Conceded, two'),
      el('h4.tp-concede__t', 'A page number means the same thing in March. A deploy does not.'),
      el('p.tp-prose__p',
        'A curriculum is built on permanence. A teacher sets page 214 and it is page 214 in March, ' +
        'in every copy in the room, and it will be page 214 when the school buys the same edition ' +
        'in three years. We cannot promise that. This app can be changed by whoever holds the ' +
        'folder, and a link that opened one thing in September can open a different thing later ' +
        'without announcing it.'),
      el('p.tp-prose__p',
        'What we did about it, and it is containment rather than victory: no framework, no build ' +
        'step, no fonts or scripts from the internet, so this is a folder that runs from a memory ' +
        'stick on a school network in 2031. The URL keys are a documented contract. Every printed ' +
        'sheet and every link carries the content version above, which is computed from the data ' +
        'itself, so a changed dataset produces a changed stamp and a teacher can see that a link ' +
        'has moved under them.'),
      el('p.tp-prose__p',
        'The honest position: the permanent objects here are the printed ones. The app is the ' +
        'machine that makes a page. The page is what survives a browser upgrade.')));
}

/* ------------------------------------------------------------- storage -- */

function stored() {
  return panel('What this app keeps, and where',
    el('ul.tp-store',
      el('li', el('strong', 'In this browser, and nowhere else.'),
        ' Your workshop paragraphs, so a reload does not lose an essay; which of the three answers ' +
        'you chose on each of the four move cards in the lesson; where you placed each case in the ' +
        'two scope tests; the frame you wrote in your own words; which territories you have opened; ' +
        'your theme and motion settings. Three keys, all beginning ',
        el('code', 'bea:teacher.'),
        '. Clearing site data removes all of it, and the printed revision sheet is how you take it ' +
        'out before you do.'),
      el('li', el('strong', 'Never.'),
        ' Time on page, click counts, scroll depth, mouse position, a device identifier, an account, ' +
        'anything sent over a network. This app makes no network requests after it loads.'),
      el('li', el('strong', 'In the address bar.'),
        ' The year, the selection, the layer and the open surface — because that is what makes a ' +
        'link teachable. It is visible to you and to anybody you send it to, and to nobody else.')));
}

/* -------------------------------------------------------- this build --- */

function running(api) {
  let report = null;
  try { report = api.registry && api.registry.report ? api.registry.report() : null; } catch (_) { report = null; }
  const name = (m) => (typeof m === 'string' ? m : (m && (m.id || m.path)) || String(m));
  const list = (label, arr, note) => {
    const a = (arr || []).map(name).filter(Boolean);
    if (!a.length) return null;
    return el('li.tp-build__i', el('strong', label), ' ', a.join(', '), note ? el('span.cx-note', ' ' + note) : null);
  };
  return panel('What is running in this build, right now',
    report
      ? el('ul.tp-build',
        list('Running:', report.mounted),
        list('Not installed:', report.absent, '— these are pieces of the design that have not been built yet.'),
        list('Failed to start:', report.failed, '— a bug. The rest of the atlas carries on without them.'),
        list('Switched off:', report.disabled))
      : el('p.cx-note', 'The module registry did not answer, so this build cannot describe itself. That is a bug.'),
    el('p.cx-note',
      'Read from the registry as this page drew. A methods note that describes a different build ' +
      'from the one in front of you is worse than no methods note.'));
}

/* ------------------------------------------------------------ disagree -- */

function disagree() {
  return panel('How to disagree with this atlas',
    el('ol.tp-dis',
      el('li', el('strong', 'Take a number to the ledger.'),
        ' Open the Evidence tab, sort by confidence, and find a row whose citation you think does ' +
        'not carry the figure. The shard and the JSON path are on the row, so you can point at the ' +
        'exact line rather than at the app.'),
      el('li', el('strong', 'Argue with the threshold.'),
        ' Change what “British” means on the map and see which of our claims survive. Several ' +
        'sentences in this app are true at one control degree and false at another; that is a real ' +
        'objection and the app is built so you can make it.'),
      el('li', el('strong', 'Argue with the spine.'),
        ' Four overlapping empires is a choice. The alternatives are listed above, with the works ' +
        'that make each case, and if one of them explains more than ours does, ours is wrong.'),
      el('li', el('strong', 'Argue with the silence.'),
        ' Look at whose words this atlas holds and whose it does not, and at which regions have ' +
        'three citations and which have thirty. The imbalance is a finding about the archive and ' +
        'also a finding about us.')),
    el('p.cx-note',
      'Inviting you to check us is worth more than asserting that we are right. ' +
      'It is also the only kind of authority an unsigned website can honestly have.'));
}
