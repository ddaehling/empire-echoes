const HASH = process.env.HASH || '#tour=core&step=15';
module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(1500);
  await page.evaluate((h) => { location.hash = h; }, HASH);
  await page.waitForTimeout(3200);
  const d = await page.evaluate(() => {
    const body = document.querySelector('.app__sheet .cx-sheet__body');
    const foot = document.querySelector('.tr-panel__foot');
    const commit = [...document.querySelectorAll('.app__sheet button')].find(b => /commit/i.test(b.textContent||''));
    const blk = document.querySelector('.cl-blk');
    const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { t: Math.round(b.top), b: Math.round(b.bottom), h: Math.round(b.height) }; };
    const scr = document.querySelector('.tr-panel__scroll');
    return { foot: !!foot, footNext: !!document.querySelector('.tr-panel__foot .tr-panel__next'),
      body: body ? { h: Math.round(body.getBoundingClientRect().height), sh: body.scrollHeight } : null,
      commit: r(commit), blk: r(blk), foota: r(foot),
      scroll: scr ? { h: Math.round(scr.getBoundingClientRect().height), sh: scr.scrollHeight } : null,
      title: (document.querySelector('.cx-sheet__head')||{}).innerText };
  });
  log(JSON.stringify(d));
  await shot('s');
};
