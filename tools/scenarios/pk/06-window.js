/* pk/06-window — the desk's readable window at whatever size this is. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => /teaching desk|§/i.test(x.innerText || ''));
    if (b) b.click(); else location.hash = '#panel=classroom';
  });
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('[role="tab"]')].find(x => /classroom/i.test(x.innerText));
    if (t) t.click();
  });
  await page.waitForTimeout(1200);
  log(JSON.stringify(await page.evaluate(() => {
    const b = document.querySelector('.cx-sheet__body');
    const s = document.querySelector('.app__sheet');
    return { win: innerWidth + 'x' + innerHeight,
      sheet: s ? Math.round(s.getBoundingClientRect().height) : null,
      read: b ? b.clientHeight : null,
      holds: b ? b.scrollHeight : null,
      screens: b ? +(b.scrollHeight / Math.max(1, b.clientHeight)).toFixed(1) : null };
  })));
};
