/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const d = await page.evaluate(() => {
    const targets = [...document.querySelectorAll('.map__target')].map(t => ({id:t.dataset.unit, aria:t.getAttribute('aria-label')}));
    return {count: targets.length, sample: targets.slice(0,8), ids: targets.map(t=>t.id)};
  });
  log('TARGETS:', d.count);
  log('SAMPLE:', JSON.stringify(d.sample, null, 1));
  const suspicious = ['hawaii','reunion','maluku','us-florida','florida','pitcairn','union','anguilla','weihaiwei'];
  log('IDS containing suspicious:', JSON.stringify(d.ids.filter(i=>suspicious.some(s=>i.includes(s)))));
  // Query the data API directly
  const api = await page.evaluate(async () => {
    const w = window;
    const keys = Object.keys(w).filter(k=>/atlas|data|store|app|BE/i.test(k));
    return keys.slice(0,40);
  });
  log('WINDOW KEYS:', JSON.stringify(api));
};
