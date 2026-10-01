module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  await page.evaluate(() => { BEA.store.act.setYear(1836); BEA.store.act.select('barbados'); });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = document.querySelector('[data-act=sheet][data-sheet=consequences]'); if (b) b.click(); });
  await page.waitForTimeout(800);
  await page.evaluate(() => { const n = document.querySelector('.dsr__money'); if (n) n.scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(300); await shot('dark-money');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.evaluate(() => BEA.store.act.select('ireland'));
  await page.waitForTimeout(1000);
  await page.evaluate(() => { for (const s of ['taken-full','ended-full','consequences']) { const b = document.querySelector('[data-act=sheet][data-sheet="'+s+'"]'); if (b) { b.click(); break; } } });
  await page.waitForTimeout(800);
  await page.evaluate(() => { const d = document.querySelector('.wq__defect'); if (d) d.scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(300); await shot('dark-defect');
  log('theme ' + await page.evaluate(() => document.documentElement.dataset.theme || getComputedStyle(document.documentElement).colorScheme));
};
