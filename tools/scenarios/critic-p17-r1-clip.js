/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900&sel=india', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  await page.locator('.byline__crit').first().click();
  await page.waitForTimeout(600);
  const m = await page.evaluate(() => {
    const q = s => { const e=document.querySelector(s); if(!e) return 'MISSING'; const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      return {y:Math.round(r.y),h:Math.round(r.height),sh:e.scrollHeight,ch:e.clientHeight,ov:cs.overflow,mh:cs.maxHeight,st:e.scrollTop}; };
    return { note:q('[data-mount="stage-note"]'), byline:q('#legend-byline'), crit:q('.byline__crit-body')||q('.byline__caveats'),
      inner: [...document.querySelectorAll('#legend-byline *')].filter(e=>e.scrollHeight>e.clientHeight+2).map(e=>({cls:(e.className||'').toString().slice(0,50), sh:e.scrollHeight, ch:e.clientHeight})),
      vh: innerHeight, legend:q('[data-mount="legend"]') };
  });
  log(JSON.stringify(m,null,1));
  // is the "ask these three" visible?
  const vis = await page.evaluate(() => {
    const els=[...document.querySelectorAll('#legend-byline *')];
    const t=els.find(e=>/ASK THESE THREE/i.test(e.textContent||'') && e.children.length===0);
    if(!t) return 'not found';
    const r=t.getBoundingClientRect();
    const mid=document.elementFromPoint(Math.round(r.x+5), Math.round(r.y+5));
    return {y:Math.round(r.y), h:Math.round(r.height), topEl: mid? (mid.tagName+'.'+(mid.className||'').toString().slice(0,40)) : null, inViewport: r.y>=0&&r.bottom<=innerHeight};
  });
  log('ASK-THREE: '+JSON.stringify(vis));
  await shot('clip');
};
