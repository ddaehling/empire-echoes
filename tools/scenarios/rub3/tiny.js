module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=period&step=3', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(3500);
  await shot('s3');
  const m = await page.evaluate(() => {
    const app = document.getElementById('app');
    const r = (s) => { const e = document.querySelector(s); return e ? {w:Math.round(e.getBoundingClientRect().width), h:Math.round(e.getBoundingClientRect().height), sh: e.scrollHeight} : null; };
    return { read: app.getAttribute('data-read'), rail: app.getAttribute('data-rail'),
      body: r('.tr-panel__body') || r('.cx-sheet__body'), sheet: r('.cx-sheet'), map: r('.stage__map'),
      vh: innerHeight, vw: innerWidth, docScroll: document.documentElement.scrollHeight > innerHeight + 2 };
  });
  log(JSON.stringify(m, null, 1));
  await page.goto('http://localhost:8777/app/#tour=period&step=1', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await shot('s1');
};
