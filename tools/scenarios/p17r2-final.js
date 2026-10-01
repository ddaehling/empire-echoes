/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForFunction(() => window.BEA && window.BEA.legend, null, { timeout: 20000 });
  await page.waitForTimeout(1400);
  await shot('landing');

  // Does anything on screen contradict the legend's own count?
  for (const y of [1783, 1900, 1913, 1922, 1947]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(400);
    log('AGREE ' + y + ' ' + JSON.stringify(await page.evaluate(() => {
      const grab = (s) => (document.querySelector(s) || {}).innerText || '';
      return {
        legend: grab('.legend__figures').replace(/\n/g, ' '),
        card: grab('.map__figs').replace(/\n/g, ' ').slice(0, 80),
        timebar: grab('.app__time').split('\n').filter(t => /unit|territor/i.test(t)).join(' / '),
      };
    })));
  }

  // a 400-year scrub with the legend live
  const t0 = Date.now();
  await page.evaluate(async () => {
    for (let y = 1600; y <= 1997; y += 1) {
      window.BEA.store.dispatch('setYear', y);
      if (y % 40 === 0) await new Promise(r => requestAnimationFrame(r));
    }
  });
  await page.waitForTimeout(1200);
  log('scrub 1600-1997 in ' + (Date.now() - t0) + 'ms');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(600);
  await shot('1913');

  // render cost of one legend paint
  log('RENDER ' + JSON.stringify(await page.evaluate(() => {
    const m = window.BEA.registry ? null : null;
    const t = [];
    for (let i = 0; i < 12; i++) {
      const a = performance.now();
      window.BEA.store.dispatch('setYear', 1900 + i);
      t.push(performance.now() - a);
    }
    t.sort((x, y) => x - y);
    return { medianMsForWholeApp: +t[6].toFixed(2), maxMs: +t[11].toFixed(2) };
  })));

  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(400);
  await page.click('.byline__crit'); await page.waitForTimeout(400);
  await shot('crit');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);

  // coverage
  log('COVER ' + JSON.stringify(await page.evaluate(() => {
    const st = document.querySelector('.app__stage').getBoundingClientRect();
    const l = document.querySelector('.stage__legend').getBoundingClientRect();
    const b = document.querySelector('#legend-byline').getBoundingClientRect();
    return { stage: [Math.round(st.width), Math.round(st.height)],
      legend: [Math.round(l.width), Math.round(l.height)], byline: [Math.round(b.width), Math.round(b.height)],
      pct: Math.round((l.width * l.height + b.width * b.height) / (st.width * st.height) * 1000) / 10 };
  })));
  log('ERRORS ' + JSON.stringify(errs));
};
