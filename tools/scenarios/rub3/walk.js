module.exports = async ({ page, shot, log }) => {
  const route = process.env.RUB_ROUTE || 'period';
  await page.goto('http://localhost:8777/app/#tour=' + route + '&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(3000);
  const meta = await page.evaluate((r) => {
    const rs = (window.BEA.toursRoutes||{}).routes||[];
    const m = rs.find(x=>x.id===r); return m ? {steps:m.steps, label:m.label} : null;
  }, route);
  log('ROUTE ' + route + ' ' + JSON.stringify(meta));
  const N = meta ? meta.steps : 10;
  for (let i = 1; i <= N + 1; i++) {
    const st = await page.evaluate(() => {
      const app = document.getElementById('app');
      const panel = document.querySelector('.tr-panel') || document.querySelector('.cx-sheet');
      const t = (el) => el ? el.innerText.replace(/\n{3,}/g,'\n\n').trim() : '(none)';
      return {
        step: app && app.getAttribute('data-step'),
        tour: app && app.getAttribute('data-tour'),
        year: app && app.getAttribute('data-year'),
        hash: location.hash,
        words: (t(panel).match(/\S+/g)||[]).length,
        panel: t(panel).slice(0, 1600),
      };
    });
    log('--- index ' + i + ' | step=' + st.step + ' year=' + st.year + ' hash=' + st.hash + ' words=' + st.words + '\n' + st.panel);
    if (i === 1 || i === Math.ceil(N/2) || i === N) await shot('s' + i);
    const next = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const b = btns.find(x => /^(next|continue|go on|→)/i.test((x.innerText||'').trim()) && x.offsetParent);
      if (b) { b.click(); return (b.innerText||'').trim(); }
      return null;
    });
    if (!next) { log('NO NEXT at index ' + i); break; }
    await page.waitForTimeout(900);
  }
};
