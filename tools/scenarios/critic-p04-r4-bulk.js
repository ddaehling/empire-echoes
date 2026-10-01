/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const { fixGrid } = require('./critic-p04-r4-lib.js');
const IDS = ['virginia','jamaica','barbados','ireland','newfoundland','canada','gibraltar','malta','cyprus','commonwealth-of-australia','new-zealand','british-india','ceylon','british-burma','hong-kong','aden-colony','egypt','anglo-egyptian-sudan','gold-coast','nigeria','kenya','tanganyika','southern-rhodesia','mauritius','mandatory-palestine','mesopotamia-iraq','saint-helena','ascension','falkland-islands','punjab-province','bengal-presidency','sierra-leone','the-gambia','uganda','zanzibar','fiji','tonga','bermuda','trinidad','cape-colony','natal','transvaal-colony','basutoland','bechuanaland','nyasaland','british-somaliland','no-such-place'];
const BANNED = [/\bacquired\b/i,/\bpacified\b/i,/\bunrest\b/i,/\bmixed legacy\b/i,/\brich tapestry\b/i,/\bplayed a key role\b/i,/\bboth sides\b/i,/\bit is important to note\b/i,/\barguably\b/i,/\bmany would say\b/i,/\bnatives\b/i,/\bgranted independence\b/i,/\bleft a lasting legacy\b/i];
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await fixGrid(page, log);
  const bad = [], noActor = [], missField = [], empty = [];
  for (const id of IDS) {
    await page.evaluate(i => { location.hash = `#year=1900&sel=${i}`; }, id);
    await page.waitForTimeout(320);
    const r = await page.evaluate(() => {
      const d = document.querySelector('#dossier');
      if (!d) return null;
      const t = d.innerText;
      return { len: t.length, t: t,
        hasStatus: /LEGAL STATUS/i.test(t), hasTaken: /HOW IT WAS TAKEN|IN 19\d\d Britain had taken/i.test(t),
        hasEnd: /HOW IT ENDED|still|Britain held nothing/i.test(t), hasVote: /WHO COULD VOTE/i.test(t),
        unsourced: (t.match(/\[unsourced\]/g)||[]).length, missing: (t.match(/\[missing[^\]]*\]/g)||[]).join(',')
      };
    });
    if (!r || r.len < 200) { empty.push(id + ' len=' + (r&&r.len)); continue; }
    for (const b of BANNED) { const m = r.t.match(b); if (m) bad.push(id + ' :: ' + m[0] + ' :: ...' + r.t.slice(Math.max(0,r.t.search(b)-70), r.t.search(b)+70).replace(/\n/g,' ')); }
    if (!(r.hasStatus && r.hasVote)) missField.push(id + ' status=' + r.hasStatus + ' vote=' + r.hasVote);
    if (r.missing) noActor.push(id + ' -> ' + r.missing);
    if (r.unsourced) noActor.push(id + ' UNSOURCED x' + r.unsourced);
  }
  log('EMPTY/short dossiers:', JSON.stringify(empty));
  log('BANNED STRING HITS (' + bad.length + '):'); bad.slice(0,25).forEach(b=>log('  ' + b));
  log('MISSING FIELDS:', JSON.stringify(missField));
  log('MISSING/UNSOURCED MARKS:', JSON.stringify(noActor));
};
