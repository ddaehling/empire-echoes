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
    const slots = [...document.querySelectorAll('[data-slot]')].map(n => n.getAttribute('data-slot') + ' -> ' + n.className);
    const t = document.querySelector('[data-slot="timeline"]') || document.querySelector('.tl') || document.querySelector('.time');
    return { slots, tl: t ? t.outerHTML.slice(0,200) : 'none' };
  });
  log(JSON.stringify(info.slots, null, 1));
  const cls = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach(n => { const c = typeof n.className === 'string' ? n.className : ''; if (/tl-|timeline|spine|scrub/.test(c)) out.push(n.tagName + '.' + c); });
    return [...new Set(out)].slice(0,120);
  });
  log('CLASSES:\n' + cls.join('\n'));
};
