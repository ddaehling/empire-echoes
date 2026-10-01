/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  await page.evaluate(() => { location.hash = '#year=1913&sel=bengal-presidency'; });
  await page.waitForTimeout(1200);
  const g = await page.evaluate(() => {
    const host = document.querySelector('.app__dossier');
    const cs = getComputedStyle(host);
    return { docScrollH: document.documentElement.scrollHeight, winH: innerHeight,
      bodyOverflow: getComputedStyle(document.body).overflow,
      hostOverflowY: cs.overflowY, hostH: cs.height, hostPos: cs.position,
      parent: host.parentElement.className, parentOverflow: getComputedStyle(host.parentElement).overflowY,
      parentH: getComputedStyle(host.parentElement).height };
  });
  log('GEOM ' + JSON.stringify(g, null, 1));
  // try scrolling the dossier area
  await page.mouse.move(1100, 500);
  await page.mouse.wheel(0, 1400);
  await page.waitForTimeout(500);
  await shot('scroll-1400');
  await page.mouse.wheel(0, 3000);
  await page.waitForTimeout(500);
  await shot('scroll-4400');
  const after = await page.evaluate(() => {
    const host = document.querySelector('.app__dossier');
    return { docScrollTop: document.documentElement.scrollTop, hostScrollTop: host.scrollTop,
      parentScrollTop: host.parentElement.scrollTop, mapTop: (document.querySelector('.app__map,svg')||{getBoundingClientRect:()=>({top:'?'})}).getBoundingClientRect().top };
  });
  log('AFTER SCROLL ' + JSON.stringify(after));
};
