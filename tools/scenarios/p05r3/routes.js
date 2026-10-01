module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2200);
  const d = await page.evaluate(() => new Promise((res) => {
    const done = (p) => res(p.routes.map(r => r.id + ' ' + r.steps + ' stops · ' + r.minutes + ' / ' + r.minutesMax + ' say=' + r.minutesSay + ' exact=' + r.minutesExact + '-' + r.minutesExactMax));
    window.BEA.bus.emit('tours:start', { step: 0 });
    setTimeout(() => {
      const off = window.BEA.bus.on('tours:ready', done);
      window.BEA.bus.emit('app:ready', {});
      setTimeout(() => res('timeout'), 1500);
    }, 200);
  }));
  log(JSON.stringify(d, null, 1));
};
