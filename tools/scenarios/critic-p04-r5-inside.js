/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1857&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  // open all folded sections
  await page.evaluate(()=>{ document.querySelectorAll('.dossier details').forEach(d=>d.open=true); });
  await page.waitForTimeout(800);
  const t = await page.evaluate(()=>document.querySelector('.dossier').innerText);
  log('LEN after opening all details', t.length);
  for (const key of ['INSIDE','WHAT THIS ATLAS','DISAGREE','WHERE HISTORIANS','THE DEATH','PRINCELY','states']) {
    const i = t.indexOf(key);
    if (i>=0) log('### '+key+'\n'+t.slice(i, i+1200)+'\n');
    else log('### '+key+' NOT FOUND');
  }
};
