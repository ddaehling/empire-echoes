module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1500);
  await shot('beat-01');
  const grab = async () => page.evaluate(() => {
    const p = document.querySelector('.tour, [class*="tour"], [class*="beat"]');
    return (p ? p.innerText : document.body.innerText).replace(/\n{2,}/g, '\n').slice(0, 2600);
  });
  log('STEP 1 ::', await grab());
  for (let i = 2; i <= 30; i++) {
    const next = page.getByRole('button', { name: /^(Next|Continue|Go on|Onward)/i }).first();
    let ok = await next.count();
    if (!ok) {
      const alt = page.locator('button:visible').filter({ hasText: /next|continue|→/i });
      ok = await alt.count();
      if (!ok) { log('NO NEXT at step', i); break; }
      await alt.first().click();
    } else await next.click();
    await page.waitForTimeout(1200);
    log('--- STEP ' + i + ' ::', await grab());
    if (i <= 6 || i % 4 === 0) await shot('beat-' + String(i).padStart(2, '0'));
  }
};
