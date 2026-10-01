/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach(e => {
      const c = typeof e.className === 'string' ? e.className : '';
      if (/timeline|scrub|spine|band|rail|playback|tick/i.test(c + ' ' + e.id)) out.push((e.tagName)+'#'+e.id+'.'+c);
    });
    return out.slice(0, 120);
  });
  log('MATCHES:', JSON.stringify(info, null, 1));
  const root = await page.evaluate(() => {
    const e = document.querySelector('.tl, .timeline, [class*="timeline"]');
    if (!e) return null;
    let r = e; while (r.parentElement && !/timeline|^tl/.test(r.parentElement.className||'')) break;
    return e.outerHTML.slice(0, 3000);
  });
  log('ROOT HTML:', root);
};
