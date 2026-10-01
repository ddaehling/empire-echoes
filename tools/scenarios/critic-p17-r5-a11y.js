/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await shot('theme-boot');
  // tab order through the legend
  const seq = [];
  for (let i=0;i<28;i++){
    await page.keyboard.press('Tab'); await page.waitForTimeout(80);
    const a = await page.evaluate(()=>{const e=document.activeElement;return e?{tag:e.tagName,cls:String(e.className).slice(0,60),txt:(e.innerText||e.getAttribute('aria-label')||'').replace(/\n+/g,' ').slice(0,70)}:null;});
    seq.push(a);
  }
  log('TAB: '+JSON.stringify(seq,null,0).slice(0,3500));
  // focus visible?
  await shot('tabbed');
  // aria on legend
  const aria = await page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('[class*="legend"],[class*="byline"],[class*="lplate"]').forEach(e=>{
      if (e.getAttribute('role')||e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.getAttribute('aria-live'))
        out.push({c:String(e.className).slice(0,50), role:e.getAttribute('role'), lab:e.getAttribute('aria-label'), by:e.getAttribute('aria-labelledby'), live:e.getAttribute('aria-live')});
    });
    return out.slice(0,25);
  });
  log('ARIA '+JSON.stringify(aria,null,1).slice(0,2500));
  // swatch check: does every legend entry carry colour+texture+word?
  const sw = await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('[class*="swatch"]')];
    return rows.slice(0,20).map(s=>{const cs=getComputedStyle(s);return {cls:String(s.className).slice(0,50), bg:cs.backgroundColor, bgimg:(cs.backgroundImage||'').slice(0,60), svg:!!s.querySelector('svg'), html:s.innerHTML.slice(0,90)};});
  });
  log('SWATCHES '+JSON.stringify(sw,null,1).slice(0,3000));
};
