module.exports = async ({ page, log }) => {
  const base = page.url().split('#')[0];
  await page.addInitScript(() => {
    window.__trace = [];
    const t0 = performance.now();
    window.__trace.push(['init', location.hash, +t0.toFixed(0)]);
    addEventListener('hashchange', () => window.__trace.push(['hashchange', location.hash, +performance.now().toFixed(0)]));
    setTimeout(() => { window.__trace.push(['set@0-before', location.hash, +performance.now().toFixed(0)]); location.hash = '#tour=lesson-two&step=4'; window.__trace.push(['set@0-after', location.hash, +performance.now().toFixed(0)]); }, 0);
    const iv = setInterval(() => { window.__trace.push(['tick', location.hash, +performance.now().toFixed(0)]); if (performance.now() - t0 > 4000) clearInterval(iv); }, 250);
  });
  await page.goto(base + '#tour=lesson-one&step=9', { waitUntil: 'commit' });
  await page.waitForFunction(() => window.BEA?.store?.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(2500);
  const tr = await page.evaluate(() => window.__trace);
  tr.forEach(r => log(JSON.stringify(r)));
  log('final', await page.evaluate(() => location.hash + ' | store ' + window.BEA.store.getState().activeTour + '@' + window.BEA.store.getState().tourStep));
};
