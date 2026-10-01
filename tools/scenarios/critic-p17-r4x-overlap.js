/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const meas = (page) => page.evaluate(() => {
  const r = e => e ? (b=>({x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height),bot:Math.round(b.bottom)}))(e.getBoundingClientRect()) : null;
  const by = document.querySelector('.byline');
  const leg = document.querySelector('.legend');
  const bw = document.querySelector('#legend-body') || (leg && leg.querySelector('.legend__bodywrap'));
  const st = document.querySelector('.app__stage');
  const colours = leg && (leg.querySelector('.legend__fams') || leg.querySelector('[class*="colour"]'));
  return { byline: r(by), legend: r(leg), body: r(bw), stage: r(st), colours: r(colours),
    bodyScroll: bw && {sh: bw.scrollHeight, ch: bw.clientHeight, ov: getComputedStyle(bw).overflow},
    legendOverflow: leg && getComputedStyle(leg).overflow };
});
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  log('BASE', JSON.stringify(await meas(page)));
  await shot('base');
  for (const k of ['w','s','h']) { await page.keyboard.press(k); await page.waitForTimeout(1000); }
  log('WSH', JSON.stringify(await meas(page)));
  await shot('wsh');
  await shot('wsh-crop-legend', '.legend');
  // hover byline zone
  await page.keyboard.press('2'); await page.waitForTimeout(1000);
  log('WSH+def2', JSON.stringify(await meas(page)));
  await shot('wsh-def2');
};
