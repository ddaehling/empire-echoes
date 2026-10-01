/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const o = await page.evaluate(() => {
    const l = document.querySelector('.stage__legend');
    const kids = [...l.querySelectorAll(':scope > .legend > *')].map(e => {
      const r = e.getBoundingClientRect();
      return String(e.className).split(/\s+/)[0] + ' y=' + Math.round(r.y) + ' h=' + Math.round(r.height) + ' :: ' + e.innerText.replace(/\n+/g,' / ').slice(0,60);
    });
    return { attrs: JSON.stringify({...l.dataset}), style: l.getAttribute('style'), rect: [Math.round(l.getBoundingClientRect().y), Math.round(l.getBoundingClientRect().height)], kids, stageH: Math.round(document.querySelector('#stage').getBoundingClientRect().height) };
  });
  log(JSON.stringify(o, null, 1));
  await shot('l768', '.stage__legend');
};
