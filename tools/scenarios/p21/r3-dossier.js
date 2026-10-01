/* The spine when a dossier is the surface, not a beat. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1857&sel=british-india', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2200);
  const r = await page.evaluate(() => {
    const app = document.getElementById('app');
    const b = document.querySelector('.cl-blk');
    const host = b && b.parentElement;
    const hr = host ? host.getBoundingClientRect() : null;
    const br = b ? b.getBoundingClientRect() : null;
    return { foot: app.dataset.foot, stage: app.dataset.stage,
      host: host ? host.className.split(' ')[0] : null,
      blk: br ? { y: Math.round(br.y), h: Math.round(br.height) } : null,
      hostBottom: hr ? Math.round(hr.bottom) : null,
      visible: br ? (br.top < innerHeight && br.bottom > 0 && br.height > 8) : false,
      pos: b ? getComputedStyle(b).position : null,
      docScroll: document.documentElement.scrollHeight - innerHeight };
  });
  log('DOSSIER HOST: ' + JSON.stringify(r));
  await shot('dossier');
};
