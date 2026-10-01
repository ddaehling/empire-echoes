/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const ids = ['reunion-british-occupation','bermuda','ascension','british-indian-ocean-territory','nauru'];
  for (const id of ids) {
    await page.goto('http://localhost:8777/app/#year=1913&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(1400);
    const t = await page.evaluate(() => document.getElementById('dossier').innerText);
    log('=== ' + id + ' (len ' + t.length + ') ===');
    log(t.replace(/\n{2,}/g, '\n').slice(0, 3000));
    await shot(id, '#dossier');
  }
};
