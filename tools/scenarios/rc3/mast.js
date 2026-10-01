module.exports = async ({ page, shot, log }) => {
  for (const s of [1,3,5,8,9,11,14,15]) {
    await page.goto('http://localhost:8777/app/#tour=core&step='+s+'&filter=stage:working,pressure:off');
    await page.waitForTimeout(1800);
    const m = await page.evaluate(() => {
      const bar = document.querySelector('.app__bar, header, [class*="masthead"], [class*="cx-bar"]');
      const b = bar ? [...bar.querySelectorAll('button,a[href]')].filter(e=>e.offsetParent) : [];
      return { n: b.length, labels: b.map(e=>(e.getAttribute('aria-label')||e.innerText).replace(/\s+/g,' ').trim().slice(0,34)), attr: bar? bar.getAttribute('data-bar'):null };
    });
    log('step ' + String(s).padStart(2) + ' n=' + m.n + ' data-bar=' + m.attr + ' :: ' + JSON.stringify(m.labels));
  }
  // legend accessible names
  await page.goto('http://localhost:8777/app/#year=1900');
  await page.waitForTimeout(2000);
  const names = await page.evaluate(()=>[...document.querySelectorAll('[class*="legend"] *, [class*="key"] *')].filter(e=>e.getAttribute && (e.getAttribute('aria-label')||e.getAttribute('title'))).map(e=>e.getAttribute('aria-label')||e.getAttribute('title')).slice(0,40));
  log('LEGEND NAMES ' + JSON.stringify(names));
  const allNames = await page.evaluate(()=>[...document.querySelectorAll('[aria-label]')].map(e=>e.getAttribute('aria-label')).filter(t=>/deg|°/.test(t)));
  log('ANY DEGREE IN ACCESSIBLE NAMES: ' + JSON.stringify(allNames));
};
