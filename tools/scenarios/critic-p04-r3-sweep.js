/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const ids = await page.evaluate(() => window.BEA.data.territories.map(t=>t.id));
  log('N territories:', ids.length);
  log('first10:', JSON.stringify(ids.slice(0,10)));
  const BANNED = ['acquired','pacified','unrest','mixed legacy','rich tapestry','played a key role','left a lasting legacy','both sides','arguably','many would say','it is important to note','the natives'];
  const res = await page.evaluate(async ({ids, BANNED}) => {
    const out = { banned: [], noActors: [], missingDanger: [], unsourced: [], empty: [], franchiseMissing: [], lens: [] };
    const sleep = ms => new Promise(r=>setTimeout(r,ms));
    for (const id of ids) {
      window.BEA.store.act.select(id);
      await sleep(28);
      const el = document.querySelector('.app__dossier');
      const txt = el ? el.innerText : '';
      if (!txt || txt.length < 200) { out.empty.push([id, txt.length]); continue; }
      // banned strings check — strip quoted spans? crude: whole text
      const low = txt.toLowerCase();
      for (const b of BANNED) {
        let i = low.indexOf(b);
        while (i >= 0) { out.banned.push([id, b, txt.slice(Math.max(0,i-80), i+80).replace(/\n/g,' ')]); i = low.indexOf(b, i+1); if (out.banned.length>200) break; }
      }
      if (low.includes('[missing local actors]')) out.missingDanger.push(id);
      if (low.includes('[unsourced]')) out.unsourced.push(id);
      if (!low.includes('who could vote')) out.franchiseMissing.push(id);
    }
    return out;
  }, { ids, BANNED });
  log('EMPTY:', JSON.stringify(res.empty).slice(0,2000));
  log('MISSING LOCAL ACTORS:', JSON.stringify(res.missingDanger));
  log('UNSOURCED:', JSON.stringify(res.unsourced));
  log('NO "WHO COULD VOTE":', res.franchiseMissing.length, JSON.stringify(res.franchiseMissing).slice(0,1500));
  log('BANNED HITS:', res.banned.length);
  for (const b of res.banned.slice(0,60)) log('  BAN', b[0], '|', b[1], '|', b[2]);
};
