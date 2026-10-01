/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const READY = () => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready';
const m = () => { const n = document.querySelector('.stage__map'); const b = n.getBoundingClientRect();
  const c = document.querySelector('.cmp'); const cb = c && !c.hidden ? c.getBoundingClientRect() : null;
  return { stageMap: [Math.round(b.width), Math.round(b.height)], cmp: cb ? [Math.round(cb.width), Math.round(cb.height)] : null }; };
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(READY); await page.waitForTimeout(1200);
  log('cold plate: ' + JSON.stringify(await page.evaluate(m)));
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(READY); await page.waitForTimeout(1300);
  log('in beat 9:  ' + JSON.stringify(await page.evaluate(m)));
  await page.keyboard.press('v'); await page.waitForTimeout(1100);
  log('+ compare:  ' + JSON.stringify(await page.evaluate(m)));
  await page.keyboard.press('Escape'); await page.waitForTimeout(1400);
  log('back:       ' + JSON.stringify(await page.evaluate(m)));
};
