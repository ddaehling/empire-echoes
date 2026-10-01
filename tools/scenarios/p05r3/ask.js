module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '#tour=core&step=1'; });
  await page.waitForTimeout(3200);
  const d = await page.evaluate(() => {
    const scr = document.querySelector('.tr-panel__scroll');
    const box = scr.getBoundingClientRect();
    const ask = document.querySelector('.cx-ask');
    const kid = (e) => [...e.children].map(c => (c.className||'').split(' ')[0] + ':' + Math.round(c.getBoundingClientRect().height) + '@' + Math.round(c.getBoundingClientRect().top - box.top));
    const foot = document.querySelector('.tr-panel__foot');
    return { win: Math.round(box.height), askKids: kid(ask),
      foot: foot ? [...foot.children].map(c => c.className.split(' ')[0] + ' w=' + Math.round(c.getBoundingClientRect().width)) : null };
  });
  log(JSON.stringify(d, null, 1));
  await shot('poster');
};
