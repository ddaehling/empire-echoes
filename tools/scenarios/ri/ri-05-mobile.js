module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  const geom = async (tag) => log(tag + ' ' + await page.evaluate(() => {
    const p = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); };
    return JSON.stringify({ map: p('.map__frame'), dossier: p('.app__dossier'), time: p('.app__time') });
  }));
  await geom('GEOM cold');
  await page.evaluate(() => { BEA.store.act.setYear(1846); BEA.store.act.select('jammu-and-kashmir'); });
  await page.waitForTimeout(1400);
  await geom('GEOM dossier-open');
  log('TAKEN: ' + await page.evaluate(() => { const b = document.querySelector('[data-block=taken]'); return b ? b.innerText.replace(/\n+/g, ' | ') : 'NONE'; }));
  await shot('kashmir-390');
  // warrant on a phone
  await page.evaluate(() => BEA.store.act.select('barbados'));
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = document.querySelector('[data-act=sheet][data-sheet=consequences]'); if (b) b.click(); });
  await page.waitForTimeout(900);
  const m = await page.evaluate(() => { const n = document.querySelector('.dsr__money'); if (!n) return 'NO MONEY'; n.scrollIntoView({ block: 'center' }); return n.innerText.slice(0, 200); });
  log('MONEY 390: ' + m);
  await page.waitForTimeout(300);
  await shot('barbados-money-390');
  log('overflow-x: ' + await page.evaluate(() => document.documentElement.scrollWidth + '/' + window.innerWidth));
};
