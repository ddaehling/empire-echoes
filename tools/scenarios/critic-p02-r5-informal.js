/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913&def=influenced'; });
  await page.waitForTimeout(1500);
  await page.keyboard.press('e');
  await page.waitForTimeout(1800);
  await shot('influenced-big');
  // crop South America + Persia
  const p = await page.evaluate(() => { const b=document.querySelector('.map__plate').getBoundingClientRect(); return {x:b.x,y:b.y,w:b.width,h:b.height}; });
  await page.screenshot({ path: require('path').join(process.env.OUTDIR||'/tmp/cp02r5-inf','crop-sa.png'), clip: { x: p.x+120, y: p.y+180, width: 420, height: 300 } });
  await page.screenshot({ path: require('path').join(process.env.OUTDIR||'/tmp/cp02r5-inf','crop-persia.png'), clip: { x: p.x+880, y: p.y+40, width: 420, height: 300 } });
  // legend text about haze
  const t = await page.evaluate(() => document.body.innerText);
  const i = t.indexOf('Haze');
  log('LEGEND HAZE CONTEXT: ' + t.slice(Math.max(0,i-400), i+700));
  // click an informal unit
  const el = await page.$('[data-unit="ar-buenos-aires"], [data-unit="iran"]');
  if (el) { await el.click(); await page.waitForTimeout(1500); await shot('informal-selected'); log('after click body:\n' + (await page.evaluate(()=>document.body.innerText)).slice(0,1500)); }
  else log('NO informal target element found');
};
