/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  // keyboard from the rail
  await page.focus('.tl-ax__rail');
  await page.keyboard.press('Home'); await page.waitForTimeout(120);
  await page.keyboard.press('End'); await page.waitForTimeout(120);
  for (let i=0;i<6;i++) { await page.keyboard.press('Shift+ArrowLeft'); await page.waitForTimeout(60); }
  log('after 6 shift-left from End: ' + await page.evaluate(() => window.BEA.store.getState().year));
  // roving marks by keyboard
  await page.evaluate(() => { const b = document.querySelector('.tl-mark:not([hidden])'); b.tabIndex = 0; b.focus(); });
  for (let i=0;i<5;i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(60); }
  log('mark roving: ' + await page.evaluate(() => document.activeElement.getAttribute('aria-label').slice(0,80)));
  await page.keyboard.press('Escape');
  // click a change card -> selects the territory
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1947));
  await page.waitForTimeout(200);
  await page.click('.tl-chg[data-kind="change"]');
  await page.waitForTimeout(250);
  log('selected: ' + await page.evaluate(() => window.BEA.store.getState().selectedTerritoryId));
  // click an event card -> popover, then the "open the place" button
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1919));
  await page.waitForTimeout(200);
  await page.click('.tl-chg[data-dir="event"]');
  await page.waitForTimeout(250);
  log('event pop: ' + await page.evaluate(() => { const p = document.querySelector('.tl__pop'); return !p.hidden ? p.innerText.length + ' chars, ends: ' + p.innerText.slice(-160).replace(/\n/g,' | ') : 'closed'; }));
  await shot('event-pop-full');
  await page.keyboard.press('Escape');
  // play a stretch and pause
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1855); window.BEA.store.dispatch('setSpeed', 8); document.querySelector('.tl').__p03.play(); });
  await page.waitForTimeout(1500);
  log('playback: ' + JSON.stringify(await page.evaluate(() => ({ y: window.BEA.store.getState().year, playing: window.BEA.store.getState().playing,
    card: (()=>{const c=document.querySelector('.tl__stopcard'); return c && !c.hidden ? c.innerText.replace(/\n/g,' | ').slice(0,200) : null;})() }))));
  // pointer drag
  const box = await page.locator('.tl-ax__rail').boundingBox();
  await page.mouse.move(box.x + 200, box.y + box.height - 8);
  await page.mouse.down();
  for (let i=0;i<40;i++) await page.mouse.move(box.x + 200 + i*20, box.y + box.height - 8);
  await page.mouse.up();
  await page.waitForTimeout(300);
  log('after drag: ' + await page.evaluate(() => window.BEA.store.getState().year));
  // hover a mark with the mouse (round 2 could not)
  const mk = await page.$$('.tl-mark:not([hidden])');
  await mk[10].hover();
  await page.waitForTimeout(200);
  log('mouse hover mark 10: ' + await page.evaluate(() => { const p=document.querySelector('.tl__pop'); return !p.hidden ? p.innerText.slice(0,90).replace(/\n/g,' | ') : 'NO POPOVER'; }));
  await shot('final');
};
