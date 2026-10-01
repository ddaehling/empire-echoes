module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1919', { waitUntil:'load' });
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const out = [];
    for (const p of document.querySelectorAll('svg path,[data-unit],[data-territory]')) {
      const id = p.getAttribute('data-unit') || p.getAttribute('data-territory') || p.getAttribute('id') || '';
      if (/quebec|ontario|qc|on\b/i.test(id)) {
        const s = getComputedStyle(p);
        out.push({ id, fill: s.fill, cls: p.getAttribute('class'), status: p.getAttribute('data-status'), t: p.getAttribute('data-territory') });
      }
    }
    return out.slice(0, 20);
  });
  log('QC/ON', JSON.stringify(info, null, 1));
  await page.evaluate(() => { const m = document.querySelector('.map__zoom'); });
  await shot('map1919');
  await page.evaluate(() => window.scrollTo(0,0));
  await shot('crop', 'svg');
};
