/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** P08 — keyboard only: reach every surface and operate it with no pointer. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1300);

  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'plate:abolition' }));
  await page.waitForTimeout(700);

  /* tab from the top of the sheet through the plate */
  await page.evaluate(() => document.querySelector('.cx-sheet__close').focus());
  const stops = [];
  for (let i = 0; i < 22; i++) {
    await page.keyboard.press('Tab');
    stops.push(await page.evaluate(() => {
      const a = document.activeElement;
      if (!a) return 'none';
      return (a.className || a.tagName) + (a.dataset && a.dataset.fig ? '#' + a.dataset.fig : '')
        + (a.textContent ? ' “' + a.textContent.trim().slice(0, 26) + '”' : '');
    }));
  }
  log('TAB ORDER IN THE PLATE\n  ' + stops.join('\n  '));

  const lit = await page.evaluate(() => [...document.querySelectorAll('.viz-fig[data-lit="yes"]')].map((n) => n.dataset.fig));
  log('LIT while tabbing: ' + JSON.stringify(lit));

  /* the ratio slider: reachable, operable, announced */
  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'ratio:ics' }));
  await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector('.cx-sheet__close').focus());
  let found = null;
  for (let i = 0; i < 8 && !found; i++) {
    await page.keyboard.press('Tab');
    found = await page.evaluate(() => (document.activeElement.className || '').includes('viz-axis__handle') ? 'yes' : null);
  }
  log('SLIDER REACHED BY TAB: ' + found);
  const aria = await page.evaluate(() => {
    const h = document.querySelector('.viz-axis__handle');
    return { role: h.getAttribute('role'), min: h.getAttribute('aria-valuemin'), max: h.getAttribute('aria-valuemax'), now: h.getAttribute('aria-valuenow'), text: h.getAttribute('aria-valuetext') };
  });
  log('SLIDER ARIA ' + JSON.stringify(aria));
  await page.keyboard.press('End');
  await page.waitForTimeout(150);
  log('AFTER End: ' + (await page.evaluate(() => document.querySelector('.viz-axis__handle').getAttribute('aria-valuetext'))));
  await page.keyboard.press('Home');
  await page.waitForTimeout(150);
  log('AFTER Home: ' + (await page.evaluate(() => document.querySelector('.viz-axis__handle').getAttribute('aria-valuetext'))));
  for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  log('COMMITTED BY KEYBOARD: ' + (await page.evaluate(() => document.querySelector('.viz-ratio__readout').innerText)));
  log('LIVE REGION: ' + (await page.evaluate(() => (document.getElementById('live-status') || {}).textContent)));
  await shot('kbd-ics');

  /* Escape closes the surface through the shell, and the state follows */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  log('AFTER Escape ' + JSON.stringify(await page.evaluate(() => ({
    sheet: document.getElementById('app').dataset.sheet,
    viz: (window.BEA.store.getState().filters || {}).viz || null,
    hash: location.hash,
  }))));
};
