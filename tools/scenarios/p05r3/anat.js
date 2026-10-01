const STEPS = (process.env.STEPS || '1').split(',');
const TOUR = process.env.TOUR || 'core';
module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(1500);
  for (const s of STEPS) {
    await page.evaluate((h) => { location.hash = h; }, '#tour=' + TOUR + '&step=' + s);
    await page.waitForTimeout(1600);
    const d = await page.evaluate(() => {
      const flow = document.querySelector('.tr-panel__flow');
      const scr = document.querySelector('.tr-panel__scroll');
      const kids = flow ? [...flow.children].map(c => (c.className||'').split(' ')[0] + ':' + Math.round(c.getBoundingClientRect().height)) : null;
      return { fit: document.documentElement.getAttribute('data-tour-fit'),
        scroll: scr ? { h: Math.round(scr.getBoundingClientRect().height), sh: scr.scrollHeight } : null, kids };
    });
    log('STEP ' + s + ' ' + JSON.stringify(d));
  }
};
