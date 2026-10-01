/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const seq = [];
  for (let i=0;i<45;i++){
    await page.keyboard.press('Tab');
    const a = await page.evaluate(()=>{
      const e=document.activeElement; if(!e) return 'none';
      const inLegend = !!e.closest('.stage__legend'); const inByline = !!e.closest('.stage__note');
      const r=e.getBoundingClientRect();
      const cs=getComputedStyle(e);
      return (inLegend?'[LEG] ':inByline?'[BYL] ':'      ')+e.tagName+'.'+String(e.className).split(/\s+/)[0]+' "'+e.innerText.replace(/\n/g,'/').slice(0,45)+'" vis='+(r.width>0&&r.height>0)+' outline='+cs.outlineWidth;
    });
    seq.push(a);
  }
  log(seq.join('\n'));
  await shot('focus');
};
