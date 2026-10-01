/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  const c = await page.evaluate(()=>[...document.querySelectorAll('button,[role=button],a')].map(e=>({t:e.textContent.trim().slice(0,40),a:e.getAttribute('aria-label'),c:String(e.className)})).filter(x=>/expand|full ?screen|bigger|enlarge|maximis|maximiz|taller|hide|collapse|fold/i.test(x.t+' '+x.a+' '+x.c)));
  log('EXPAND CANDIDATES:', JSON.stringify(c));
  // try collapsing everything: FOLD, and clicking the byline "Ask these three" header
  const fold = await page.$('text=FOLD'); if (fold) { await fold.click(); await page.waitForTimeout(600); }
  const ask = await page.$('text=ASK THESE THREE OF ANY IMPERIAL MAP'); if (ask) { await ask.click(); await page.waitForTimeout(600); }
  const r = await page.evaluate(()=>{
    const plate=document.querySelector('.map__plate'); const c=plate.getBoundingClientRect();
    const N=70; let hit=0,tot=0;
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){const x=c.left+(i+0.5)*c.width/N,y=c.top+(j+0.5)*c.height/N; if(x<0||y<0||x>innerWidth||y>innerHeight)continue; tot++;
      const el=document.elementFromPoint(x,y); if(!el)continue;
      if(el===plate||/map__target|map__targets|map__fade/.test(String(el.className)))continue; hit++;}
    return {pct:Math.round(100*hit/tot), h:Math.round(c.height)};
  });
  log('AFTER COLLAPSE:', JSON.stringify(r));
  await shot('collapsed');
};
