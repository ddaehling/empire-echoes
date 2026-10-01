/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await shot('mode-arrive');
  log('box: ' + await page.evaluate(() => { const a = document.querySelector('.app__dossier'); const b = a.getBoundingClientRect(); return JSON.stringify({ t: Math.round(b.top), h: Math.round(b.height), w: Math.round(b.width), vis: getComputedStyle(a).visibility }); }));
  await page.evaluate(() => { const n = document.querySelector('#dsr-testimony'); if (n) n.scrollIntoView({ block: 'start' }); });
  await page.waitForTimeout(400);
  await shot('mode-testimony');
  await page.evaluate(() => { const n = document.querySelector('.dsr__pathmark'); if (n) n.scrollIntoView({ block: 'start' }); });
  await page.waitForTimeout(400);
  await shot('mode-corepath');
  log('contrast probe: ' + await page.evaluate(() => {
    const p = (s) => { const n = document.querySelector(s); return n ? getComputedStyle(n).color + ' on ' + getComputedStyle(n.closest('.dsr__block,.dossier') || document.body).backgroundColor : 'none'; };
    return JSON.stringify({ absence: p('.dsr__absence'), check: p('.src__check'), extlen: p('.dsr__extlen'), derived: p('.dsr__derived') });
  }));
};
