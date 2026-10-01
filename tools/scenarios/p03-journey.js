/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P03 round 2 — the ending is reachable by every route a reader has. */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const ok = (id, pass, got) => R.push(`${pass ? 'PASS' : 'FAIL'}  ${id}  ${got}`);
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);
  const say = () => page.evaluate(() => {
    const s = document.querySelector('.cx-lede__say'); const c = document.querySelector('.app__lede .cx-cta, .cx-lede .cx-cta, [data-mount="lede"] button');
    return { t: s ? s.textContent : '', cta: c ? c.textContent.trim() : '', ell: s ? /…/.test(s.textContent) : false };
  });

  /* 1. drag the handle past the last dated year */
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 2026));
  await page.waitForTimeout(900);
  let s1 = await say();
  ok('J1 the end of the axis says the ending', /residue/i.test(s1.t), JSON.stringify(s1));
  await shot('j-end-of-axis');

  /* 2. its control opens the close */
  const opened = await page.evaluate(async () => {
    const btns = [...document.querySelectorAll('button')].filter(b => /how it ends/i.test(b.textContent));
    if (!btns.length) return { n: 0 };
    btns[0].click();
    await new Promise(r => setTimeout(r, 600));
    return { n: btns.length, has: !!document.querySelector('.tl-close'), title: (document.querySelector('.cx-sheet__title')||{}).textContent };
  });
  ok('J2 the band control opens the ending', !!opened.has, JSON.stringify(opened));

  /* 3. no ellipsis anywhere the band has been */
  const years = [1600, 1757, 1765, 1833, 1857, 1882, 1900, 1919, 1947, 1956, 1982, 1997, 2019];
  let worst = null;
  for (const y of years) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(420);
    const s = await say();
    if (s.ell) { worst = y + ': ' + s.t; break; }
  }
  ok('J3 the band never ends in an ellipsis', !worst, worst || years.length + ' years checked, none truncated');

  /* 4. the era sheet names the year it is talking about */
  const era = await page.evaluate(async () => {
    window.BEA.store.dispatch('setYear', 1900);
    await new Promise(r => setTimeout(r, 400));
    window.BEA.bus.emit('timeline:openPhase', { id: 'dissolution' });
    await new Promise(r => setTimeout(r, 500));
    const t = document.querySelector('.cx-sheet__body');
    return { title: (document.querySelector('.cx-sheet__title')||{}).textContent, text: t ? t.innerText.slice(0, 900) : '' };
  });
  ok('J4 the era sheet says which year it means', /In 1900, the year on the map/.test(era.text) && /not running in 1900/.test(era.text), JSON.stringify(era.text.slice(0, 260)));
  await shot('j-era');

  /* 5. playback to the end lands on the ending */
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 2020); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { const tl = document.querySelector('.tl'); tl.__p03.hasSwept = true; window.BEA.store.dispatch('setSpeed', 16); window.BEA.bus.emit('ask:play'); });
  await page.waitForTimeout(6000);
  const s5 = await page.evaluate(() => ({ y: window.BEA.store.getState().year, playing: window.BEA.store.getState().playing, t: (document.querySelector('.cx-lede__say')||{}).textContent }));
  ok('J5 playback ends on the ending', /residue/i.test(s5.t || ''), JSON.stringify(s5));
  await shot('j-play-end');

  /* 6. FEATURE_SPEC §2 P03 acceptance tests */
  const f = await page.evaluate(async () => {
    const out = {};
    const { store, data, bus } = window.BEA;
    // 1: the spine band is visible in every state
    out.spine = document.querySelectorAll('.tl-lane').length;
    // 2: 1820 lights three
    store.dispatch('setYear', 1600);
    await new Promise(r => setTimeout(r, 450));
    store.dispatch('setYear', 1820);
    await new Promise(r => setTimeout(r, 700));
    out.lit1820 = [...document.querySelectorAll('.tl-lane[data-on="true"], .tl-lane[aria-current], .tl-lane[data-lit="true"]')].length;
    out.lanes1820 = [...document.querySelectorAll('.tl-lane')].map(n => n.dataset.on || n.dataset.lit || n.getAttribute('aria-current'));
    out.say1820 = (document.querySelector('.cx-lede__say')||{}).textContent;
    // 3: shift+right from 1856
    store.dispatch('setYear', 1856);
    await new Promise(r => setTimeout(r, 400));
    document.querySelector('.tl-ax__rail').focus();
    document.querySelector('.tl-ax__rail').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 400));
    out.shift = store.getState().year;
    out.nextChange = data.nextChangeYear(1856, 1);
    // 4: contested dates carry a marker
    store.dispatch('setYear', 1857);
    bus.emit('ask:stage', { level: 'apparatus' });
    await new Promise(r => setTimeout(r, 500));
    out.marks = document.querySelectorAll('.tl-mark').length;
    out.warn = !!document.querySelector('.tl__warn:not([hidden])');
    // 5: scrub perf
    const tl = document.querySelector('.tl').__p03;
    tl.perf.reset();
    for (let y = 1600; y < 2000; y++) { tl.setYear(y); tl.render(Object.assign({}, store.getState(), { year: y })); }
    out.perf = { n: tl.perf.n, avg: +(tl.perf.ms / tl.perf.n).toFixed(3), worst: +tl.perf.worst.toFixed(2) };
    return out;
  });
  ok('A1 spine band present in every state', f.spine >= 4, f.spine + ' lanes');
  ok('A2 1820 lights three engines and says so', /[Tt]hree engines/.test(f.say1820 || ''), JSON.stringify({ lit: f.lanes1820, say: (f.say1820||'').slice(0,90) }));
  ok('A3 shift+right from 1856 == data.nextChangeYear', f.shift === f.nextChange, f.shift + ' vs ' + f.nextChange);
  ok('A4 contested dates carry a visible marker', f.marks > 0 && f.warn, f.marks + ' marks, warn=' + f.warn);
  ok('A5 400-frame scrub under 16ms/frame', f.perf.avg < 16 && f.perf.worst < 60, JSON.stringify(f.perf));

  log('');
  R.forEach(x => log(x));
  log(R.every(x => x.startsWith('PASS')) ? '>>> P03 journey holds' : '>>> P03 journey VIOLATED');
};
