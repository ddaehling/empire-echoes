module.exports = async ({ page, log, shot }) => {
  const read = () => page.evaluate(() => {
    const y = s => [...document.querySelectorAll(s)].filter(e => e.getClientRects().length).map(e => +e.getBoundingClientRect().y.toFixed(1));
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [+b.y.toFixed(1), +b.height.toFixed(1), +b.width.toFixed(1)]; };
    return { stage: document.documentElement.dataset.stage, rail: !!document.querySelector('.app__dossier:not([hidden]), .app__sheet:not([hidden])'),
      axis: r('.tl-ax__axis'), lanes: y('.tl-lane'), ticks: y('.tl-ax__tick').slice(0, 3), time: r('.app__time'), body: r('.tl__body') };
  });
  await page.waitForTimeout(2300);
  log('plate     ', JSON.stringify(await read()));
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:stage', { level: 'working' })); await page.waitForTimeout(700);
  log('working   ', JSON.stringify(await read()));
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:stage', { level: 'apparatus' })); await page.waitForTimeout(900);
  log('apparatus ', JSON.stringify(await read()));
  // open the rail and HOLD it
  const st = await page.$('.stage__map');
  if (st) { const b = await st.boundingBox(); await page.mouse.click(b.x + b.width * 0.55, b.y + b.height * 0.42); }
  await page.waitForTimeout(1400);
  log('rail open ', JSON.stringify(await read()));
  await shot('rail-open');
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:sheet', { node: document.createElement('div'), title: 'x' })); await page.waitForTimeout(900);
  log('sheet open', JSON.stringify(await read()));
};
