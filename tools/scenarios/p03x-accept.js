/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p03x-accept.js — FEATURE_SPEC §2, P03's five acceptance tests, on the
    composition after the layout-budget pass. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(2200);
  const say = () => page.evaluate(() => ({
    mark: (document.querySelector('.cx-lede__mark') || {}).textContent,
    text: (document.querySelector('.cx-lede__say') || {}).textContent,
    cta: (() => { const c = document.querySelector('.cx-cta'); return c && !c.hidden ? c.textContent.trim() : null; })(),
    clipped: (() => { const e = document.querySelector('.cx-lede__say'); return e ? e.scrollHeight > e.clientHeight + 1 : null; })(),
  }));

  /* AT1 — the spine band is visible in every state, including with tours dead */
  const spine = async (tag) => log('AT1 ' + tag, await page.evaluate(() => {
    const s = document.querySelector('.tl-spine');
    if (!s) return 'MISSING';
    const r = s.getBoundingClientRect();
    return `h=${Math.round(r.height)} lanes=${document.querySelectorAll('.tl-lane').length} onScreen=${r.top < innerHeight && r.bottom > 0}`;
  }));
  await spine('landing');
  await page.evaluate(() => { location.hash = '#panel=close'; }); await page.waitForTimeout(500);
  await spine('#panel=close');
  await page.evaluate(() => { location.hash = '#year=1913&compare=1914'; }); await page.waitForTimeout(600);
  await spine('compare');
  log('AT1 compare ghost:', await page.evaluate(() => { const g = document.querySelector('.tl-ax__ghost'); return g.hidden ? 'hidden' : 'shown'; }));
  // free explore + a territory selected + the sheet open
  await page.evaluate(() => { location.hash = '#year=1913&sel=bengal'; }); await page.waitForTimeout(700);
  await spine('territory selected (dossier in the rail)');
  await page.evaluate(() => window.BEA.bus.emit('timeline:openRate')); await page.waitForTimeout(600);
  await spine('sheet open');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  log('AT1 tours module mounted?', await page.evaluate(() => !!document.querySelector('[data-mount="overlay"] *') || 'none rendered'));
  await page.evaluate(() => { const r = window.BEA.registry; if (r && r.unmount) { try { r.unmount('tours'); } catch (e) { return 'unmount threw ' + e.message; } } });
  await page.waitForTimeout(400);
  await spine('after killing tours');

  /* AT2 — 1820 lights three, and the band SAYS three engines are running */
  await page.evaluate(() => { location.hash = '#year=1700'; }); await page.waitForTimeout(500);
  await page.evaluate(() => { location.hash = '#year=1820'; }); await page.waitForTimeout(900);
  log('AT2 lanes at 1820:', await page.evaluate(() => [...document.querySelectorAll('.tl-lane')].map(b => b.dataset.phase + '=' + b.dataset.on).join(' ')));
  log('AT2 band:', JSON.stringify(await say()));
  await shot('1820');

  /* AT3 — Shift+ArrowRight from 1856 */
  await page.evaluate(() => { location.hash = '#year=1856'; }); await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector('.tl-ax__rail').focus());
  await page.keyboard.press('Shift+ArrowRight'); await page.waitForTimeout(400);
  log('AT3 lands on', await page.evaluate(() => document.querySelector('.tl__year').textContent),
      '· data.nextChangeYear(1856,1) =', await page.evaluate(() => { const p = document.querySelector('.tl').__p03; return p.data.nextChangeYear ? p.data.nextChangeYear(1856, 1) : 'n/a'; }),
      '· piece.nextChange =', await page.evaluate(() => document.querySelector('.tl').__p03.nextChange(1856, 1)));

  /* AT4 — a contested/circa year: a visible marker, and a reason on focus */
  await page.evaluate(() => { const p = document.querySelector('.tl').__p03; location.hash = '#year=' + p.uncertain[0].year + '&filter=stage:apparatus'; });
  await page.waitForTimeout(800);
  log('AT4 disputed affordance:', await page.evaluate(() => { const w = document.querySelector('.tl__warn'); return w.hidden ? 'HIDDEN' : w.className + ' | ' + w.textContent + ' | aria=' + (w.getAttribute('aria-label') || '').slice(0, 110); }));
  log('AT4 marks drawn on the axis:', await page.evaluate(() => document.querySelectorAll('.tl-mark:not([hidden])').length));
  await page.evaluate(() => document.querySelector('.tl-mark:not([hidden])').focus());
  await page.waitForTimeout(700);
  log('AT4 sheet after focusing a mark:', await page.evaluate(() => {
    const s = document.querySelector('.app__sheet');
    if (!s || s.hidden) return 'NONE';
    const b = document.querySelector('.cx-sheet__body').getBoundingClientRect();
    return `${document.querySelector('.cx-sheet__title').textContent} | ${Math.round(b.width)}x${Math.round(b.height)} | ` +
      document.querySelector('.tl__pop').innerText.slice(0, 150).replace(/\n/g, ' | ');
  }));
  await shot('mark-sheet');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);

  /* AT5 — a 600-frame scrub, per-frame cost */
  const perf = await page.evaluate(async () => {
    const p = document.querySelector('.tl').__p03;
    p.perf.reset();
    const t0 = performance.now();
    for (let i = 0; i < 600; i++) {
      p.setYear(1400 + Math.round(i * 1.03));
      await new Promise(requestAnimationFrame);
    }
    return { wall: Math.round(performance.now() - t0), n: p.perf.n, mean: +(p.perf.ms / Math.max(1, p.perf.n)).toFixed(3), worst: +p.perf.worst.toFixed(2) };
  });
  log('AT5 600-frame scrub:', JSON.stringify(perf));

  /* the bar's height must not have moved through any of it */
  log('FINAL bar:', await page.evaluate(() => {
    const tl = document.querySelector('.tl');
    return JSON.stringify({ h: Math.round(tl.getBoundingClientRect().height), scrollH: tl.scrollHeight, clipped: tl.scrollHeight > tl.clientHeight + 1, doc: document.documentElement.scrollHeight, inner: innerHeight });
  }));
};
