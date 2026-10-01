/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(900);
  await shot('mode');
  log('spine:', await page.evaluate(()=>document.querySelector('.tl-spine')?.innerText.replace(/\n/g,' | ')));
  log('cards:', await page.evaluate(()=>[...document.querySelectorAll('.tl-chg')].filter(n=>n.offsetParent).map(n=>n.innerText.replace(/\n/g,' · ').slice(0,90)).join(' /// ')));
  const geom = await page.evaluate(() => {
    const t = document.querySelector('.tl__track');
    const ax = document.querySelector('.tl-ax');
    const sp = document.querySelector('.tl-spine');
    const g = e => e ? JSON.parse(JSON.stringify(e.getBoundingClientRect())) : null;
    return { track: g(t), scrollW: t?.scrollWidth, clientW: t?.clientWidth, ax: g(ax), spine: g(sp), vw: innerWidth, vh: innerHeight };
  });
  log('geom:', JSON.stringify(geom));
};
