module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=period&step=7', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2400);
  log(JSON.stringify(await page.evaluate(() => {
    return [...document.querySelectorAll('input,select,textarea')].filter(e => e.offsetParent !== null).map(e => ({
      type: e.type, name: e.name, id: e.id, cls: e.className, value: e.value,
      ariaLabel: e.getAttribute('aria-label'), labelledby: e.getAttribute('aria-labelledby'),
      labels: [...(e.labels||[])].map(l => l.innerText.trim().slice(0,60)),
      title: e.title, placeholder: e.placeholder,
      outer: e.outerHTML.slice(0, 220),
      parentText: (e.closest('label,fieldset,div')||{}).innerText ? (e.closest('label,fieldset,div').innerText.replace(/\s+/g,' ').slice(0,120)) : ''
    }));
  }), null, 1));
  await shot('card');
  // Full card text
  log('\nCARD DOM TEXT:\n' + await page.evaluate(() => {
    const c = document.querySelector('.qz-card, [class*="qz-"], .cx-sheet');
    return c ? c.innerText : '(none)';
  }));
};
