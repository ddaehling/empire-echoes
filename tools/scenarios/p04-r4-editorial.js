/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  for (const [id, y] of [['british-india', 1857], ['ethiopia-british-administration', 1943]]) {
    await page.goto('http://localhost:8777/app/#year=' + y + '&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(1400);
    const r = await page.evaluate(() => {
      const c = document.querySelector('[data-block="contested"]');
      const s = document.querySelector('[data-block="housestyle"]');
      return { contested: c ? c.innerText.replace(/\s+/g, ' ') : null, style: s ? s.innerText.replace(/\s+/g, ' ') : null };
    });
    log('=== ' + id);
    log('CONTESTED: ' + r.contested);
    log('STYLE FOOTER: ' + (r.style || '(none)'));
  }
};
