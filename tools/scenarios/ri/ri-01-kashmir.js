module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  await page.evaluate(() => { BEA.store.act.setYear(1846); BEA.store.act.select('jammu-and-kashmir'); });
  await page.waitForTimeout(1500);
  await shot('kashmir-dossier');
  const txt = await page.evaluate(() => {
    const b = document.querySelector('[data-block=taken]');
    return b ? b.innerText : 'NO TAKEN BLOCK';
  });
  log('TAKEN BLOCK:\n' + txt);
  const geom = await page.evaluate(() => {
    const p = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; };
    return JSON.stringify({ map: p('.map__frame'), dossier: p('.app__dossier'), time: p('.app__time') });
  });
  log('GEOM ' + geom);
  const errs = await page.evaluate(() => (window.__errs || []).slice(0, 20));
  log('ERRS ' + JSON.stringify(errs));
};
