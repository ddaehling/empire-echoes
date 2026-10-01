module.exports = async ({ page, log, shot }) => {
  const base = 'http://localhost:8777/app/';
  await page.goto(base + '#tour=period&step=6', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(2000);
  const read = () => page.evaluate(() => {
    const a = document.querySelector('.cx-sheet__body'), b = document.querySelector('.tr-panel__scroll');
    return { outer: a ? a.scrollTop + '/' + (a.scrollHeight - a.clientHeight) : null,
      inner: b ? b.scrollTop + '/' + (b.scrollHeight - b.clientHeight) : null };
  });
  log('before ' + JSON.stringify(await read()));
  await shot('01-before');
  /* thumb drag in the middle of the prose */
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(700);
  log('after wheel over prose ' + JSON.stringify(await read()));
  await shot('02-after-prose-scroll');
  /* keep scrolling to the end of the inner, then more */
  for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(250); }
  log('after 8 more ' + JSON.stringify(await read()));
  await shot('03-inner-end');
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(250); }
  log('after 6 more ' + JSON.stringify(await read()));
  await shot('04-outer');
};
