/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const out = await page.evaluate(async () => {
    const d = window.BEA.data, store = window.BEA.store;
    const ids = d.territories.map(t => t.id);
    const banned = [/\bacquired\b/i, /\bpacified\b/i, /\bnatives?\b/i, /\bunrest\b/i, /\bgranted\b/i,
      /\btribal?\b/i, /rich tapestry/i, /played a key role/i, /lasting legacy/i, /\bboth sides\b/i,
      /it is important to note/i, /\barguably\b/i, /many would say/i, /mixed legacy/i, /civilising mission/i];
    const res = { n:0, hits: [], unsourced: 0, unsourcedT: [], missingActors: [], noEvidence: [], empty: [], totalChars: 0, worst: null };
    const host = () => document.querySelector('.app__dossier');
    for (const id of ids) {
      const t = d.get(id);
      const spans = t.spans || [];
      const y = spans.length ? Math.round((spans[0].start + (spans[spans.length-1].end || 1997))/2) : 1900;
      store.batch(dis => { dis('setYear', y); dis('select', id); });
      await new Promise(r => setTimeout(r, 0));
      await new Promise(r => requestAnimationFrame(r));
      const h = host(); const txt = h ? h.innerText : '';
      res.n++; res.totalChars += txt.length;
      if (!txt || txt.length < 200) res.empty.push(id + '@' + y + ' len=' + txt.length);
      for (const b of banned) { const m = txt.match(b); if (m) res.hits.push(id+'@'+y+' :: '+b+' :: '+txt.slice(Math.max(0,txt.indexOf(m[0])-90), txt.indexOf(m[0])+90).replace(/\n/g,' ')); }
      const u = (txt.match(/\[unsourced\]/g)||[]).length; res.unsourced += u;
      if (u) res.unsourcedT.push(id+':'+u);
      if (txt.includes('[missing local actors]')) res.missingActors.push(id);
      if (!/THE EVIDENCE UNDER THIS ENTRY/i.test(txt)) res.noEvidence.push(id);
    }
    return res;
  });
  log('territories swept: ' + out.n + ' avg chars ' + Math.round(out.totalChars/out.n));
  log('BANNED STRING HITS (' + out.hits.length + '):\n' + out.hits.slice(0,60).join('\n'));
  log('TOTAL [unsourced] markers: ' + out.unsourced + ' across ' + out.unsourcedT.length + ' territories');
  log('worst unsourced: ' + out.unsourcedT.sort((a,b)=>b.split(':')[1]-a.split(':')[1]).slice(0,12).join(', '));
  log('MISSING LOCAL ACTORS (' + out.missingActors.length + '): ' + out.missingActors.slice(0,40).join(', '));
  log('NO EVIDENCE SECTION (' + out.noEvidence.length + '): ' + out.noEvidence.slice(0,40).join(', '));
  log('EMPTY/SHORT (' + out.empty.length + '): ' + out.empty.slice(0,30).join(' | '));
};
