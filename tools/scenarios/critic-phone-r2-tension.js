/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=17',{waitUntil:'load'});
  await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
  await page.waitForTimeout(1500);
  const info = await page.evaluate(()=>{
    const p=document.querySelector('.tr-panel__scroll');
    return {ch:p?p.clientHeight:null, sh:p?p.scrollHeight:null, text:p?p.innerText:null};
  });
  log('panel ch='+info.ch+' sh='+info.sh+' screens='+(info.sh/info.ch).toFixed(1));
  log('FULLTEXT>>>\n'+info.text+'\n<<<');
  let i=0;
  for (let top=0; top<=info.sh; top+=Math.max(60,info.ch-20)) {
    await page.evaluate(t=>{document.querySelector('.tr-panel__scroll').scrollTop=t;}, top);
    await page.waitForTimeout(250);
    await shot('t'+String(++i).padStart(2,'0'));
    if (i>10) break;
  }
};
