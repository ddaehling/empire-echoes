/* hh/06-kbd — can a keyboard-only teacher run the default lesson end to end? */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);

  const act = () => page.evaluate(() => {
    const a = document.activeElement;
    if (!a) return 'none';
    const lab = a.getAttribute('aria-label') || (a.innerText || '').trim().slice(0, 60) || a.getAttribute('title') || '';
    return a.tagName + (a.className ? '.' + String(a.className).split(' ')[0] : '') + ' | "' + lab.replace(/\n/g, ' / ') + '"'
      + (a.getAttribute('role') ? ' role=' + a.getAttribute('role') : '');
  });

  // Tab from the top until we find the start control.
  let found = null;
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    const a = await act();
    log('TAB ' + String(i + 1).padStart(2) + '  ' + a);
    if (/Start the lesson/i.test(a) && !found) { found = i + 1; }
    if (found) break;
  }
  log('start control reached at tab ' + found);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);
  await shot('kbd-step1');

  // Now walk the route with keyboard only.
  for (let s = 1; s <= 12; s++) {
    const st = await page.evaluate(() => {
      const t = window.BEA && window.BEA.toursState;
      return t ? (t.tour + ' step ' + t.step + '/' + (t.total || '?')) : 'no tourstate';
    });
    const heading = await page.evaluate(() => {
      const h = document.querySelector('.tr-panel__lede, .tr-panel h2, .tr-panel__head');
      return h ? h.innerText.replace(/\n/g, ' / ').slice(0, 90) : '-';
    });
    log('AT ' + st + '   ' + heading);
    // find the Next control by role and focus it via keyboard
    const ok = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button,a[href]')].find(x => /^(Next|Continue|Go on)\b/i.test((x.innerText || '').trim()) || /next/i.test(x.getAttribute('aria-label') || ''));
      if (!b) return false;
      b.focus(); return true;
    });
    if (!ok) { log('  NO NEXT CONTROL FOUND — walk stops'); await shot('kbd-stuck-' + s); break; }
    log('  focused: ' + await act());
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1400);
  }
  await shot('kbd-end');
  const focusRing = await page.evaluate(() => {
    const a = document.activeElement; if (!a) return 'none';
    const c = getComputedStyle(a);
    return 'outline=' + c.outlineWidth + ' ' + c.outlineStyle + ' ' + c.outlineColor + ' boxShadow=' + c.boxShadow.slice(0, 60);
  });
  log('focus ring on last focused: ' + focusRing);
};
