/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p03x-drive.js — drive P03 through its surfaces and measure the band + bar. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);

  const geom = async (label) => {
    const m = await page.evaluate(() => {
      const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
      const tl = document.querySelector('.tl');
      const say = document.querySelector('.cx-lede__say');
      const lede = document.querySelector('.app__lede');
      const sheet = document.querySelector('.app__sheet');
      const body = document.querySelector('.cx-sheet__body');
      return {
        tl: tl ? { h: Math.round(tl.getBoundingClientRect().height), scrollH: tl.scrollHeight, clipped: tl.scrollHeight > tl.clientHeight + 1 } : null,
        time: b('.app__time'), stage: b('.app__stage'), map: b('.stage__map canvas') || b('.stage__map svg'),
        ledeH: lede ? Math.round(lede.getBoundingClientRect().height) : 0,
        sayClipped: say ? (say.scrollHeight > say.clientHeight + 1) : null,
        sayText: say ? say.textContent.trim().slice(0, 140) : '',
        cta: (() => { const c = document.querySelector('.cx-cta'); return c && !c.hidden ? c.textContent.trim() : null; })(),
        sheetOpen: sheet ? !sheet.hidden : false,
        sheetTitle: document.querySelector('.cx-sheet__title') ? document.querySelector('.cx-sheet__title').textContent : '',
        sheetBody: body ? { h: Math.round(body.getBoundingClientRect().height), scrollH: body.scrollHeight } : null,
        tlSheet: document.querySelector('.tl-sheet') ? 'in-dom' : 'absent',
        docScroll: document.documentElement.scrollHeight, inner: innerHeight,
      };
    });
    log(label + ' ' + JSON.stringify(m));
    return m;
  };

  await geom('0-plate');
  // step a year -> working, band should speak
  await page.keyboard.press('ArrowRight').catch(()=>{});
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1857));
  await page.waitForTimeout(700);
  await geom('1-1857-working');
  await shot('1857');

  // press the band's cta
  const cta = await page.$('.cx-cta:not([hidden])');
  if (cta) { await cta.click(); await page.waitForTimeout(700); }
  await geom('2-sheet-year');
  await shot('sheet-year');

  // close
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await geom('3-closed');

  // apparatus + a disputed mark
  await page.evaluate(() => window.BEA.store.dispatch('setFilter', { stage: 'apparatus' }));
  await page.waitForTimeout(500);
  const mark = await page.$('.tl-mark:not([hidden])');
  if (mark) { await mark.click(); await page.waitForTimeout(600); }
  await geom('4-sheet-mark');
  await shot('sheet-mark');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);

  // a phase lane
  const lane = await page.$('.tl-lane');
  if (lane) { await lane.click(); await page.waitForTimeout(600); }
  await geom('5-sheet-phase');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);

  // the rate rail
  await page.evaluate(() => window.BEA.bus.emit('timeline:openRate'));
  await page.waitForTimeout(700);
  await geom('6-sheet-rate');
  await shot('sheet-rate');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);

  // the sweep, via Play
  await page.evaluate(() => window.BEA.store.dispatch('setFilter', { stage: null }));
  await page.waitForTimeout(300);
  const play = await page.$('.tl-btn--play');
  if (play) { await play.click(); }
  await page.waitForTimeout(2500);
  await geom('7-sweeping');
  await shot('sweeping');
  await page.evaluate(() => window.BEA.bus.emit('ask:pause'));
  // stop the sweep
  const stop = await page.$('.cx-cta');
  if (stop) { await stop.click(); }
  await page.waitForTimeout(900);
  await geom('8-after-sweep');
  await shot('after-sweep');
};
