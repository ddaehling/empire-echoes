/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const IDS=['british-india','kenya','egypt','new-zealand','barbados','jamaica','hong-kong','ireland','gold-coast','nigeria','southern-rhodesia','malta','gibraltar','ascension','singapore','commonwealth-of-australia','mandatory-palestine','mesopotamia-iraq','cyprus','sierra-leone','newfoundland','canada','union-of-south-africa','hyderabad','zanzibar','uganda','fiji','ceylon','british-burma','sokoto-caliphate','bermuda','tristan-da-cunha','falkland-islands','weihaiwei','aden-protectorate'];
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  const fails=[];
  for (const id of IDS) {
    await page.evaluate((i)=>{location.hash='#year=1913&sel='+i;}, id);
    await page.waitForTimeout(430);
    const r = await page.evaluate(() => {
      const a = document.querySelector('.app__dossier');
      const el = document.querySelector('.dossier');
      if (!el) return {err:'none'};
      const ar = a.getBoundingClientRect();
      const scrolled = a.scrollTop || (el.querySelector('.dossier__body')||{}).scrollTop || 0;
      const find = (txt) => {
        const n = [...el.querySelectorAll('h3,p,div,span')].find(x => x.textContent.trim().toUpperCase().startsWith(txt));
        if (!n) return null;
        const b = n.getBoundingClientRect();
        return { top: Math.round(b.top), bottom: Math.round(b.bottom), inFold: b.bottom <= ar.bottom + 1 };
      };
      const name = el.querySelector('h2');
      return {
        scrolled,
        asideBottom: Math.round(ar.bottom),
        name: name ? name.textContent.trim() : null,
        status: find('LEGAL STATUS'),
        taken: find('HOW IT WAS TAKEN'),
        ended: find('HOW IT ENDED'),
        franchise: find('WHO COULD VOTE'),
        franchiseText: (()=>{ const n=[...el.querySelectorAll('*')].find(x=>x.textContent.trim().toUpperCase().startsWith('WHO COULD VOTE')&&x.children.length<4); return n?n.textContent.trim().slice(0,110):null; })(),
      };
    });
    const bad = ['status','taken','ended','franchise'].filter(k => !r[k] || !r[k].inFold);
    log(id + ' | ' + (bad.length? 'FOLD-FAIL ['+bad.join(',')+']' : 'ok') + ' | franchise: ' + (r.franchiseText||'(ABSENT)'));
    if (bad.length) fails.push(id);
  }
  log('FOLD FAILURES: ' + fails.length + ' of ' + IDS.length + ' :: ' + fails.join(', '));
};
