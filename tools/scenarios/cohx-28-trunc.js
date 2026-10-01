/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// Any visible control whose own label is cut off, anywhere in the app.
const probe = (page) => page.evaluate(() => {
  const bad = [];
  document.querySelectorAll('button, a[href], [role=button], summary').forEach(b => {
    if (!b.offsetParent) return;
    const walk = (e) => {
      if (e.nodeType === 3) return;
      const cs = getComputedStyle(e);
      const clipped = (e.scrollWidth - e.clientWidth > 3 && cs.overflowX !== 'visible')
        || (e.scrollHeight - e.clientHeight > 3 && cs.overflowY === 'hidden' && cs.webkitLineClamp === 'none');
      if (clipped && (e.innerText||'').trim().length > 4) {
        bad.push(((typeof e.className==='string'&&e.className)||e.tagName) + ` cw=${e.clientWidth}/${e.scrollWidth} ch=${e.clientHeight}/${e.scrollHeight} :: ` + (e.innerText||'').replace(/\s+/g,' ').slice(0,60));
      }
      for (const c of e.children) walk(c);
    };
    walk(b);
  });
  return [...new Set(bad)];
});
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1600);
  log('TRUNCATED CONTROLS @boot:', JSON.stringify(await probe(page), null, 1));
  const k = await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(b=>/full key/i.test(b.innerText)); if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
  if (k) { await page.mouse.click(k.x,k.y); await page.waitForTimeout(1300); }
  log('TRUNCATED CONTROLS @plate:', JSON.stringify(await probe(page), null, 1));
};
