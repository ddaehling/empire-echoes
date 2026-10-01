/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'scrollHeight').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 20000 });
  await page.waitForTimeout(2500);
  const card = async (tag) => {
    const o = await page.evaluate(() => {
      const b = document.querySelector('.map__switchbody');
      const s = document.querySelector('.map__switch');
      return { scrollH: b.scrollHeight, clientH: b.clientHeight, clipped: s.classList.contains('is-clipped'),
        more: document.querySelector('.map__more').textContent, text: b.innerText.replace(/\s+/g,' ').slice(0, 700) };
    });
    log(tag + ' :: ' + JSON.stringify(o));
  };
  // WEIGHT via the key
  await page.keyboard.press('w');
  await page.waitForTimeout(700);
  const w = await page.evaluate(() => { const x = window.__map.weight; return x && { metric: x.metric, counted: x.counted, missing: x.missing }; });
  log('WEIGHT KEY: ' + JSON.stringify(w));
  await card('weight-card');
  await shot('weight');
  await page.keyboard.press('w');
  await page.waitForTimeout(400);
  log('WEIGHT OFF: ' + JSON.stringify(await page.evaluate(() => !!window.__map.weight)));
  // WEIGHT via the button
  await page.click('.map__weight');
  await page.waitForTimeout(600);
  log('WEIGHT BTN: ' + JSON.stringify(await page.evaluate(() => !!window.__map.weight)));
  await page.click('.map__weight');
  await page.waitForTimeout(300);
  // STITCHING
  await page.keyboard.press('s');
  await page.waitForTimeout(700);
  const st = await page.evaluate(() => ({ on: window.__map.stitch, net: (window.__map.net||[]).length,
    legs: (window.__map.net||[]).slice(0,4).map(l=>[l.a,l.b,Math.round(l.km)]) }));
  log('STITCH: ' + JSON.stringify(st));
  await card('stitch-card');
  await shot('stitch');
  await page.keyboard.press('s');
  await page.waitForTimeout(300);
  // SILENCES
  await page.keyboard.press('h');
  await page.waitForTimeout(700);
  const si = await page.evaluate(() => {
    const m = window.__map;
    let holes = 0; for (const r of m.plate.paint.values()) if (r.mode === 'hole') holes++;
    return { on: m.silenceMode, filed: m.silences.size, holes, undrawable: m.undrawable.map(u=>u.unitId) };
  });
  log('SILENCE 1900: ' + JSON.stringify(si));
  await card('silence-card');
  await shot('silence-1900');
  // move to 1960 where Kenya + NZ are both live
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1960));
  await page.waitForTimeout(900);
  const si2 = await page.evaluate(() => {
    const m = window.__map;
    let holes = 0; for (const r of m.plate.paint.values()) if (r.mode === 'hole') holes++;
    return { holes, undrawable: m.undrawable.map(u=>({u:u.unitId,since:u.since})) };
  });
  log('SILENCE 1960: ' + JSON.stringify(si2));
  await card('silence-1960-card');
  await shot('silence-1960');
};
