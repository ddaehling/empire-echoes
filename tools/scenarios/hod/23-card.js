module.exports = async ({ page, shot, log }) => {
  await page.goto(page.url().split('#')[0] + '#tour=lesson-one&step=1', { waitUntil:'load' });
  await page.waitForTimeout(11000);
  const open = page.locator('button, a').filter({ hasText: /other routes|what this one leaves out/i }).first();
  if (await open.count()) { await open.click(); await page.waitForTimeout(1200); }
  await shot('card');
  const rows = await page.evaluate(()=>[...document.querySelectorAll('.tr-routes__row, .tr-routes li, .tr-routes > *')].map(r=>(r.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean));
  rows.forEach((r,i)=>log('['+i+'] '+r.slice(0,1200)));
};
