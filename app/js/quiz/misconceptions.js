/**
 * quiz/misconceptions.js — the eighteen of DIDACTIC_SPEC §4, as a manifest a
 * test can hold the app to.
 *
 * WHY THIS FILE EXISTS. §4 is emphatic that stating a correct fact does not
 * displace a wrong model: the wrong model has to be ACTIVATED, contradicted by
 * evidence the student processes themselves, and then REPLACED by a model that
 * explains the same things better. "Build all three or you have built nothing."
 * Before this pass four of the eighteen — M7, M11, M12 and M15 — appeared
 * nowhere in the app under any tag, including M15, which is the rubric's own
 * named example of a *sympathetic* oversimplification and the one a good
 * student is most likely to arrive holding.
 *
 * WHAT IS IN HERE AND WHAT IS NOT. The belief is §4's, in the student's voice,
 * because that is the sentence the activation has to make them commit to. The
 * `owner` is §4's own assignment, kept so the table can say when a
 * misconception is being carried by the quiz on another piece's behalf. What
 * is NOT here is the teaching: the activation, the disconfirming evidence and
 * the replacement model are the bank item's `question`, `correction` and
 * `because`, they are resolved against the live dataset at runtime, and
 * `audit()` below reads them back out of the resolved items rather than
 * restating them. A manifest that repeated the teaching could drift away from
 * it; one that reads it cannot.
 *
 * THE CHECK. `tools/scenarios/p10-misconceptions.js` drives the running app,
 * opens every item this file names, answers each one WRONG, and prints what
 * the student actually sees at each of the three stages. A misconception with
 * no activation, or with an activation that offers no evidence, fails there.
 */

/**
 * §4, in order. `belief` is what a student says OUT LOUD in a classroom, not
 * §4's own paragraph heading: it is printed back at them as a control they can
 * press, and measured at 390×844 the control gives it two lines. Twelve words
 * is the budget, and a belief nobody would actually say is not an activation.
 */
export const MISCONCEPTIONS = [
  { id: 'M1', belief: 'The empire was mostly settled by British people who moved there.', owner: 'viz (population treemap) + tours beat 4', pathOwned: true },
  { id: 'M2', belief: 'India was conquered by the British government.', owner: 'tours (India chapter) + panels (India dossier legal-status field)', pathOwned: true },
  { id: 'M3', belief: 'Decolonisation was a peaceful, planned handover — Britain decided to leave.', owner: 'tours (dissolution chapter) + map exit-type layer', pathOwned: true },
  { id: 'M4', belief: 'The empire was one solid pink block that grew, then shrank.', owner: 'map (projection + status recolour) + tours beat 1', pathOwned: true },
  { id: 'M5', belief: '1776 ended the British Empire.', owner: 'viz (extent chart with prediction interaction)', pathOwned: false },
  { id: 'M6', belief: 'Colonies wanted independence and Britain kindly granted it.', owner: 'copy + tours', pathOwned: true },
  { id: 'M7', belief: 'The empire brought railways, law and English, so it developed the colonies.', owner: 'viz + [EXT] historiography card', pathOwned: false },
  { id: 'M8', belief: 'Britain abolished slavery, so Britain was basically the good guy.', owner: 'tours (Atlantic chapter) + T5 counters', pathOwned: true },
  { id: 'M9', belief: 'A small number of Britons ruled by sheer technological superiority.', owner: 'viz (dot chart) + panels', pathOwned: false },
  { id: 'M10', belief: 'The Berlin Conference carved up Africa on a map.', owner: 'map (Africa sequence) + tours', pathOwned: true },
  { id: 'M11', belief: 'Empire made ordinary British people rich.', owner: '[EXT] economics card', pathOwned: false },
  { id: 'M12', belief: 'Nobody at the time thought empire was wrong.', owner: 'tours ("argued at the time") + sources panel', pathOwned: true },
  { id: 'M13', belief: 'The Commonwealth is what the empire naturally became — a family of friends.', owner: 'panels + final tour beat', pathOwned: true },
  { id: 'M14', belief: 'Indian independence in 1947 was the end of the empire.', owner: 'viz (twin charts)', pathOwned: false },
  { id: 'M15', belief: 'Borders drawn with a ruler explain what went wrong afterwards.', owner: 'map (border-origin annotation) + [EXT] card', sympathetic: true, pathOwned: false },
  { id: 'M16', belief: 'The World Wars were European wars that the empire watched.', owner: 'map (war-service layer) + tours', pathOwned: true },
  { id: 'M17', belief: 'Empire is a British story — it is about what Britain did.', owner: 'data schema (local_actors[] required)', pathOwned: false },
  { id: 'M18', belief: 'Historians agree about all this — the facts are settled.', owner: 'everyone', pathOwned: true },
];

export const IDS = MISCONCEPTIONS.map((m) => m.id);

const byId = new Map(MISCONCEPTIONS.map((m) => [m.id, m]));
export const belief = (id) => (byId.get(id) || {}).belief || null;

/** True where §4 itself says the belief is a SYMPATHETIC oversimplification —
 *  §4, M15: "This one guards against a *sympathetic* oversimplification, which
 *  is why it matters." It is set from that sentence and from nothing else. */
export const isSympathetic = (id) => !!(byId.get(id) || {}).sympathetic;

/**
 * THE DEBT A RETRIEVAL MOMENT SHOULD BE SPENT ON — round 3's fix.
 *
 * The lesson has four retrieval moments and eighteen wrong models, so
 * something has to decide which belief a student is actually made to commit
 * on. Before this pass the decider, three keys down the sort in
 * `checkpoint.js`, was `minutes` — an item's POSITION IN THE LESSON. Measured
 * by walking the 24-step route pressing nothing but Next, that produced two
 * checkpoints on T1 and the SAME belief twice (M4, at minute 3, the app's own
 * signature interaction), while M15 at minute 19 could not win a tie against
 * anything at all. Round 2's historian read the consequence off the bank —
 * "M15, M6 and M7 are all onPath:false ... the flagship 24-step route never
 * presents a sympathetic oversimplification, which is the C7 level-5
 * requirement" — and was right about the route, though the cause was here and
 * not in the flags.
 *
 * The tie is broken on DEBT instead of on order. Both keys come out of §4
 * itself and nothing else:
 *
 *   0  the item's own belief is unrepaired and §4 calls it SYMPATHETIC
 *   1  the item's own belief is unrepaired and §4 does not assign it to the
 *      guided path — so a retrieval moment is the only place it can happen
 *   2  the item's own belief is unrepaired
 *   3  only a belief it also repairs is unrepaired
 *   4  every belief it carries has been argued with — or it carries none
 *
 * Rank 0 exists because §4 says of M15 that it "guards against a *sympathetic*
 * oversimplification, which is why it matters": it is the one a good student
 * arrives holding. Rank 1 exists because a scarce moment is worth more spent
 * on a belief nothing else on the route carries than on one the route already
 * teaches with a plate of its own — M4's §4 owner is "map ... + tours beat 1",
 * and beat 1 is where a student meets it whatever this file does.
 *
 * @param item      a resolved bank item
 * @param repaired  Set of misconception ids this student has already committed
 *                  on and been corrected on
 */
export const DEBT_SYMPATHETIC = 0;
export const DEBT_OFF_PATH = 1;
export const DEBT_PRIMARY = 2;
export const DEBT_SECONDARY = 3;
export const DEBT_NONE = 4;

export function debt(item, repaired) {
  const done = repaired || new Set();
  const primary = item && item.misconception;
  const m = byId.get(primary);
  if (m && !done.has(primary)) {
    if (m.sympathetic) return DEBT_SYMPATHETIC;
    if (!m.pathOwned) return DEBT_OFF_PATH;
    return DEBT_PRIMARY;
  }
  if (tagsOf(item).some((x) => !done.has(x))) return DEBT_SECONDARY;
  return DEBT_NONE;
}

/** True while the student's own belief — not one the item merely glances at —
 *  is still standing, which is when it is honest to say the card "goes straight
 *  at" it. */
export const owesPrimary = (d) => d <= DEBT_PRIMARY;

/** Every misconception an item carries: its primary tag plus any it also repairs. */
export function tagsOf(item) {
  const out = [];
  if (item && item.misconception) out.push(item.misconception);
  for (const m of (item && item.alsoMisconceptions) || []) if (!out.includes(m)) out.push(m);
  return out.filter((m) => byId.has(m));
}

/**
 * The coverage table, built from the RESOLVED bank — so an item the dataset
 * could not support is absent here too, and a misconception whose only
 * treatment dropped out reports as uncovered rather than as covered on paper.
 */
export function audit(items) {
  const rows = [];
  for (const m of MISCONCEPTIONS) {
    const mine = (items || []).filter((it) => tagsOf(it).includes(m.id));
    rows.push({
      id: m.id,
      belief: m.belief,
      owner: m.owner,
      sympathetic: !!m.sympathetic,
      pathOwned: !!m.pathOwned,
      covered: mine.length > 0,
      items: mine.map((it) => ({
        id: it.id, kind: it.kind, t: it.t || null, lo: it.lo || null,
        primary: it.misconception === m.id,
        onPath: !!it.onPath, minutes: it.minutes || null,
        activation: it.question || null,
        /* An `explain` item's `correction` is the line that introduces the
           comparison ("Compare your words with this"); the disconfirming
           material is the model answer itself. Reading `correction` first
           for those items made this table report the frame instead of the
           evidence, which is the kind of paper coverage this file exists
           to refuse. */
        evidence: (it.kind === 'explain' ? (it.model || it.correction) : (it.correction || it.model)) || null,
        replacement: it.because || null,
        source: it.source || null,
      })),
    });
  }
  return rows;
}

/**
 * Which misconception this student has never yet been made to commit on.
 * Answering ANY item that carries a misconception counts as having met it:
 * one commit-then-correct per belief is the budget, and asking a student to
 * recant the same belief twice in half an hour is nagging, not teaching.
 */
export function unmet(items, hasRecord) {
  const met = new Set();
  for (const it of items) if (hasRecord(it)) for (const m of tagsOf(it)) met.add(m);
  return IDS.filter((id) => !met.has(id));
}

export default { MISCONCEPTIONS, IDS, belief, isSympathetic, debt, owesPrimary, tagsOf, audit, unmet };
