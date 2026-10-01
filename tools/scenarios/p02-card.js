/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'textContent').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const stage = require('./p02-stage.js');
module.exports = async ({ page, log }) => {
  await page.waitForSelector('.map__plate', { timeout: 20000 });
  await stage(page);
  const txt = await page.evaluate(() => {
    window.BEA.store.dispatch('setYear', 1913); window.BEA.store.flush();
    return document.querySelector('.map__switchbody').textContent.replace(/\s+/g, ' ');
  });
  log('CARD 1913: ' + txt);
  const sil = await page.evaluate(() => {
    window.__map.setSilenceMode(true);
    window.BEA.store.dispatch('setYear', 1700); window.BEA.store.flush();
    const a = document.querySelector('.map__switchbody').textContent.replace(/\s+/g, ' ');
    window.BEA.store.dispatch('setYear', 1970); window.BEA.store.flush();
    const b = document.querySelector('.map__switchbody').textContent.replace(/\s+/g, ' ');
    window.__map.setSilenceMode(false);
    return { a, b };
  });
  log('CARD 1700 + silences: ' + sil.a.slice(380, 1200));
  log('CARD 1970 + silences: ' + sil.b.slice(0, 900));
};
