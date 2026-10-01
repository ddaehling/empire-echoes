/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// Any box that cuts a line of type in half with no fade, in several states.
const probe = (page, label, log) => page.evaluate(() => {
  const out = [];
  document.querySelectorAll('*').forEach(e => {
    if (!e.offsetParent) return;
    const cs = getComputedStyle(e);
    if (cs.overflowY === 'visible') return;
    if (e.scrollHeight - e.clientHeight < 6 || e.clientHeight < 10) return;
    if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none') return;   // clamped = deliberate
    const masked = cs.maskImage && cs.maskImage !== 'none';
    const txt = (e.innerText||'').trim();
    if (txt.length < 10) return;
    out.push({ c:(typeof e.className==='string'?e.className:e.tagName).slice(0,46), ch:e.clientHeight, sh:e.scrollHeight, ovY:cs.overflowY, masked, t: txt.replace(/\s+/g,' ').slice(0,54) });
  });
  return out;
}).then(r => { log(label, JSON.stringify(r, null, 1)); });
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1600);
  await probe(page, 'BOOT', log);
  await page.evaluate(()=>window.BEA.store.act.select('bengal-presidency'));
  await page.waitForTimeout(1200);
  await probe(page, 'SELECTED', log);
  await page.evaluate(()=>window.BEA.store.act.setYear(1783));
  await page.waitForTimeout(1200);
  await probe(page, '1783', log);
};
