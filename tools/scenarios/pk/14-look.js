module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1700);
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>/teaching desk|§/i.test(x.innerText||'')); if(b)b.click(); });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const t=[...document.querySelectorAll('[role="tab"]')].find(x=>/classroom/i.test(x.innerText)); if(t)t.click(); });
  await page.waitForTimeout(1100);
  const n = process.env.LESSON || '2';
  await page.evaluate((k) => { const b=document.querySelector('.tp-unit__b[data-lesson="'+k+'"]'); if(b)b.click(); }, n);
  await page.waitForTimeout(1000);
  const shotOf = async (sel, name) => {
    const box = await page.locator(sel).first().boundingBox().catch(() => null);
    if (!box) { log('MISSING ' + sel); return; }
    await page.evaluate((s) => { document.querySelector(s).scrollIntoView({block:'start'}); }, sel);
    await page.waitForTimeout(300);
    const b2 = await page.locator(sel).first().boundingBox();
    await page.screenshot({ path: (process.env.OUTDIR||'/tmp/pk16') + '/' + name + '.png',
      clip: { x: b2.x, y: Math.max(0,b2.y), width: b2.width, height: Math.min(1100, b2.height) } });
    log('shot ' + name + ' ' + Math.round(b2.height) + 'px');
  };
  await shotOf('#tp-cr-board', 'board');
  await shotOf('#tp-cr-lesson', 'plan');
  await shotOf('#tp-cr-pack', 'pack');
};
