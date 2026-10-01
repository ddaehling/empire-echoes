/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const grab = () => {
  const leg = document.querySelector('.stage__legend');
  const by = document.querySelector('.lbyline, [class*="byline"]');
  const txt = n => n ? n.innerText.replace(/\s+/g,' ').trim() : null;
  return { legend: txt(leg), byline: txt(by),
    legendH: leg ? Math.round(leg.getBoundingClientRect().height) : null };
};
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(String(e).slice(0,200)));
  page.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text().slice(0,200));});
  await page.waitForTimeout(2800);
  const seq = [
    ['base', null], ['def2','2'], ['def3','3'], ['def4','4'], ['def1','1'],
    ['proj','p'], ['weight','w'], ['stitch','s'], ['silence','h'],
  ];
  for (const [name, key] of seq) {
    if (key) { await page.keyboard.press(key); await page.waitForTimeout(900); }
    const g = await page.evaluate(grab);
    log('=== ' + name + ' (legendH ' + g.legendH + ')');
    log('BYLINE: ' + (g.byline||'').slice(0,400));
    log('LEGEND: ' + (g.legend||'').slice(0,700));
  }
  await shot('states-end');
  log('ERRORS ' + JSON.stringify(errs));
};
