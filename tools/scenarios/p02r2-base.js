/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  await shot('01-world');
  log('errors', JSON.stringify(errs.slice(0, 10)));
  const info = await page.evaluate(() => {
    const m = window.__map;
    const tinyTargets = [...document.querySelectorAll('.map__target.is-tiny')].length;
    return {
      units: m.plate.paint.size,
      def: m.definition, proj: m.projection,
      targets: document.querySelectorAll('.map__target').length,
      tinyTargets,
      readout: document.querySelector('.map__switch').innerText.replace(/\n+/g, ' | '),
      mods: window.BEA.registry.report().mounted,
    };
  });
  log('info', JSON.stringify(info, null, 1));
};
