const HASH = process.env.HASH || '#tour=core&step=9';
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/' + HASH, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  // walk two steps forward so there is something in the record
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => { const b = document.querySelector('.tr-bar__next'); if (b && !b.disabled) b.click(); });
    await page.waitForTimeout(700);
  }
  await page.evaluate(() => window.BEA.bus.emit('close:open', {}));
  await page.waitForTimeout(1200);
  const d = await page.evaluate(() => {
    const s = document.querySelector('.app__sheet');
    const late = document.querySelector('.cl-close__late');
    const lines = [...document.querySelectorAll('li.cl-line')];
    return {
      stand: (document.querySelector('.cl-close__stand') || {}).innerText || '',
      late: late ? late.innerText : null,
      earned: lines.filter(l => l.dataset.can === 'yes').length,
      greyed: lines.filter(l => l.dataset.can !== 'yes').length,
      voice: window.BEA.closeVoiceAudit,
      links: [...document.querySelectorAll('.tr-print__link')].map(x => x.textContent).slice(0, 4),
    };
  });
  log(JSON.stringify(d, null, 1));
  await shot('late');
};
