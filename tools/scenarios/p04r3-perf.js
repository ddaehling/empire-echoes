/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(2400);
  const r = await page.evaluate(async () => {
    const store = window.BEA.store;
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const t = [];
    const ids = ['british-india', 'kenya', 'nigeria', 'barbados', 'egypt', 'new-zealand', 'canada', 'jamaica'];
    for (let i = 0; i < 40; i++) {
      const a = performance.now();
      store.batch((d) => { d('setYear', 1900 + (i % 40)); d('select', ids[i % ids.length]); });
      t.push(performance.now() - a);
      await sleep(16);
    }
    t.sort((x, y) => x - y);
    return { median: +t[t.length >> 1].toFixed(2), p90: +t[Math.floor(t.length * 0.9)].toFixed(2), max: +t[t.length - 1].toFixed(2) };
  });
  log('dossier render+refit cost per selection change (ms):', JSON.stringify(r));
  const scrub = await page.evaluate(async () => {
    const store = window.BEA.store;
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const t = [];
    for (let y = 1900; y <= 1970; y++) {
      const a = performance.now();
      store.dispatch('setYear', y);
      t.push(performance.now() - a);
      await sleep(8);
    }
    t.sort((x, y) => x - y);
    return { median: +t[t.length >> 1].toFixed(2), p90: +t[Math.floor(t.length * 0.9)].toFixed(2), max: +t[t.length - 1].toFixed(2) };
  });
  log('year-scrub cost per year with the dossier open (ms):', JSON.stringify(scrub));
};
