/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const d = await page.evaluate(() => {
    const el = document.querySelector('.app__dossier') || document.querySelector('.dossier');
    if (!el) return {found:false, cands:[...document.querySelectorAll('[class*=dossier]')].map(n=>n.className)};
    const r = el.getBoundingClientRect();
    return { found:true, cls: el.className, rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
      scrollH: el.scrollHeight, clientH: el.clientHeight, text: el.innerText };
  });
  log('FOUND', d.found, d.cls||'', JSON.stringify(d.rect||d.cands), 'scrollH', d.scrollH, 'clientH', d.clientH);
  log('=== TEXT ===\n' + (d.text||''));
};
