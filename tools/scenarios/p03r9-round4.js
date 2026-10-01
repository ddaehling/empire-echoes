/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* p03r9-round4.js — P03's answers to round 4, as assertions.

   Round 4's charges against this piece, verbatim:
     · "The unlabelled numeral row that appears above the axis after the view
        tray opens (4 3 3 3 2 … 10 5 8 4 9 8 5 2) has no legend anywhere on
        screen. Label it or drop it."
     · "a single map click … unlocks the seven-button transport, the speed
        select and five red CTAs simultaneously"
     · "Six identically weighted red CTAs compete in the bottom band"

   Run at each contract viewport:
     node tools/inspect.js tools/scenarios/p03r9-round4.js --out /tmp/x --w 1366 --h 768
   Below 46rem the axis is expected to move between levels — the deck and the
   spine are both reshaped by the level there and there is no spare row to
   reserve; that check is skipped and the reason is printed.                  */
module.exports = async ({ page, shot, log }) => {
  const P = (ok, s) => log((ok ? 'PASS ' : 'FAIL ') + s);
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1500);

  const snap = () => page.evaluate(() => {
    const vis = (e) => { if (!e) return false; const b = e.getBoundingClientRect(); const c = getComputedStyle(e);
      return b.width > 0 && b.height > 0 && c.visibility !== 'hidden' && c.display !== 'none'; };
    const bar = document.querySelector('.app__time');
    const tl = document.querySelector('.tl');
    return {
      vw: innerWidth,
      stage: document.documentElement.dataset.stage,
      year: window.BEA.store.getState().year,
      transport: [...document.querySelectorAll('.tl__transport button')].filter(vis).map((b) => b.textContent.trim()),
      speed: vis(document.querySelector('.tl-speed')),
      key: (() => { const e = document.querySelector('.tl__key'); return vis(e) ? e.textContent.trim() : null; })(),
      reds: [...bar.querySelectorAll('.cx-more')].filter(vis).map((e) => e.textContent.trim()),
      numerals: document.querySelectorAll('.tl-mark__n').length,
      marks: [...document.querySelectorAll('.tl-mark')].filter((e) => !e.hidden).length,
      axY: Math.round(document.querySelector('.tl-ax__axis').getBoundingClientRect().top),
      spineY: Math.round(document.querySelector('.tl-spine').getBoundingClientRect().top),
      barH: Math.round(bar.getBoundingClientRect().height),
      asks: tl.scrollHeight,
    };
  });

  const plate = await snap();
  log('plate     ' + JSON.stringify(plate));
  P(plate.stage === 'plate', 'lands at `plate`');
  P(plate.transport.length === 3, 'three transport buttons at second zero: ' + JSON.stringify(plate.transport));
  P(!plate.speed, 'no speed selector at `plate`');
  P(plate.reds.length === 0, 'no red link in the bar at `plate`');
  P(plate.asks <= plate.barH, `the bar asks for ${plate.asks} of ${plate.barH} (B3)`);

  /* one touch of the atlas */
  await page.click('.tl__transport button:nth-child(4)');   // +1
  await page.waitForTimeout(700);
  const working = await snap();
  log('working   ' + JSON.stringify(working));
  P(working.stage === 'working', 'one press of +1 reaches `working`');
  P(working.transport.length === 5, 'five transport buttons at `working`, not seven: ' + JSON.stringify(working.transport));
  P(!working.speed, 'the speed selector is NOT unlocked by the first interaction');
  P(working.reds.length <= 1, 'at most one red link in the bar at `working`: ' + JSON.stringify(working.reds));
  P(working.asks <= working.barH, `the bar asks for ${working.asks} of ${working.barH} (B3)`);

  /* the deliberate click */
  await page.evaluate(() => window.BEA.store.dispatch('setFilter', { stage: 'apparatus' }));
  await page.waitForTimeout(800);
  const app = await snap();
  log('apparatus ' + JSON.stringify(app));
  P(app.numerals === 0, 'the numeral row is gone (' + app.numerals + ' numerals, ' + app.marks + ' marks)');
  P(!!app.key && /date not settled/.test(app.key) && /account disputed/.test(app.key),
    'the row above the axis is labelled on screen: ' + JSON.stringify(app.key));
  P(app.reds.length <= 1, 'at most one red link in the bar at `apparatus`: ' + JSON.stringify(app.reds));
  P(app.speed, 'the speed selector arrives at `apparatus`');
  P(app.asks <= app.barH, `the bar asks for ${app.asks} of ${app.barH} (B3)`);
  if (app.vw > 736) {
    P(app.axY === plate.axY && app.spineY === plate.spineY,
      `the axis and the four bands do not move between levels (${plate.axY}/${plate.spineY} → ${app.axY}/${app.spineY})`);
  } else {
    log('SKIP axis-stillness below 46rem — the deck and the spine are both reshaped by the level there; '
      + `axis ${plate.axY} → ${app.axY}`);
  }

  /* the second gear kept its keyboard */
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1901); document.querySelector('.tl-ax__rail').focus(); });
  await page.waitForTimeout(300);
  await page.keyboard.press('Alt+ArrowRight');
  await page.waitForTimeout(400);
  const big = (await snap()).year;
  P(big > 1901, `Alt+→ still jumps to the next year that moves most of the map: 1901 → ${big}`);
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1856); document.querySelector('.tl-ax__rail').focus(); });
  await page.waitForTimeout(300);
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(400);
  P((await snap()).year === 1857, 'Shift+→ from 1856 still lands on 1857 (FEATURE_SPEC P03 test 3)');

  /* the route slot does not strobe under Play */
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1857); window.BEA.store.dispatch('setSpeed', 8); });
  await page.waitForTimeout(400);
  await page.click('.tl-btn--play');
  const seen = new Set();
  for (let i = 0; i < 10; i++) { await page.waitForTimeout(300); (await snap()).reds.forEach((r) => seen.add(r)); }
  await page.click('.tl-btn--play');
  P(seen.size <= 1, 'the route slot holds one label for the whole of playback: ' + JSON.stringify([...seen]));

  /* and the marks still open a real surface */
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1900));
  await page.waitForTimeout(400);
  await page.click('.tl-mark:not([hidden])');
  await page.waitForTimeout(700);
  const sheet = await page.evaluate(() => {
    const s = document.querySelector('.cx-sheet');
    if (!s) return null;
    const r = s.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), note: !!document.querySelector('.tl-pop__rail-note') };
  });
  P(!!sheet && sheet.h >= 280 && sheet.note,
    'a mark opens the sheet, at least 280px tall, carrying the rail\'s full key: ' + JSON.stringify(sheet));
  await shot('apparatus');
  await shot('bar', '.app__time');
};
