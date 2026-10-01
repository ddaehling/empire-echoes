module.exports = async ({ page, shot, log }) => {
  const route = process.env.HIST_ROUTE || 'lesson-one';
  const last = Number(process.env.HIST_LAST || 9);
  await page.goto('http://localhost:8777/app/#tour=' + route + '&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  for (let s = 1; s <= last; s++) {
    await page.evaluate((h) => { window.location.hash = h; }, '#tour=' + route + '&step=' + s);
    await page.waitForTimeout(900);
    for (const lbl of ['Commit this guess','Commit','Place it','That is my guess']) {
      const b = page.locator('button', { hasText: lbl }).first();
      if (await b.count() && await b.isVisible().catch(()=>false) && await b.isEnabled().catch(()=>false)) { await b.click().catch(()=>{}); await page.waitForTimeout(500); }
    }
  }
  await page.evaluate(() => { const b=[...document.querySelectorAll('button,a')].find(x=>/finish/i.test(x.textContent||'')); if(b) b.click(); });
  await page.waitForTimeout(2500);
  const m = await page.evaluate(() => {
    const rows=[...document.querySelectorAll('.cl-line,[class*="cl-line"]')].map(r=>({cls:r.className,t:(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,220)}));
    return { n: rows.length, rows, audit: (window.BEA&&window.BEA.closeAudit)||null,
      body: (document.querySelector('.app__sheet')||document.body).innerText.replace(/\n{3,}/g,'\n\n').slice(0,7000) };
  });
  log('LINES ' + m.n);
  m.rows.forEach((r,i)=>log('['+(i+1)+'] '+r.cls+' | '+r.t));
  log('AUDIT ' + JSON.stringify(m.audit));
  log('===== CLOSE BODY =====');
  log(m.body);
  await shot('close-' + route);
};
