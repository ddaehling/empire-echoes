module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  for (const id of ['bengal-presidency', 'ireland', 'southern-rhodesia', 'kenya']) {
    await page.evaluate((i) => { BEA.store.act.select(i); }, id);
    await page.waitForTimeout(900);
    await page.evaluate(() => { for (const s of ['taken-full', 'ended-full', 'consequences']) { const b = document.querySelector('[data-act=sheet][data-sheet="' + s + '"]'); if (b) { b.click(); break; } } });
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => {
      const d = document.querySelector('.wq__defect'); const w = document.querySelector('.wq__w');
      if (d) d.scrollIntoView({ block: 'center' });
      return JSON.stringify({ defects: document.querySelectorAll('.wq__defect').length, warrants: document.querySelectorAll('.wq__w').length, first: d ? d.innerText.slice(0, 90) : (w ? w.innerText.slice(0, 90) : 'none') });
    });
    log(id + ' ' + r);
    if (id === 'bengal-presidency') { await page.waitForTimeout(300); await shot('bengal-defect'); }
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  }
};
