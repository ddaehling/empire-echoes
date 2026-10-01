/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('landing');
  log('title:', await page.title());
  log('url:', page.url());
  const txt = await page.evaluate(() => document.body.innerText);
  log('BODYTEXT:\n' + txt.slice(0, 3000));
  // map svg presence
  const info = await page.evaluate(() => {
    const svg = document.querySelector('#map svg, .map svg, svg.map, svg');
    const out = {};
    out.svgCount = document.querySelectorAll('svg').length;
    const paths = document.querySelectorAll('svg path');
    out.pathCount = paths.length;
    out.mapRootIds = [...document.querySelectorAll('[id]')].map(e=>e.id).slice(0,80);
    return out;
  });
  log('INFO', JSON.stringify(info));
};
