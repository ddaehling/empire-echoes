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
  await shot('as-arrives');
  // find the dossier root
  const info = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach(e => {
      const c = (e.className && e.className.toString) ? e.className.toString() : '';
      if (/dossier/i.test(c) || /dossier/i.test(e.id||'')) out.push({tag:e.tagName, cls:c.slice(0,60), id:e.id, sh:e.scrollHeight, ch:e.clientHeight, r:e.getBoundingClientRect().toJSON()});
    });
    return out.slice(0,10);
  });
  log('dossier:', JSON.stringify(info, null, 1));
  // what is covering it? elementFromPoint across the dossier area
  const cover = await page.evaluate(() => {
    const pts = [[1100,150],[1100,300],[1100,450],[1100,600],[1300,150],[1300,400]];
    return pts.map(([x,y]) => { const e = document.elementFromPoint(x,y); let p=e, chain=[]; while(p && chain.length<5){chain.push(p.tagName+'.'+(p.className&&p.className.toString?p.className.toString().split(' ')[0]:'')); p=p.parentElement;} return {x,y,chain:chain.join(' < ')}; });
  });
  log('cover:', JSON.stringify(cover, null, 1));
};
