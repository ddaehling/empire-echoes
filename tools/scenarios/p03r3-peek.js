/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P03 round 3 — peek vs open: focus and hover say; only a press opens. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForSelector('.tl', { timeout: 15000 });
  await page.waitForTimeout(900);
  const say = () => page.evaluate(() => ({
    mark: (document.querySelector('.cx-lede__mark') || {}).textContent,
    text: (document.querySelector('.cx-lede__say') || {}).textContent,
    cta: (() => { const c = document.querySelector('.cx-cta'); return c && !c.hidden ? c.textContent : null; })(),
    sheet: document.getElementById('app').dataset.sheet || 'none',
    sheetTitle: (document.querySelector('.cx-sheet__title') || {}).textContent || '',
    stage: document.documentElement.dataset.stage,
    focus: (document.activeElement && (document.activeElement.className || document.activeElement.tagName)) + '',
  }));

  // reach working
  await page.click('.tl-btn[aria-label="Forward one year"]');
  await page.waitForTimeout(700);
  log('after +1: ' + JSON.stringify(await say()));

  // HOVER a phase lane
  await page.hover('.tl-lane[data-phase="atlantic"]');
  await page.waitForTimeout(500);
  log('hover lane I: ' + JSON.stringify(await say()));
  await shot('hover-lane');

  // FOCUS a phase lane by keyboard
  await page.evaluate(() => document.querySelector('.tl-lane[data-phase="dissolution"]').focus());
  await page.waitForTimeout(500);
  log('focus lane IV: ' + JSON.stringify(await say()));

  // CLICK the lane -> sheet
  await page.click('.tl-lane[data-phase="dissolution"]');
  await page.waitForTimeout(600);
  log('click lane IV: ' + JSON.stringify(await say()));
  await shot('click-lane');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // the warn chip: text and the door to apparatus
  const warn = await page.evaluate(() => { const w = document.querySelector('.tl__warn'); return w && !w.hidden ? w.textContent : null; });
  log('warn chip text: ' + JSON.stringify(warn));
  if (warn) {
    await page.click('.tl__warn');
    await page.waitForTimeout(800);
    log('after warn press: ' + JSON.stringify(await say()));
    const note = await page.evaluate(() => (document.querySelector('.tl-pop__rail-note') || {}).textContent || null);
    log('rail note: ' + String(note).slice(0, 150));
    const marksVisible = await page.evaluate(() => { const m = document.querySelector('.tl-ax__marks'); return m && !m.hidden && m.getBoundingClientRect().height > 0; });
    log('uncertainty rail visible: ' + marksVisible);
    await shot('warn-open');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  // hover a mark -> peek not open
  const has = await page.evaluate(() => !!document.querySelector('.tl-mark:not([hidden])'));
  if (has) {
    await page.evaluate(() => { const b = document.querySelector('.tl-mark:not([hidden])'); b.focus(); });
    await page.waitForTimeout(500);
    log('focus mark: ' + JSON.stringify(await say()));
    await page.evaluate(() => { const b = document.querySelector('.tl-mark:not([hidden])'); b.click(); });
    await page.waitForTimeout(700);
    log('click mark: ' + JSON.stringify(await say()));
    await shot('mark-open');
  }
};
