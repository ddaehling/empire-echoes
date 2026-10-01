/* hh/28-b3 — the time band's height against LAYOUT_BUDGET B3, at apparatus, NOT playing. */
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#filter=stage:apparatus', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(2200);
  const m = await page.evaluate(() => {
    const bar = document.querySelector('.app__time');
    const r = bar.getBoundingClientRect();
    const kids = [...bar.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.height > 2 && b.bottom > r.bottom + 1; })
      .map(e => e.tagName + '.' + String(e.className).split(' ')[0] + ' overflows by ' + Math.round(e.getBoundingClientRect().bottom - r.bottom) + 'px');
    return { stage: document.documentElement.dataset.stage, playing: !!document.querySelector('.tl__transport button')?.textContent.match(/Pause/),
      allotted: Math.round(r.height), asks: bar.scrollHeight, over: [...new Set(kids)].slice(0, 8),
      vh: innerHeight, bottom: Math.round(r.bottom) };
  });
  log(JSON.stringify(m, null, 1));
  await shot('b3');
};
