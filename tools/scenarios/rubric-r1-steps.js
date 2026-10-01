/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2000);
  const info = await page.evaluate(()=>{
    const B=window.BEA; return {rep: typeof B.report==='function'? 'fn':'obj'};
  });
  for (let s=1;s<=24;s++){
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s,{waitUntil:'load'});
    await page.waitForTimeout(1500);
    const t = await page.evaluate(()=>{
      const head=document.querySelector('.cx-say,.cx-head,[class*="say"]');
      const st=window.BEA.store.getState();
      const pan=document.querySelector('.cx-sheet');
      return {year:st.year, sel:st.selected, tourStep:st.tourStep,
        head: head? head.innerText.replace(/\s+/g,' ').slice(0,140):null,
        title: pan? pan.innerText.replace(/\s+/g,' ').slice(0,150):null};
    });
    log('S'+s+' year='+t.year+' | '+JSON.stringify(t.head)+' || '+JSON.stringify(t.title));
  }
};
