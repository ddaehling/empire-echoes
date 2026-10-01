/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  page.on('pageerror', (e) => log('PAGEERROR ' + e.message));
  await page.goto('http://localhost:8777/app/#year=1808&sel=curacao', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const host = document.querySelector('.app__dossier');
    const fold = document.querySelector('.dsr__fold');
    const art = document.querySelector('.dossier');
    return {
      over: Math.round(fold.getBoundingClientRect().bottom - host.getBoundingClientRect().bottom),
      hostH: Math.round(host.getBoundingClientRect().height),
      clips: [...art.querySelectorAll('[data-clip]')].map((n) => n.dataset.clip + '=' + n.dataset.budget + ' h' + Math.round(n.getBoundingClientRect().height)),
      text: art.querySelector('.dsr__fold').innerText.replace(/\s+/g, ' ').slice(0, 500),
    };
  });
  log(JSON.stringify(r, null, 1));
};
