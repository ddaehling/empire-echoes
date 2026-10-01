/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1200);
  await page.evaluate(() => { location.hash = '#year=1765&sel=bengal-presidency'; });
  await page.waitForTimeout(2200);
  const m = await page.evaluate(() => {
    const d = document.querySelector('#dossier');
    const r = d.getBoundingClientRect();
    const find = (re) => { const n=[...d.querySelectorAll('*')].find(e=>re.test(e.textContent||'') && e.children.length===0); return n? Math.round(n.getBoundingClientRect().bottom) : null; };
    return { dossierTop: Math.round(r.top), dossierBottom: Math.round(r.bottom), h: Math.round(r.height),
      nameBottom: find(/Presidency of Fort William/),
      statusBottom: find(/LEGAL STATUS IN 1765|Legal status in 1765/i),
      takenBottom: find(/Taken by conquest/),
      endedBottom: find(/Partitioned/),
      voteBottom: find(/Calcutta municipal franchise/) };
  });
  log('fold check:', JSON.stringify(m));
  const visible = k => m[k] !== null && m[k] <= m.dossierBottom;
  log('within the dossier viewport without scrolling:', JSON.stringify({name:visible('nameBottom'),status:visible('statusBottom'),taken:visible('takenBottom'),ended:visible('endedBottom'),franchise:visible('voteBottom')}));
  await shot('fold-1280');
};
