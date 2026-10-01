/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const IDS = ['british-india','bengal-presidency','egypt','kenya','new-zealand','barbados','jamaica','hong-kong','ireland','gold-coast','nigeria','southern-rhodesia','malta','gibraltar','ascension','singapore','aden-colony','palestine-mandate','iraq-mandate','cyprus','sierra-leone','british-guiana','newfoundland','canada','australia','union-of-south-africa','hyderabad','punjab-province','zanzibar','uganda','british-honduras','fiji','ceylon','british-burma','sokoto-caliphate','ashanti','tristan-da-cunha','chagos','british-indian-ocean-territory','falkland-islands'];
const BANNED = [/\bacquired\b/i,/\bpacified\b/i,/\bunrest\b/i,/\bnatives?\b/i,/\btribal?\b/i,/\bgranted\s+(independence|it\s+independence)/i,/mixed legacy/i,/rich tapestry/i,/played a key role/i,/lasting legacy/i,/both sides/i,/it is important to note/i,/arguably/i,/many would say/i,/\bslaves\b/i,/civilising mission/i];
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  const rows = [];
  for (const id of IDS) {
    for (const y of [1800, 1913, 1955]) {
      await page.evaluate(([i,yy]) => { location.hash = '#year=' + yy + '&sel=' + i; }, [id,y]);
      await page.waitForTimeout(330);
      const r = await page.evaluate(() => {
        const el = document.querySelector('.dossier');
        if (!el) return {t:'', missing:0, unsourced:0, danger:0, none:true};
        // expand nothing; take full innerText of the scrollable panel
        return {
          t: el.innerText,
          danger: el.querySelectorAll('.defect, .danger, [class*=defect]').length,
          dangerText: [...el.querySelectorAll('.defect, [class*=defect]')].map(n=>n.textContent).join(' | ').slice(0,300),
          h: el.scrollHeight,
        };
      });
      if (r.none) { rows.push({id,y,err:'no dossier'}); continue; }
      const hits = [];
      for (const b of BANNED) { const m = r.t.match(b); if (m) { const i = r.t.indexOf(m[0]); hits.push(m[0] + ' :: ' + r.t.slice(Math.max(0,i-70), i+70).replace(/\n/g,' ')); } }
      rows.push({id, y, len: r.t.length, danger: r.danger, dangerText: r.dangerText, hits});
    }
  }
  for (const r of rows) log(JSON.stringify(r));
};
