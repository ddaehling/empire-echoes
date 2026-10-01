/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'peak', reveal: true }));
  await page.waitForTimeout(1200);
  log(JSON.stringify(await page.evaluate(() => {
    const chain = (e) => { const c = []; let n = e; while (n && n !== document.body) { c.push((n.className && n.className.toString().slice(0, 34)) || n.tagName); n = n.parentElement; } return c.join(' < '); };
    return {
      overKids: [...document.querySelector('.stage__over').children].map(e => e.className.toString().slice(0, 40)),
      overlayKids: [...document.querySelector('.app__overlay').children].map(e => e.className.toString().slice(0, 40)),
      caption: chain(document.elementFromPoint(120, 500)),
      haze: chain(document.elementFromPoint(500, 460)),
      mapKids: [...document.querySelector('.stage__map').children].map(e => e.className.toString().slice(0, 40)),
    };
  }), null, 1));
};
