/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1943&sel=libya-british-administration', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  const r = await page.evaluate(() => {
    const host = document.querySelector('.app__dossier');
    const root = document.querySelector('.dossier');
    const fold = root.querySelector('.dsr__fold');
    const head = root.querySelector('.dsr__head');
    const rows = [];
    for (const n of root.querySelectorAll('.dsr__head > *, .dsr__meta > *, .dsr__fold > .dsr__block > *')) {
      const b = n.getBoundingClientRect();
      rows.push({ c: n.className, h: Math.round(b.height), hidden: n.hidden, t: (n.innerText||'').slice(0,40) });
    }
    return {
      hostTop: Math.round(host.getBoundingClientRect().top),
      hostBottom: Math.round(host.getBoundingClientRect().bottom),
      headH: Math.round(head.getBoundingClientRect().height),
      foldTop: Math.round(fold.getBoundingClientRect().top),
      foldH: Math.round(fold.getBoundingClientRect().height),
      hostPad: getComputedStyle(host).padding,
      rows,
    };
  });
  log(JSON.stringify(r, null, 1));
};
