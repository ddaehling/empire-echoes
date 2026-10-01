/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  const a = page.locator('.app__dossier');
  await a.evaluate((n) => { n.scrollTop = 480; });
  await page.waitForTimeout(300);
  await shot('mid');
  log(await page.evaluate(() => {
    const s = new Map();
    for (const n of document.querySelectorAll('.app__dossier *')) {
      if (!n.textContent.trim() || !n.getClientRects().length) continue;
      const cs = getComputedStyle(n);
      s.set(cs.fontSize, (s.get(cs.fontSize) || 0) + 1);
    }
    return 'font sizes in the rail: ' + JSON.stringify([...s.entries()].sort());
  }));
};
