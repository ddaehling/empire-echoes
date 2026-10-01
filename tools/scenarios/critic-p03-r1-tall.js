/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  log(await page.evaluate(() => {
    const rows = [];
    document.querySelectorAll('*').forEach(e => {
      const b = e.getBoundingClientRect();
      if (b.height > 1200) rows.push(e.tagName + '#' + e.id + '.' + (typeof e.className === 'string' ? e.className : '') + ' h=' + Math.round(b.height) + ' top=' + Math.round(b.top) + ' pos=' + getComputedStyle(e).position);
    });
    return rows.join('\n');
  }));
  log('--- dossier inner ---');
  log(await page.evaluate(() => {
    const d = document.querySelector('.app__dossier');
    if (!d) return 'none';
    const out = [];
    const walk = (e, dd) => { const b = e.getBoundingClientRect(); out.push(' '.repeat(dd)+e.tagName+'.'+(typeof e.className==='string'?e.className:'')+' h='+Math.round(b.height)); if (dd<3) for (const c of e.children) walk(c, dd+1); };
    walk(d, 0); return out.join('\n');
  }));
};
