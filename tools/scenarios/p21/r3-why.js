module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1800);
  const snap = () => page.evaluate(() => {
    const R = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
    const body = document.querySelector('.cx-sheet__body');
    const app = document.getElementById('app');
    const cs = getComputedStyle(app);
    return {
      map: R('.stage__map'), sheet: R('.app__sheet'), body: R('.cx-sheet__body'),
      bodySH: body ? body.scrollHeight : null,
      kids: body ? [...body.children].map((c) => c.className.split(' ')[0] + ':' + Math.round(c.getBoundingClientRect().height)) : null,
      railTopMin: cs.getPropertyValue('--rail-top-min').trim(),
      mapMin: cs.getPropertyValue('--map-min').trim(),
      blkLast: body ? (body.lastElementChild && body.lastElementChild.className.split(' ')[0]) : null,
    };
  });
  log('WITH SPINE: ' + JSON.stringify(await snap()));
  await page.addStyleTag({ content: '.cl-blk{display:none !important}' });
  await page.waitForTimeout(1200);
  log('SPINE HIDDEN: ' + JSON.stringify(await snap()));
};
