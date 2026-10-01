const H = (process.env.HASHES || '#tour=core&step=1,#tour=core&step=5,#tour=core&step=11,#tour=core&step=13,#tour=thirty&step=18').split(',');
module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(1500);
  for (const h of H) {
    await page.evaluate((x) => { location.hash = x; }, h);
    await page.waitForTimeout(2200);
    const d = await page.evaluate(() => ({
      leak: (document.body.innerText.match(/\{\{fig:[a-z0-9-]+\}\}/g) || []).length,
      bare: document.querySelectorAll('.tr-q--bare').length,
      title: (document.querySelector('.cx-sheet__head')||{}).innerText || '',
    }));
    log(JSON.stringify({ h, ...d }));
  }
  await page.evaluate(() => window.BEA.bus.emit('close:open', {}));
  await page.waitForTimeout(1500);
  const c = await page.evaluate(() => ({ voice: window.BEA.closeVoiceAudit, audit: window.BEA.throughLineAudit && window.BEA.throughLineAudit.ok,
    leak: (document.body.innerText.match(/\{\{fig:[a-z0-9-]+\}\}/g) || []).length }));
  log('close ' + JSON.stringify(c));
  await shot('close');
};
