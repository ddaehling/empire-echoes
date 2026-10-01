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
  await page.waitForTimeout(3000);
  // what does the data API say
  const m = await page.evaluate(() => {
    const d = window.__atlas?.data || window.data || window.App?.data;
    if (!d) return { err: 'no data on window', keys: Object.keys(window).filter(k=>/atlas|app|data|store/i.test(k)) };
    const met = d.metricsAt ? d.metricsAt(1913) : null;
    return { byDegree: met && met.byDegree, metKeys: met && Object.keys(met) };
  });
  log('metricsAt(1913):', JSON.stringify(m));
  for (const def of ['claimed','administered','controlled','influenced']) {
    await page.goto(page.url().split('#')[0] + '#year=1913&def=' + def);
    await page.waitForTimeout(1600);
    const counts = await page.evaluate(() => {
      const el = document.querySelector('[data-map-count], .map-def-count');
      const txt = document.body.innerText;
      const mm = txt.match(/(\d[\d,]*)\s+units drawn/);
      const km = txt.match(/([\d.,]+)\s*(million km|km)/);
      return { unitsDrawn: mm && mm[1], km: km && km[0] };
    });
    log(def, JSON.stringify(counts));
    await shot('def-' + def);
  }
  log('ERRORS', JSON.stringify(errs));
};
