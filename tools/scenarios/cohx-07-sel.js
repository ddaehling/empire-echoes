/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1500);
  log('attrs used on map paths:', await page.evaluate(() => {
    const svg = document.querySelector('[data-mount=map] svg');
    if (!svg) return 'no svg';
    const ps = [...svg.querySelectorAll('path,circle,g')].slice(0, 8);
    return ps.map(p => p.tagName + ' ' + [...p.attributes].map(a=>a.name+'="'+String(a.value).slice(0,40)+'"').join(' ')).join('\n');
  }));
  log('unique attr names:', await page.evaluate(() => {
    const s = new Set(); document.querySelectorAll('[data-mount=map] *').forEach(e=>[...e.attributes].forEach(a=>s.add(a.name))); return [...s].join(', ');
  }));
};
