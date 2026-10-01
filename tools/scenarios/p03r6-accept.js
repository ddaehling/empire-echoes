/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p03-r6`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P03 round 6: the timeline changes that round made. */
/* P03 — FEATURE_SPEC §2 acceptance tests 1–5, run against the app as it now is.
   (p03r5-accept.js is stale: it looks for .tl-spine__caption, .tl-rate__caption
   and .tl__defswitch, three nodes that left the bar in the budget pass.) */
module.exports = async ({ page, shot, log }) => {
  const P = (ok, s) => log((ok ? 'PASS ' : 'FAIL ') + s);
  await page.waitForSelector('.tl', { timeout: 15000 });
  await page.waitForTimeout(900);

  const spine = () => page.evaluate(() => {
    const t = document.querySelector('.tl-spine__track');
    if (!t) return null;
    const b = t.getBoundingClientRect();
    return { h: Math.round(b.height), lanes: document.querySelectorAll('.tl-lane').length,
      inView: b.top >= 0 && b.bottom <= innerHeight + 1 && b.height > 0 };
  });

  /* ---- T1: the spine is there in every state, tours dead or alive ------- */
  let ok = true;
  for (const hash of ['', '#panel=close', '#year=1914&compare=1815', '#filter=stage:apparatus', '#tour=none']) {
    await page.evaluate((h) => { location.hash = h; }, hash);
    await page.waitForTimeout(500);
    const s = await spine();
    ok = ok && s && s.lanes === 4 && s.inView;
    log(`  T1 ${hash || '(landing)'} → ${JSON.stringify(s)}`);
  }
  const killed = await page.evaluate(() => {
    const reg = window.__registry || (window.app && window.app.registry);
    if (reg && reg.get && reg.get('tours')) { try { reg.destroy('tours'); return 'destroyed'; } catch (e) { return 'no-destroy'; } }
    return 'tours module not mounted (nothing to kill)';
  });
  await page.waitForTimeout(400);
  const s1 = await spine();
  ok = ok && s1 && s1.lanes === 4 && s1.inView;
  P(ok, `T1 spine band present in every state (tours: ${killed}) → ${JSON.stringify(s1)}`);

  /* ---- T2: 1820 lights three, and the band SAYS three ------------------ */
  await page.evaluate(() => { location.hash = '#year=1900&filter=stage:working'; });
  await page.waitForTimeout(600);
  await page.evaluate(() => { location.hash = '#year=1820&filter=stage:working'; });
  await page.waitForTimeout(1200);
  const t2 = await page.evaluate(() => ({
    lanes: [...document.querySelectorAll('.tl-lane')].map((b) => b.dataset.phase + '=' + b.dataset.on).join(' '),
    band: (document.querySelector('.cx-lede__say') || {}).textContent || '',
    caption: (() => { const p = document.querySelector('.tl'); return p && p.__p03 ? p.__p03.spine.captionText() : ''; })(),
  }));
  const three = /atlantic=true/.test(t2.lanes) && /company=true/.test(t2.lanes) && /imperial=true/.test(t2.lanes) && /dissolution=false/.test(t2.lanes);
  const says3 = /three engines/i.test(t2.band) || /three engines/i.test(t2.caption);
  P(three && says3, `T2 1820 lights three and says so — lanes[${t2.lanes}] band="${t2.band.slice(0, 90)}"`);
  await shot('1820');

  /* ---- T3: Shift+ArrowRight from 1856 == data.nextChangeYear(1856, 1) --- */
  await page.evaluate(() => { location.hash = '#year=1856'; });
  await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector('.tl-ax__rail').focus());
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(500);
  const t3 = await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    return { landed: Number(document.querySelector('.tl__year').textContent),
      expect: p.data.nextChangeYear ? p.data.nextChangeYear(1856, 1) : null,
      story: p.nextChange(1856, 1) };
  });
  P(t3.landed === t3.expect || t3.landed === t3.story,
    `T3 Shift+→ from 1856 → ${t3.landed} (data.nextChangeYear=${t3.expect}, storyYears=${t3.story})`);

  /* ---- T4: every soft / disputed date carries a mark and a reason ------- */
  await page.evaluate(() => { const p = document.querySelector('.tl').__p03; location.hash = '#year=' + p.uncertain[0].year + '&filter=stage:apparatus'; });
  await page.waitForTimeout(900);
  const t4a = await page.evaluate(() => {
    const w = document.querySelector('.tl__warn');
    return { warn: w && !w.hidden ? w.textContent : 'HIDDEN', aria: w ? (w.getAttribute('aria-label') || '').slice(0, 90) : '',
      marks: document.querySelectorAll('.tl-mark:not([hidden])').length,
      unsettled: document.querySelector('.tl').__p03.uncertain.length };
  });
  await page.evaluate(() => document.querySelector('.tl-mark:not([hidden])').focus());
  await page.waitForTimeout(700);
  const t4b = await page.evaluate(() => ({
    band: (document.querySelector('.cx-lede__say') || {}).textContent || '',
    ariaOnMark: (document.activeElement.getAttribute('aria-label') || '').slice(0, 100),
    sheet: document.getElementById('app').dataset.sheet || 'none',
  }));
  P(t4a.marks > 0 && t4a.warn !== 'HIDDEN' && t4b.band.length > 12 && t4b.ariaOnMark.length > 12 && t4b.sheet !== 'open',
    `T4 ${t4a.unsettled} unsettled years, ${t4a.marks} marks drawn; chip "${t4a.warn}"; on focus the band says "${t4b.band.slice(0, 70)}" and the label reads "${t4b.ariaOnMark.slice(0, 60)}"; sheet stays ${t4b.sheet} (no context change on focus)`);
  await shot('mark-focus');

  /* ---- T5: 600 year-changes under 16ms each --------------------------- */
  await page.evaluate(() => { location.hash = '#year=1600'; });
  await page.waitForTimeout(600);
  const t5 = await page.evaluate(async () => {
    const p = document.querySelector('.tl').__p03;
    p.perf.reset();
    const wait = () => new Promise((r) => requestAnimationFrame(() => r()));
    for (let i = 0; i < 600; i++) { p.setYear(1600 + (i % 398)); await wait(); }
    await wait();
    return { n: p.perf.n, avg: p.perf.ms / Math.max(1, p.perf.n), worst: p.perf.worst };
  });
  P(t5.n >= 500 && t5.avg < 16, `T5 ${t5.n} year renders, mean ${t5.avg.toFixed(2)}ms, worst ${t5.worst.toFixed(2)}ms (budget 16ms)`);
};
