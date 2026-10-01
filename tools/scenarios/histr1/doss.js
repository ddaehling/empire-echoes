const IDS = process.env.HIDS ? process.env.HIDS.split(',') : [];
module.exports = async ({ page, log }) => {
  for (const id of IDS) {
    await page.goto('http://localhost:8777/app/#sel=' + id + '&filter=stage:apparatus', { waitUntil: 'load' });
    await page.waitForTimeout(1400);
    const t = await page.evaluate(() => {
      const d = document.querySelector('.ds, .dossier, [class*="dossier"], aside') || document.body;
      return d.innerText;
    });
    log('\n\n############ ' + id + ' ############\n' + t.slice(0, 3200));
  }
};
