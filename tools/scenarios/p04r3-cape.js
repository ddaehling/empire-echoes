/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const [id, y] of [['cape-colony', 1796], ['cape-colony', 1853], ['egypt', 1913], ['british-india', 1913], ['papua', 1930]]) {
    await page.goto('http://localhost:8777/app/#year=' + y + '&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(1800);
    const r = await page.evaluate(() => {
      const host = document.querySelector('.app__dossier');
      const fold = document.querySelector('.dsr__fold');
      return {
        over: Math.round(fold.getBoundingClientRect().bottom - host.getBoundingClientRect().bottom),
        text: fold.innerText.replace(/\s+/g, ' ').slice(0, 420),
      };
    });
    log(id + ' ' + y + ' over=' + r.over + '\n   ' + r.text);
  }
  await shot('cape-and-friends');
};
