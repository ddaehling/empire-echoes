/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('a-initial');
  // keyboard: tab until we hit legend controls
  const seen = [];
  for (let i=0;i<45;i++){
    await page.keyboard.press('Tab');
    const d = await page.evaluate(()=>{ const a=document.activeElement; if(!a) return null;
      const inLegend = !!a.closest('.legend,.byline,.lplate');
      const r=a.getBoundingClientRect();
      return {tag:a.tagName, cls:String(a.className).slice(0,40), txt:(a.innerText||a.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,60), inLegend, vis: r.width>0&&r.height>0&&r.top>=0&&r.bottom<=innerHeight};
    });
    seen.push(d);
  }
  log('TABS ' + JSON.stringify(seen.filter(x=>x&&x.inLegend), null, 0));
  log('ALLTABS ' + JSON.stringify(seen.map(x=>x&&x.txt).slice(0,45)));
  // aria on legend
  const aria = await page.evaluate(()=>{
    const l = document.querySelector('.legend'), b = document.querySelector('.byline');
    const at = e => e? {role:e.getAttribute('role'), label:e.getAttribute('aria-label'), live:e.getAttribute('aria-live'), tag:e.tagName}:null;
    return {legend:at(l), byline:at(b)};
  });
  log('ARIA ' + JSON.stringify(aria));
  // contrast sample of legend text
};
