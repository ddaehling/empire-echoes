/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * P18 round-6 drive — the chip-row controls, the peek's hysteresis, the deep
 * link round trip, and the keyboard. Reports console errors / page errors /
 * failed requests / horizontal overflow, which must be 0 every time.
 */
const READY = () => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready';
module.exports = async ({ page, shot, log }) => {
  const errs = [], fails = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', (r) => fails.push(r.url()));
  const w = page.viewportSize().width, h = page.viewportSize().height;
  log(`viewport ${w}x${h}`);

  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(READY); await page.waitForTimeout(1100);
  await page.keyboard.press('v'); await page.waitForTimeout(1200);

  const chips = () => page.evaluate(() => {
    const pk = document.querySelector('.cmp__picker'); const b = pk.getBoundingClientRect();
    return { left: Math.round(pk.scrollLeft), of: pk.dataset.of,
      navs: [...document.querySelectorAll('.cmp__picknav')].map((n) => n.dataset.dir + (n.hidden ? ':off' : ':ON')),
      inside: [...pk.querySelectorAll('.cmp__pick')].filter((c) => {
        const r = c.getBoundingClientRect(); return r.left >= b.left - 1 && r.right <= b.right + 1;
      }).map((c) => c.textContent.trim()) };
  });
  log('chips at rest: ' + JSON.stringify(await chips()));
  const next = await page.$('.cmp__picknav[data-dir="next"]:not([hidden])');
  if (next) {
    await next.click(); await page.waitForTimeout(700);
    log('chips after one press of next: ' + JSON.stringify(await chips()));
    await next.click(); await page.waitForTimeout(700);
    log('chips after two: ' + JSON.stringify(await chips()));
    const prev = await page.$('.cmp__picknav[data-dir="prev"]:not([hidden])');
    if (prev) { await prev.click(); await page.waitForTimeout(700); log('chips after prev: ' + JSON.stringify(await chips())); }
    else log('prev NOT drawn after scrolling right — DEFECT');
    await shot('chips');
  } else log('the row fits at this width; no nav drawn');

  /* the peek, driven by real scrolling rather than a scrollTop assignment */
  await page.click('.cmp__choice'); await page.waitForTimeout(1200);
  const peek = () => page.evaluate(() => {
    const c = document.querySelector('.cmp'), p = document.querySelector('.cmp__plates');
    const g = document.querySelector('.cmp__grid');
    return { peek: c.dataset.peek || 'off', platesH: Math.round(p.getBoundingClientRect().height),
      sticky: getComputedStyle(p).position, top: g ? Math.round(g.scrollTop) : -1 };
  });
  log('peek at rest: ' + JSON.stringify(await peek()));
  const box = await page.evaluate(() => { const g = document.querySelector('.cmp__grid');
    const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height - 20 }; });
  await page.mouse.move(box.x, box.y);
  await page.mouse.wheel(0, 400); await page.waitForTimeout(700);
  log('peek after a wheel of 400: ' + JSON.stringify(await peek()));
  /* the row that was under the thumb must not have jumped */
  await page.mouse.wheel(0, -900); await page.waitForTimeout(800);
  log('peek back at the top: ' + JSON.stringify(await peek()));
  await shot('peek-back');

  /* a named row is pressed while peeked: the plates must come back */
  await page.mouse.wheel(0, 500); await page.waitForTimeout(700);
  const before = await peek();
  const row = await page.$('.cmp__row');
  if (row) { await row.click(); await page.waitForTimeout(900); }
  log('press a row while peeked: ' + JSON.stringify({ before: before.peek, after: (await peek()) }));
  await shot('row-pressed');

  /* the deep link round trip (FEATURE_SPEC P18 AT4) */
  const url = await page.evaluate(() => location.hash);
  log('address after all that: ' + url);
  await page.goto('http://localhost:8777/app/' + url, { waitUntil: 'load' });
  await page.waitForFunction(READY); await page.waitForTimeout(1400);
  log('restored: ' + JSON.stringify(await page.evaluate(() => {
    const c = document.querySelector('.cmp');
    const st = window.BEA.store.getState();
    return { open: !!c && !c.hidden, phase: c && c.dataset.phase, year: st.year, cmp: st.compareYear,
      labels: [...document.querySelectorAll('.cmp__year')].map((n) => n.textContent.trim()),
      guess: document.querySelector('.cmp__guess-v') && document.querySelector('.cmp__guess-v').textContent };
  })));

  /* keyboard alone: Tab to the nav, to a chip, to Close */
  const seen = [];
  for (let i = 0; i < 24; i++) {
    await page.keyboard.press('Tab');
    seen.push(await page.evaluate(() => { const a = document.activeElement;
      return (a.className || a.tagName) + '|' + (a.textContent || '').trim().slice(0, 18); }));
  }
  log('tab order: ' + JSON.stringify(seen.filter((s) => /cmp/.test(s))));

  const ox = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  log(`overflowX ${ox} · console errors ${errs.length} · failed requests ${fails.length}`);
  if (errs.length) log('errors: ' + errs.join(' | '));
};
