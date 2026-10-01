module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(1000);
  for (let i = 1; i < 9; i++) {
    let nxt = page.locator('button:has-text("Next")').first();
    if (await nxt.count() === 0) { const c = page.locator('.tr-field__cell').nth(4); if (await c.count()) { await c.click().catch(()=>{}); await page.waitForTimeout(500);} nxt = page.locator('button:has-text("Next")').first(); }
    if (await nxt.count() === 0) break;
    await nxt.click(); await page.waitForTimeout(600);
  }
  const yr = async () => await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.tl__year, [class*="year"]').forEach(e => { const t=(e.innerText||'').trim(); if(t && t.length<40) out.push(e.className+'='+t.replace(/\n/g,'/')); });
    return out.slice(0,14);
  });
  log('BEFORE COMPARE year readings: ' + JSON.stringify(await yr()));
  await shot('before-compare');
  // find the compare entry
  const b = await page.evaluate(() => [...document.querySelectorAll('button,a')].filter(e=>e.offsetParent).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,45)));
  log('buttons: ' + b.join(' // '));
};
