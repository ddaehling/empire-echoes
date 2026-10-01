/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1200);
  await shot('40-1366x768');
  log('GEOM', await page.evaluate(()=>{const p=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];};return JSON.stringify({vw:innerWidth,vh:innerHeight,stage:p('.app__stage'),time:p('.app__time'),frame:p('.map__frame'),ax:p('.tl-ax'),chg:p('.tl__changes'),rate:p('.tl-rate'),spine:p('.tl-spine'),foot:p('.app__foot')});}));
  // overlap test between change cards and the axis tick labels
  log('OVERLAP', await page.evaluate(()=>{
    const cards=[...document.querySelectorAll('.tl-chg')];
    const labels=[...document.querySelectorAll('.tl-ax *')].filter(e=>e.textContent.trim()&&e.children.length===0);
    const hits=[];
    cards.forEach(c=>{const a=c.getBoundingClientRect(); labels.forEach(l=>{const b=l.getBoundingClientRect(); if(b.width&&a.x<b.x+b.width&&b.x<a.x+a.width&&a.y<b.y+b.height&&b.y<a.y+a.height) hits.push((c.innerText||'').slice(0,30).replace(/\n/g,' ')+' ⨯ '+l.textContent.trim().slice(0,20));});});
    return hits.slice(0,12).join(' | ') || 'none';
  }));
  await page.evaluate(()=>{const e=[...document.querySelectorAll('.map__target')].find(x=>/bengal/.test(x.dataset.unit));const r=e.getBoundingClientRect();window.__h={x:r.x+r.width/2,y:r.y+r.height/2};});
  const h = await page.evaluate(()=>window.__h);
  await page.mouse.click(h.x,h.y); await page.waitForTimeout(1300);
  await shot('41-1366-dossier');
  log('GEOM2', await page.evaluate(()=>{const p=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];};return JSON.stringify({stage:p('.app__stage'),time:p('.app__time'),frame:p('.map__frame')});}));
};
