/* hh/07-gate — the Complication Gate on the default route, by keyboard alone. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=period&step=4', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2200);
  await shot('gate');
  log('TEXT:\n' + (await page.evaluate(() => {
    const p = document.querySelector('.app__sheet, .tr-panel, main') || document.body;
    return p.innerText;
  })).slice(0, 2500));

  const nextState = () => page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => /next beat/i.test(x.getAttribute('aria-label') || '') || /^Next\b/i.test((x.innerText||'').trim()));
    return b ? { label: b.getAttribute('aria-label') || b.innerText.trim(), disabled: b.disabled || b.getAttribute('aria-disabled') === 'true' } : 'absent';
  });
  log('NEXT before: ' + JSON.stringify(await nextState()));

  // tab through and list every focusable in the gate surface
  const stops = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const a = await page.evaluate(() => {
      const a = document.activeElement; if (!a) return null;
      const r = a.getBoundingClientRect();
      return { tag: a.tagName, cls: String(a.className).split(' ')[0], role: a.getAttribute('role'),
        name: (a.getAttribute('aria-label') || a.innerText || '').trim().replace(/\s+/g,' ').slice(0, 70),
        w: Math.round(r.width), h: Math.round(r.height), press: a.getAttribute('aria-pressed'), chk: a.getAttribute('aria-checked') };
    });
    if (!a) break;
    stops.push(a);
    log('TAB ' + String(i+1).padStart(2) + ' ' + a.tag + '.' + a.cls + ' [' + (a.role||'-') + '] ' + a.w + 'x' + a.h + ' "' + a.name + '"');
    if (stops.length > 3 && stops[stops.length-1].name === stops[0].name && stops[stops.length-1].cls === stops[0].cls) break;
  }

  // try to satisfy the gate with the keyboard: find the field control
  const placed = await page.evaluate(() => {
    const el = document.querySelector('[class*="gate"] [role="application"], .gt__field, [class*="field"]');
    return el ? el.className : 'no field element found';
  });
  log('FIELD: ' + placed);
};
