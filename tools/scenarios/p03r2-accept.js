/* RETIRED, WAVE 9 — NOT PART OF THE ACCEPTANCE SUITE (`tools/acceptance.js`).
 * P03 round 2. Superseded by `p03-accept.js`, rewritten in wave 9 against the current DOM. It reads `.dsr__prose` and `.tl-spine__caption`, neither of which is in the document.
 * The guarantee it protected is now protected by `tools/scenarios/p03-accept.js`.
 * Kept, unedited below, as the record of what that round measured. Running it
 * will fail against the current DOM; that is expected and is not a build break. */
/* P03 round 2 — every acceptance test in FEATURE_SPEC §2 P03, measured. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl'), null, { timeout: 20000 });

  // --- T1: geometry in the app's REAL default state, before any patch
  const raw = await page.evaluate(() => {
    const r = document.querySelector('.tl').getBoundingClientRect();
    return { docH: document.documentElement.scrollHeight, vh: innerHeight, tlTop: Math.round(r.top),
             prose: Math.round((document.querySelector('.dsr__prose') || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height) };
  });
  log('RAW-LAYOUT ' + JSON.stringify(raw));
  await page.waitForTimeout(300);
  const patched = await page.evaluate(() => {
    const r = document.querySelector('.tl').getBoundingClientRect();
    return { docH: document.documentElement.scrollHeight, tlTop: Math.round(r.top), tlH: Math.round(r.height) };
  });
  log('PATCHED-LAYOUT ' + JSON.stringify(patched));

  // --- T1: the band exists and is visible
  log('T1 band visible: ' + await page.evaluate(() => {
    const lanes = [...document.querySelectorAll('.tl-lane')];
    const r = document.querySelector('.tl-spine__track').getBoundingClientRect();
    return JSON.stringify({ lanes: lanes.length, w: Math.round(r.width), h: Math.round(r.height) });
  }));

  // --- T2: 1820 lights three
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1820));
  await page.waitForTimeout(150);
  log('T2 1820: ' + await page.evaluate(() => JSON.stringify({
    lit: [...document.querySelectorAll('.tl-lane[data-on="true"]')].map(b => b.dataset.phase),
    caption: document.querySelector('.tl-spine__caption').textContent.trim().slice(0, 130),
  })));

  // --- T3: Shift+Right from 1856
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1856));
  await page.waitForTimeout(120);
  await page.locator('.tl-ax__rail').focus();
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(150);
  log('T3 shift-right from 1856 -> ' + await page.evaluate(() => JSON.stringify({
    year: window.BEA.store.getState().year, expected: window.BEA.data.nextChangeYear(1856, 1),
  })));

  // --- T4: every mark carries a reason on focus
  log('T4 marks: ' + await page.evaluate(() => {
    const m = [...document.querySelectorAll('.tl-mark')];
    const noReason = m.filter(b => !(b.getAttribute('aria-label') || '').length > 20);
    const kinds = {};
    for (const b of m) kinds[b.dataset.kind] = (kinds[b.dataset.kind] || 0) + 1;
    return JSON.stringify({ total: m.length, kinds, withoutReason: noReason.length, sample: m[40] && m[40].getAttribute('aria-label').slice(0, 160) });
  }));

  // --- Move 1: definition switch must agree with the map
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(200);
  const readPair = () => page.evaluate(() => {
    const tl = document.querySelector('.tl__count').textContent;
    const t = [...document.querySelectorAll('.map-readout__val, .mapdef__val, .map-panel .num, .stage__over .num')].map(n => n.textContent.trim());
    return { tl, mapText: (document.querySelector('.stage__legend') || document.body).innerText.replace(/\s+/g, ' ').slice(0, 300) };
  });
  log('DEF claimed: ' + JSON.stringify(await readPair()));
  for (const k of ['3', '4', '2']) {
    await page.locator('#stage').click({ position: { x: 400, y: 300 } }).catch(() => {});
    await page.keyboard.press(k);
    await page.waitForTimeout(350);
    log('DEF key ' + k + ': ' + JSON.stringify(await readPair()));
  }
  await page.keyboard.press('1');
  await page.waitForTimeout(300);

  // --- T5: 600-frame scrub cost
  const perf = await page.evaluate(async () => {
    const tl = document.querySelector('.tl').__p03;
    tl.perf.reset();
    const store = window.BEA.store;
    const t0 = performance.now();
    for (let y = 1400; y < 2000; y++) {
      store.dispatch('setYear', y);
      await new Promise(r => requestAnimationFrame(r));
    }
    const wall = performance.now() - t0;
    return { frames: tl.perf.n, totalMs: +tl.perf.ms.toFixed(2), avgMs: +(tl.perf.ms / tl.perf.n).toFixed(3), worstMs: +tl.perf.worst.toFixed(2), wallMs: Math.round(wall) };
  });
  log('T5 600-frame scrub: ' + JSON.stringify(perf));
  await shot('after-scrub');
};
