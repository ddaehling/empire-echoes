/* hh/09-gatekbd — can the gate be cleared with the keyboard alone? */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=period&step=4', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2200);

  const bar = () => page.evaluate(() => (document.querySelector('.tr-bar')||{}).innerText ? document.querySelector('.tr-bar').innerText.replace(/\s+/g,' ') : '-');
  const radios = () => page.evaluate(() => [...document.querySelectorAll('[role="radio"]')].length);
  log('bar: ' + await bar() + '  radios in DOM: ' + await radios());

  // Press the in-bar "Go to the field and place the fact"
  await page.getByRole('button', { name: /place the fact/i }).first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  log('after Place it: focus = ' + await page.evaluate(() => { const a=document.activeElement; return a.tagName+'.'+String(a.className).split(' ')[0]+' "'+(a.getAttribute('aria-label')||a.innerText||'').trim().replace(/\s+/g,' ').slice(0,70)+'"'; }));
  log('radios now: ' + await radios());
  await shot('after-placeit');

  // group semantics
  log('GROUP: ' + JSON.stringify(await page.evaluate(() => {
    const g = document.querySelector('[role="radiogroup"]');
    if (!g) return 'no radiogroup';
    return { name: g.getAttribute('aria-label') || (document.getElementById(g.getAttribute('aria-labelledby')||'')||{}).innerText || '(none)',
             radios: [...g.querySelectorAll('[role="radio"]')].map(r => [r.getAttribute('aria-label')||r.innerText.trim(), r.getAttribute('aria-checked'), r.tabIndex]) };
  }), null, 1));

  // Now tab to a radio and drive with arrows
  log('focused role: ' + await page.evaluate(() => document.activeElement.getAttribute('role') + ' "' + (document.activeElement.getAttribute('aria-label')||document.activeElement.innerText).trim() + '"'));
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  log('after ArrowRight: ' + await page.evaluate(() => document.activeElement.getAttribute('aria-label') || document.activeElement.innerText.trim()));
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(300);
  log('after ArrowDown: ' + await page.evaluate(() => document.activeElement.getAttribute('aria-label') || document.activeElement.innerText.trim()));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  log('bar after placing: ' + await bar());
  await shot('gate-cleared');
  const live = await page.evaluate(() => [...document.querySelectorAll('[aria-live]')].map(e => [e.getAttribute('aria-live'), e.innerText.replace(/\s+/g,' ').slice(0,120)]).filter(x => x[1]));
  log('LIVE REGIONS: ' + JSON.stringify(live, null, 1));
};
