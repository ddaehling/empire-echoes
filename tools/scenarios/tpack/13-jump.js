module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  const narrow = await page.evaluate(() => window.innerWidth < 992);
  if (narrow) {
    await page.evaluate(() => { const t = [...document.querySelectorAll('button')].find(b => /Tools/.test(b.innerText)); if (t) t.click(); });
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => { const e = document.querySelector('.tp-entry'); if (e) e.click(); });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const t = [...document.querySelectorAll('[role="tab"]')].find(x => /Classroom/i.test(x.textContent)); if (t) t.click(); });
  await page.waitForTimeout(900);
  log('JUMP ITEMS: ' + JSON.stringify(await page.evaluate(() =>
    [...document.querySelectorAll('.tp-jump__item')].map(b => b.innerText.replace(/\s+/g, ' ')))));
  await shot('jump-bar');
  const before = await page.evaluate(() => (document.querySelector('.tp__pages') || {}).scrollTop);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.tp-jump__item')].find(x => /print/i.test(x.innerText));
    if (b) b.click();
  });
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => ({
    top: (document.querySelector('.tp__pages') || {}).scrollTop,
    focus: document.activeElement ? (document.activeElement.className + ' :: ' + (document.activeElement.innerText || '').slice(0, 40)) : null,
    seen: (() => { const n = document.getElementById('tp-cr-print'); if (!n) return 'no target';
      const r = n.getBoundingClientRect(); return Math.round(r.top) + '..' + Math.round(r.bottom); })(),
  }));
  log('scrollTop ' + before + ' -> ' + JSON.stringify(after));
  await shot('jumped');
};
