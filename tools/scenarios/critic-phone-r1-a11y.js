/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1600);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(1500);
  // accessible names of legend chips + all bar controls
  const names = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.legend__rib, .legend__chip, .legend li, .map__defchip, .map__zoom, .cx-more').forEach(e=>{
      out.push(`${e.className.toString().slice(0,30)} | aria="${e.getAttribute('aria-label')||''}" | title="${e.getAttribute('title')||''}" | text="${(e.innerText||'').replace(/\n/g,' ').trim().slice(0,80)}"`);
    });
    return out.join('\n');
  });
  log('legend names:\n' + names);
  // thumb reach: every visible control's y
  const ctl = await page.evaluate(() => {
    const out=[];
    document.querySelectorAll('button,a[href],input,select').forEach(e=>{
      const r=e.getBoundingClientRect();
      if(r.width<8||r.height<8||r.top<-50) return;
      if(e.className.toString().includes('map__target')) return;
      out.push({y:Math.round(r.y), h:Math.round(r.height), w:Math.round(r.width), x:Math.round(r.x), t:(e.innerText||e.getAttribute('aria-label')||'').replace(/\n/g,' ').trim().slice(0,34), c:e.className.toString().slice(0,26)});
    });
    return out.sort((a,b)=>a.y-b.y);
  });
  log('controls by y (n=' + ctl.length + '):\n' + ctl.map(c=>`  y=${c.y} h=${c.h} x=${c.x} w=${c.w} "${c.t}" .${c.c}`).join('\n'));
  // touch target size violations (<44)
  const small = ctl.filter(c=>c.h<44||c.w<44);
  log('TOUCH TARGETS UNDER 44px (' + small.length + '/' + ctl.length + '):\n' + small.map(c=>`  ${c.w}x${c.h} "${c.t}"`).join('\n'));
  // misconception tags present anywhere
  const tags = await page.evaluate(async () => {
    const r = await fetch('/app/js/modules.json').catch(()=>null);
    return r ? 'modules.json ok' : 'n/a';
  });
  log(tags);
};
