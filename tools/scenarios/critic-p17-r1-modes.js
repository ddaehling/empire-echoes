/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.app{height:100dvh}'});
  await page.waitForTimeout(500);
  await shot('mode');
  const L='[data-mount="legend"]';
  const box = await page.evaluate((s)=>{const e=document.querySelector(s); if(!e) return 'MISSING'; const r=e.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};}, L);
  log('legend box: '+JSON.stringify(box));
  if (box!=='MISSING' && box.h>0) await shot('legend', L);
  const by = await page.evaluate(()=>{const e=document.querySelector('#legend-byline'); if(!e) return 'MISSING'; const r=e.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height), txt:e.innerText.slice(0,300)};});
  log('byline: '+JSON.stringify(by));
  // keyboard: tab and find focusables inside legend
  const tabs = [];
  for (let i=0;i<45;i++){
    await page.keyboard.press('Tab');
    const a = await page.evaluate(()=>{const e=document.activeElement; if(!e) return null; const inLeg = !!e.closest('[data-mount="legend"]'); const inBy=!!e.closest('#legend-byline');
      const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      return {tag:e.tagName, cls:(e.className||'').toString().slice(0,40), txt:(e.innerText||e.getAttribute('aria-label')||'').slice(0,40), inLeg, inBy, w:Math.round(r.width), h:Math.round(r.height), outline:cs.outlineWidth+' '+cs.outlineStyle};});
    tabs.push(a);
  }
  log('TAB ORDER: '+JSON.stringify(tabs.filter(t=>t&&(t.inLeg||t.inBy))));
  log('TAB ALL: '+tabs.map(t=>t?t.tag+':'+(t.txt||t.cls).replace(/\n/g,' '):'null').join(' > '));
};
