/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.selectOption: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  // go to 1600 via Home, then play at max speed
  await page.evaluate(() => { location.hash = '#year=1600'; });
  await page.waitForTimeout(800);
  const sel = await page.$('select');
  if (sel) { await sel.selectOption({ index: (await page.evaluate(()=>document.querySelector('select').options.length))-1 }); }
  log('speed: ' + await page.evaluate(()=>document.querySelector('select')?.value));
  const t0 = Date.now();
  await page.locator('button', { hasText: 'Play' }).first().click();
  // wait until year reaches >=1990 or 60s
  for (let i=0;i<120;i++) {
    const y = await page.evaluate(()=>+((location.hash.match(/year=(\d+)/)||[])[1]||0));
    if (y >= 1990) break;
    await page.waitForTimeout(500);
  }
  log('played to ' + await page.evaluate(()=>location.hash) + ' in ' + (Date.now()-t0) + 'ms');
  await shot('played');
  // now drag the scrubber
  const ax = await page.$('.tl-ax__svg, .tl-axis, input[type=range]');
  log('axis el: ' + (ax ? 'yes':'no'));
  const box = await page.evaluate(()=>{ const e=document.querySelector('.tl-ax__svg'); if(!e) return null; const b=e.getBoundingClientRect(); return {x:b.x,y:b.y,w:b.width,h:b.height}; });
  if (box) {
    await page.mouse.move(box.x+50, box.y+box.h/2);
    await page.mouse.down();
    for (let i=0;i<40;i++) { await page.mouse.move(box.x+50+ i*(box.w-60)/40, box.y+box.h/2); await page.waitForTimeout(20); }
    await page.mouse.up();
    await page.waitForTimeout(800);
    log('after drag: ' + await page.evaluate(()=>location.hash));
  }
  await shot('dragged');
};
