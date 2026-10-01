/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await shot('boot');
  log('title:', await page.title());
  log('url:', page.url());
  // dismiss onboarding if any
  const bodyText = (await page.evaluate(() => document.body.innerText)).slice(0, 2500);
  log('BODY:', bodyText);
  // structural survey of the map
  const survey = await page.evaluate(() => {
    const svg = document.querySelector('#map svg, .map svg, svg.map, svg');
    const out = {};
    out.svgCount = document.querySelectorAll('svg').length;
    const paths = document.querySelectorAll('[data-unit], [data-unit-id]');
    out.unitNodes = paths.length;
    out.mapRoot = svg ? svg.getAttribute('class') + '|' + svg.getAttribute('viewBox') : null;
    out.canvases = document.querySelectorAll('canvas').length;
    return out;
  });
  log('SURVEY:', JSON.stringify(survey));
};
