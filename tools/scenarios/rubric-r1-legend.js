/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1780',{waitUntil:'load'});
  await page.waitForTimeout(2600);
  const r = await page.evaluate(()=>{
    const host = document.querySelector('[class*=legend], .lg-strip, .key');
    const items=[];
    document.querySelectorAll('[class*=lg-],[class*=legend]').forEach(e=>{
      const t=(e.innerText||'').replace(/\s+/g,' ').trim();
      if(!t||t.length>90) return;
      items.push({cls:(e.className||'').toString().slice(0,40), aria:e.getAttribute('aria-label'), role:e.getAttribute('role'), txt:t});
    });
    return {hostCls: host&&host.className.toString(), items: items.slice(0,40), html: host? host.outerHTML.slice(0,3000):'none'};
  });
  log('LEGEND ITEMS>>'+JSON.stringify(r.items,null,1).slice(0,4000));
  log('HTML>>'+r.html);
  await shot('legend');
};
