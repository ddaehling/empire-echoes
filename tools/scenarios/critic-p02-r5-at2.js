/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'querySelectorAll').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&def=claimed', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  const painted = () => page.evaluate(() => {
    const svg = document.querySelector('.map__plate svg');
    const ids = new Set();
    svg.querySelectorAll('[data-unit]').forEach(e=>{
      const cs = getComputedStyle(e);
      if (cs.display!=='none' && cs.visibility!=='hidden' && +cs.opacity>0.02) ids.add(e.getAttribute('data-unit'));
    });
    return [...ids];
  });
  const api = () => page.evaluate(() => {
    const d = window.__data || window.data || (window.app&&window.app.data);
    if (!d) return {none:Object.keys(window).filter(k=>/data|app|store/i.test(k))};
    const m = d.metricsAt ? d.metricsAt(1913) : null;
    return { hasMetricsAt: !!d.metricsAt, byDegree: m && m.byDegree, keys: m?Object.keys(m):null };
  });
  const a = await painted(); log('claimed painted:', a.length);
  log('API:', JSON.stringify(await api()));
  await page.goto('http://localhost:8777/app/#year=1913&def=controlled', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const b = await painted(); log('controlled painted:', b.length);
  log('diff', a.length-b.length);
  log('sample removed:', a.filter(x=>!b.includes(x)).slice(0,20).join(','));
  // globals
  log('globals:', await page.evaluate(()=>Object.keys(window).filter(k=>!/^(webkit|chrome)/.test(k)&&k.length<24&&/^[a-z_$]/.test(k)).slice(0,80).join(' ')));
};
