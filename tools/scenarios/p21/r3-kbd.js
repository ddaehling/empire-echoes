/* Keyboard only: reach the through-line, open it, close it, reach the Close. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1800);
  const where = () => page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return 'body';
    return (a.className || a.tagName) + ' :: ' + (a.getAttribute('aria-label') || (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 46));
  });
  await page.evaluate(() => { const b = document.querySelector('.app__bar'); if (b) b.focus(); });
  let hit = null;
  for (let i = 0; i < 90; i++) {
    await page.keyboard.press('Tab');
    const w = await where();
    if (/cl-blk__toggle|cl-bar__whole/.test(w)) { hit = { i: i + 1, w }; break; }
  }
  log('TABS TO THE THROUGH-LINE CONTROL: ' + JSON.stringify(hit));
  if (hit) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    const open = await page.evaluate(() => ({ blk: !!document.querySelector('.cl-blk[data-open="yes"]'), whole: !!document.querySelector('.cl-say__all') }));
    log('OPENED BY KEYBOARD: ' + JSON.stringify(open) + ' focus=' + await where());
    await shot('kbd-open');
    /* Tab on into the cloze and take a blank. */
    let gap = null;
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const w = await where();
      if (/cl-blk__gap|cl-blk__next/.test(w)) { gap = { i: i + 1, w }; break; }
    }
    log('FIRST BLANK REACHED: ' + JSON.stringify(gap));
  }
  /* Esc Esc from a clean state. */
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); });
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
  log('ESC ESC: close open = ' + await page.evaluate(() => !!document.querySelector('.cl-close')));
  await shot('kbd-close');
};
