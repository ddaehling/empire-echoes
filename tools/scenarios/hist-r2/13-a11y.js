module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  // keyboard only: tab to Start the lesson and enter
  let found = false;
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    const n = await page.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute('aria-label') || a.innerText || a.tagName).replace(/\s+/g,' ').trim().slice(0,60) : 'none'; });
    if (/Start the lesson/i.test(n)) { found = true; log('focus reached Start at tab ' + (i+1) + ' :: ' + n); break; }
  }
  if (!found) log('!! could not tab to Start the lesson in 25 tabs');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  await shot('kbd-beat1');
  const focused = await page.evaluate(() => { const a=document.activeElement; return a?(a.getAttribute('aria-label')||a.innerText||a.tagName).slice(0,60):'none'; });
  log('focus after enter', focused);
  // contrast probe on the loop diagram: go to the revenue loop beat
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil:'load' });
  await page.waitForTimeout(2500);
  await shot('loop');
  const strokes = await page.evaluate(() => [...document.querySelectorAll('#sheet svg *')].slice(0,40).map(e => { const s = getComputedStyle(e); return e.tagName + ' stroke=' + s.stroke + ' sw=' + s.strokeWidth + ' op=' + s.opacity + ' fill=' + s.fill; }));
  log('LOOP STROKES', JSON.stringify(strokes, null, 1).slice(0, 2200));
};
