module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '#tour=core&step=15'; });
  await page.waitForTimeout(2500);
  const d = await page.evaluate(() => {
    const body = document.querySelector('.app__sheet .cx-sheet__body');
    const cs = body ? getComputedStyle(body) : null;
    return {
      sheetId: (document.querySelector('.app__sheet') || {}).dataset && document.querySelector('.app__sheet').dataset.sheet,
      bodyChildren: body ? [...body.children].map(c => c.className + ' h=' + Math.round(c.getBoundingClientRect().height)) : null,
      bodyOverflow: cs && cs.overflowY, bodyDisplay: cs && cs.display, bodyGrid: cs && cs.gridTemplateRows,
      h: body && Math.round(body.getBoundingClientRect().height), sh: body && body.scrollHeight,
      foot: !!document.querySelector('.tr-panel__foot'),
      text: body ? body.innerText.slice(0, 500) : null,
    };
  });
  log(JSON.stringify(d, null, 1));
  await shot('recall');
};
