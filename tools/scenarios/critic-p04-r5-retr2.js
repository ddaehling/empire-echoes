/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  for (let i = 0; i < 8; i++) { await page.evaluate(k => { document.getElementById('dossier').scrollTop = k*600; }, i); await page.waitForTimeout(900); }
  await page.evaluate(() => { location.hash = '#year=1913&sel=barbados'; }); await page.waitForTimeout(1200);
  await page.evaluate(() => { location.hash = '#year=1913&sel=kenya'; }); await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const d = document.getElementById('dossier');
    const t = d.innerText;
    const blk = d.querySelector('.dsr__retrieval');
    return { hasBlock: !!blk, blockText: blk ? blk.innerText.replace(/\n{2,}/g,'\n') : null, lower: t.toLowerCase().indexOf('read this entry already') };
  });
  log(JSON.stringify(r, null, 1));
  if (r.hasBlock) { await page.evaluate(()=>document.querySelector('.dsr__retrieval').scrollIntoView({block:'center'})); await page.waitForTimeout(300); await shot('retrieval','#dossier'); }
};
