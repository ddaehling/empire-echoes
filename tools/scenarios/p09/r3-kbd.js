/** P09 round 3: the table is one tab stop and the arrows walk it. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.mechanism && window.BEA.store, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1901));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.BEA.mechanism.open({}));
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('.mx-ch').click());
  await page.waitForTimeout(500);

  const stops = await page.evaluate(() => {
    const sheet = document.querySelector('.cx-sheet');
    const foc = [...sheet.querySelectorAll('button,a[href],input,select,textarea,[tabindex]')]
      .filter(e => !e.disabled && e.tabIndex >= 0);
    const inTable = foc.filter(e => e.closest('.mx-t'));
    return { total: foc.length, inTable: inTable.length,
      cells: sheet.querySelectorAll('.mx-c__b').length + sheet.querySelectorAll('.mx-c--none').length };
  });
  log('tab stops ' + JSON.stringify(stops));

  // focus the first table stop and walk it
  const walk = await page.evaluate(async () => {
    const first = document.querySelector('.mx-t [tabindex="0"]');
    first.focus();
    const seen = [document.activeElement.getAttribute('aria-label') || document.activeElement.textContent.trim()];
    const press = (key, ctrlKey) => document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key, ctrlKey: !!ctrlKey, bubbles: true, cancelable: true }));
    for (const k of ['ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'End', 'Home']) {
      press(k);
      await new Promise(r => setTimeout(r, 20));
      const a = document.activeElement;
      seen.push((a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 46));
    }
    const zeros = document.querySelectorAll('.mx-t [tabindex="0"]').length;
    return { seen, zeros, active: document.activeElement.className };
  });
  log('walk ' + JSON.stringify(walk, null, 1));
};
