/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// Coherence pass: land cold as a 15-year-old and look around.
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(300);
  await shot('00-first-paint');
  await page.waitForTimeout(1200);
  await shot('01-1s5');
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 }).catch(()=>{});
  await page.waitForTimeout(1500);
  await shot('02-landed');
  log('URL:', page.url());
  log('data-boot:', await page.evaluate(() => document.documentElement.dataset.boot));
  const txt = await page.evaluate(() => document.body.innerText);
  log('--- BODY TEXT ---\n' + txt.slice(0, 4000));
  // what mounted
  log('mounted modules:', await page.evaluate(() => Object.keys(window.BEA?.registry?.modules || window.BEA || {})));
  log('slot fill:', await page.evaluate(() => [...document.querySelectorAll('[data-mount]')].map(e => e.dataset.mount + '=' + (e.children.length ? 'filled' : 'EMPTY')).join(' | ')));
  log('state:', await page.evaluate(() => JSON.stringify(window.BEA?.store?.getState?.() ?? {}, (k,v)=> v instanceof Set ? [...v] : v).slice(0, 1500)));
};
