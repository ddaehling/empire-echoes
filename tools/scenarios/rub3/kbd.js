module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(3000);
  const seen = [];
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(120);
    seen.push(await page.evaluate(() => { const a = document.activeElement; return (a.tagName + ':' + (a.getAttribute('aria-label')||a.innerText||a.className||'').replace(/\s+/g,' ').slice(0,50)); }));
  }
  log('TAB ORDER (cold):\n' + seen.join('\n'));
  // find and activate "Start the lesson" by keyboard
  const started = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button,a')).find(x=>x.offsetParent && /start the lesson/i.test(x.innerText||''));
    if (b) { b.focus(); return true; } return false;
  });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2200);
  await shot('after-enter');
  log('started=' + started + ' step=' + await page.evaluate(()=>document.getElementById('app').getAttribute('data-step')) + ' tour=' + await page.evaluate(()=>document.getElementById('app').getAttribute('data-tour')));
  // walk with keyboard only to the end
  let n = 0;
  for (let i = 0; i < 60; i++) {
    const ok = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).filter(x=>x.offsetParent).find(x=>/^(next|finish)/i.test((x.innerText||'').replace(/\s+/g,' ').trim()));
      if (!b) return null; b.focus(); return (b.innerText||'').replace(/\s+/g,' ').trim();
    });
    if (!ok) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(900); n++;
    if (/finish/i.test(ok)) break;
  }
  log('keyboard presses to the end: ' + n);
  await shot('kbd-end');
  const focusVisible = await page.evaluate(() => { const a=document.activeElement; const cs=getComputedStyle(a); return {tag:a.tagName, outline: cs.outlineWidth + ' ' + cs.outlineStyle, box: cs.boxShadow.slice(0,60)}; });
  log('focus ring: ' + JSON.stringify(focusVisible));
};
