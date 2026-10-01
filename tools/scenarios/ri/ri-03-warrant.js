async function openSheet(page, id) {
  return page.evaluate((sid) => {
    const b = document.querySelector('[data-act=sheet][data-sheet="' + sid + '"]');
    if (!b) return 'no button for ' + sid;
    b.click(); return 'clicked ' + sid;
  }, id);
}
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  await page.evaluate(() => { BEA.store.act.setYear(1836); BEA.store.act.select('barbados'); });
  await page.waitForTimeout(1400);
  log('contract v' + await page.evaluate(() => (window.BEA.warrant ? window.BEA.warrant.contract.version : 'MISSING')));
  log('audit ' + await page.evaluate(() => JSON.stringify((({ total, ok, weak, bare }) => ({ total, ok, weak, bare }))(window.BEA.warrant.auditWarrants(window.BEA.data.territories)))));
  log(await openSheet(page, 'consequences'));
  await page.waitForTimeout(900);
  log('MONEY:\n' + await page.evaluate(() => {
    const m = document.querySelector('.dsr__money');
    if (!m) return 'NO MONEY BLOCK';
    m.scrollIntoView({ block: 'center' });
    return m.innerText;
  }));
  await page.waitForTimeout(400); await shot('barbados-money');
  log('nodes ' + await page.evaluate(() => JSON.stringify({ w: document.querySelectorAll('.wq__w').length, d: document.querySelectorAll('.wq__defect').length })));

  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate(() => BEA.store.act.select('kenya'));
  await page.waitForTimeout(1200);
  log(await openSheet(page, 'taken-full'));
  await page.waitForTimeout(900);
  log('KENYA: ' + await page.evaluate(() => {
    const d = document.querySelector('.wq__defect');
    if (!d) return 'NO DEFECT — ' + JSON.stringify({ w: document.querySelectorAll('.wq__w').length, wrap: document.querySelectorAll('.dsr__tollwrap').length });
    d.scrollIntoView({ block: 'center' });
    return d.innerText;
  }));
  await page.waitForTimeout(400); await shot('kenya-defect');
};
