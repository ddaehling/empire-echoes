/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const seen = [];
  for (let i=0;i<45;i++){
    await page.keyboard.press('Tab');
    const a = await page.evaluate(()=>{ const e=document.activeElement; if(!e) return null;
      const r=e.getBoundingClientRect(); const s=getComputedStyle(e);
      return { tag:e.tagName, cls:(e.className||'').toString().slice(0,50), txt:(e.innerText||e.value||'').slice(0,45).replace(/\n/g,'·'),
        vis: r.width>2&&r.height>2, outline: s.outlineWidth+' '+s.outlineStyle, box: s.boxShadow.slice(0,30) }; });
    seen.push(a);
    if (a && /legend|byline|lplate/.test(a.cls)) log('P17 FOCUS ' + i + ': ' + JSON.stringify(a));
  }
  log('ALL: ' + JSON.stringify(seen.map(x=>x&&(x.cls||x.tag)+':'+x.txt.slice(0,20))));
  await shot('kbd');
};
