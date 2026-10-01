/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(2800);
  log(JSON.stringify(await page.evaluate(() => {
    const a = document.querySelector('.app__dossier');
    const out = [];
    for (const n of a.querySelectorAll('.dossier > *, .dsr__below > *')) {
      const b = n.getBoundingClientRect();
      out.push({ cls: n.className.slice(0, 46), h: Math.round(b.height), chars: (n.innerText || '').length });
    }
    return { scrollH: a.scrollHeight, h: Math.round(a.getBoundingClientRect().height), out };
  }), null, 1));
};
