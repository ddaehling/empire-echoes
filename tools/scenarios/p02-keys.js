/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const stage = require('./p02-stage.js');
module.exports = async ({ page, shot, log }) => {
  await page.waitForSelector('.map__plate', { timeout: 20000 });
  await stage(page);
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1913); window.BEA.store.flush(); });
  await page.waitForTimeout(500);
  // focus the listbox by tabbing to the first option
  await page.evaluate(() => { const n = document.querySelector('.map__target[tabindex="0"]'); if (n) n.focus(); });
  const start = await page.evaluate(() => document.activeElement && document.activeElement.dataset.unit);
  const seq = [];
  for (const k of ['ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowLeft']) {
    await page.keyboard.press(k);
    await page.waitForTimeout(220);
    seq.push(await page.evaluate(() => document.activeElement && document.activeElement.dataset.unit));
  }
  log('KEYBOARD from ' + start + ' → ' + seq.join(' → '));
  const modes = [];
  for (const k of ['2', '3', '4', '1']) { await page.keyboard.press(k); await page.waitForTimeout(300); modes.push(await page.evaluate(() => window.__map.definition)); }
  log('KEYS 1–4 definition: ' + modes.join(' → '));
  for (const [k, get] of [['s', 'stitch'], ['w', 'weight'], ['h', 'silence'], ['p', 'proj']]) {
    await page.keyboard.press(k); await page.waitForTimeout(700);
    const v = await page.evaluate((g) => (g === 'stitch' ? window.__map.stitch : g === 'silence' ? window.__map.silenceMode : g === 'proj' ? window.__map.plate.projTo : !!window.__map.plate.weight), get);
    log('KEY ' + k + ' → ' + get + '=' + v);
    await page.keyboard.press(k); await page.waitForTimeout(700);
  }
  // click a unit: does anything throw?
  await page.evaluate(() => { const s = window.__map.unitScreen('jamaica'); const c = document.querySelector('.map__plate').getBoundingClientRect(); window.__clickAt = [c.left + s.mx, c.top + s.my]; });
  const at = await page.evaluate(() => window.__clickAt);
  await page.mouse.move(at[0], at[1]); await page.waitForTimeout(300);
  const tip = await page.evaluate(() => { const t = document.querySelector('.map__tip'); return t.hidden ? null : t.textContent.replace(/\s+/g, ' ').slice(0, 200); });
  log('HOVER Jamaica tip: ' + tip);
  await page.mouse.click(at[0], at[1]); await page.waitForTimeout(1200);
  log('after click, selected=' + await page.evaluate(() => window.BEA.store.getState().selectedTerritoryId));
  await shot('after-click');
};
