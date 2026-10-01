/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/more — that is|the full key/i.test((x.getAttribute('aria-label')||x.textContent||''))); if(b)b.click();});
  await page.waitForTimeout(1400); await shot('key');
  const names = await page.evaluate(()=>[...document.querySelectorAll('button,[role=button],li,dt,dd,span')].filter(e=>e.offsetParent).map(e=>(e.getAttribute('aria-label')||'')).filter(Boolean));
  const leak = names.filter(n=>/deg\s*\d|°|\bdeg\b/i.test(n));
  log('aria names with degree leak: ' + JSON.stringify(leak.slice(0,10)));
  log('sample key names: ' + JSON.stringify([...new Set(names)].slice(0,20), null, 1).slice(0,1600));
  // also territory hit-region names on the map
  const hits = await page.evaluate(()=>[...document.querySelectorAll('[class*=hit],[class*=mp-hit]')].map(e=>e.getAttribute('aria-label')||'').filter(Boolean).slice(0,6));
  hits.forEach(h=>log('hit: '+h));
};
