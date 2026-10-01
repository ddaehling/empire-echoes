/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const A = process.env.A || '#tour=thirty&step=18';
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/' + A, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  const out = await page.evaluate(() => {
    const walk = (n, d, acc) => {
      for (const c of n.children) {
        const r = c.getBoundingClientRect();
        acc.push('  '.repeat(d) + Math.round(r.height).toString().padStart(5) + '  ' + c.tagName.toLowerCase() + '.' + (c.className || '').toString().split(' ').join('.').slice(0, 46) + ' :: ' + (c.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 58));
        if (d < 2 && r.height > 60) walk(c, d + 1, acc);
      }
      return acc;
    };
    const f = document.querySelector('.tr-panel__flow');
    return f ? walk(f, 0, []) : ['no flow'];
  });
  out.forEach(l => log(l));
};
