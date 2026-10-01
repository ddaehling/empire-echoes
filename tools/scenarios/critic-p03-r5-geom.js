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
    document.querySelectorAll('body *').forEach(el => {
      const id = el.id ? '#'+el.id : '';
      const cls = typeof el.className === 'string' ? '.'+el.className.trim().split(/\s+/).join('.') : '';
      const r = el.getBoundingClientRect();
      if (r.height > 40 && r.width > 200 && (id || /time|scrub|spine|rail|rate|phase|row|track/i.test(cls))) {
        out.push(`${el.tagName}${id}${cls.slice(0,90)} @ ${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    });
    return out;
  });
  log(info.join('\n'));
  const roots = await page.evaluate(() => Array.from(document.body.children).map(c=>`${c.tagName}#${c.id}.${c.className}`).join('\n'));
  log('body children:\n'+roots);
};
