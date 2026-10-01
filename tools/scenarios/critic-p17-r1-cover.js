/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.app{height:100dvh}'});
  await page.waitForTimeout(400);
  const c = await page.evaluate(()=>{
    const stage=document.querySelector('.app__stage').getBoundingClientRect();
    const A=stage.width*stage.height;
    const area = s => { const e=document.querySelector(s); if(!e) return 0; const r=e.getBoundingClientRect(); return r.width*r.height; };
    return { stage:Math.round(A), legend:Math.round(area('[data-mount="legend"]')), byline:Math.round(area('#legend-byline')),
      pctLegend:+(area('[data-mount="legend"]')/A*100).toFixed(1), pctByline:+(area('#legend-byline')/A*100).toFixed(1) };
  });
  log('coverage: '+JSON.stringify(c));
  // open crit and measure again
  await page.evaluate(()=>document.querySelector('.byline__crit').click());
  await page.waitForTimeout(600);
  const c2 = await page.evaluate(()=>{
    const stage=document.querySelector('.app__stage').getBoundingClientRect(); const A=stage.width*stage.height;
    const area = s => { const e=document.querySelector(s); if(!e) return 0; const r=e.getBoundingClientRect(); return r.width*r.height; };
    return { pctLegend:+(area('[data-mount="legend"]')/A*100).toFixed(1), pctByline:+(area('#legend-byline')/A*100).toFixed(1) };
  });
  log('coverage crit open: '+JSON.stringify(c2));
  await shot('cover');
  // print styles?
  const p = await page.evaluate(async ()=>{ let n=0; for (const s of document.styleSheets){ try{ for(const r of s.cssRules){ if(r.type===4 && /print/.test(r.conditionText||'')) n++; } }catch(e){} } return n; });
  log('print @media rules across app: '+p);
  const pl = await page.evaluate(async ()=>{ let n=0; for (const s of document.styleSheets){ if(!/legend\.css/.test(s.href||'')) continue; try{ for(const r of s.cssRules){ if(r.type===4 && /print/.test(r.conditionText||'')) n++; } }catch(e){} } return n; });
  log('print @media rules in legend.css: '+pl);
};
