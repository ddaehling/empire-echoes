/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[], reqs=[];
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  page.on('requestfailed',r=>reqs.push(r.url()));
  await page.waitForTimeout(2800);
  const chk = () => page.evaluate(() => {
    const leg = document.querySelector('.legend');
    const by = document.getElementById('legend-byline');
    if (!leg) return { legend: false, byline: !!by, bylineFloat: by && by.dataset.float };
    const r = leg.getBoundingClientRect();
    return { legend: true, byline: !!by, bylineFloat: by && by.dataset.float,
      colours: leg.querySelectorAll('.legend__colours .legend__chip--fam').length,
      clipped: [...leg.children].concat([...leg.querySelectorAll('.legend__head > *, .legend__colours > *, .legend__foot > *')])
        .filter(n=>{const b=n.getBoundingClientRect();
        return b.height>0 && (b.bottom>r.bottom+1||b.top<r.top-1);}).map(n=>n.className.toString().slice(0,30)),
      h: Math.round(r.height) };
  });
  const acts = [['boot',null],['def2','2'],['def4','4'],['def1','1'],['proj','p'],['weight','w'],['stitch','s'],['silence','h']];
  for (const [t,k] of acts) { if (k) { await page.keyboard.press(k); await page.waitForTimeout(700); } log(t + ' ' + JSON.stringify(await chk())); }
  for (const y of [1600, 1700, 1800, 1850, 1922, 1947, 1997, 2027]) {
    await page.evaluate(yy=>{location.hash='#year='+yy;}, y);
    await page.waitForTimeout(450);
    log('y'+y+' '+JSON.stringify(await chk()));
  }
  await shot('end');
  log('ERRORS ' + JSON.stringify(errs));
  log('FAILEDREQ ' + JSON.stringify(reqs));
};
