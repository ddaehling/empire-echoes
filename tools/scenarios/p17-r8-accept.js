/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 ROUND 8 — the four claims this round makes, asserted against the running
   app at whatever viewport it is given.

   R1  THE KEY IS NEVER ANONYMOUS. At every disclosure level and in every rail
       state at least one colour family is drawn WITH ITS WORD. Round 7 drew
       seven unnamed swatches in every state at 390x844.
   R2  THE KEY NEVER LEAVES THE SCREEN. Five hit tests across the strip; the
       strip has to answer all five. Round 7 answered none of them at 390 with a
       dossier open — the map's primary encoding was undecodable.
   R3  THE CONTROL CANNOT LIE. If N colours are hidden the label says "+N"; if
       none are, it does not.
   R4  IT CLEANS UP. Closing the rail returns the strip to the foot of the plate
       and leaves no node behind in a slot that is not this piece's.
*/
/* ROUND 10: wait for the strip to EXIST before the fixed settle wait. Measured
   on the running app, cold, at 1440x900: `.legend--ribbon` first appears about
   4.5s after `page.goto` returns in a fresh browser (1.47s from navigation
   start; the rest is Chromium's first compile of the module graph). These
   scenarios waited a flat 2.8s and had begun to fail intermittently with
   "no .legend--ribbon" and "0/5 hit tests" — a race in the test, not a defect
   in the strip. Nothing below is relaxed; the harness just stops measuring an
   app that has not finished mounting. */
const settled = async (page, ms) => {
  try { await page.waitForSelector('.legend--ribbon', { timeout: 15000 }); } catch (e) { /* asserted below */ }
  await page.waitForTimeout(ms);
};

module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 200)));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url().slice(0, 120)));

  const read = () => page.evaluate(() => {
    const rib = document.querySelector('.legend--ribbon');
    if (!rib) return null;
    const b = rib.getBoundingClientRect();
    let seen = 0, pts = 0;
    for (let i = 0; i < 5; i++) {
      const x = b.x + 6 + (b.width - 12) * i / 4, y = b.y + b.height / 2;
      if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) continue;
      pts++;
      const e = document.elementFromPoint(x, y);
      if (e && rib.contains(e)) seen++;
    }
    const ribs = [...rib.querySelectorAll('.legend__rib')];
    const drawn = ribs.filter(r => !r.hidden);
    const named = drawn.filter(r => r.dataset.tier !== 'bare'
      && (r.querySelector('.legend__rib-w') || {}).textContent);
    const route = rib.querySelector('.legend__route');
    return {
      stage: document.getElementById('app').dataset.stage,
      rail: document.getElementById('app').dataset.dossier + '/' + document.getElementById('app').dataset.sheet,
      host: rib.parentElement.className,
      rect: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
      hits: seen + '/' + pts,
      allHit: pts > 0 && seen === pts,
      total: ribs.length, drawn: drawn.length, named: named.length,
      words: named.map(r => r.querySelector('.legend__rib-w').textContent),
      route: route ? route.textContent : null,
      orphans: document.querySelectorAll('.app__overlay .legend__pin').length,
    };
  });

  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  const check = async (tag) => {
    const s = await read();
    if (!s) { t('R0 ribbon exists @ ' + tag, false, 'no .legend--ribbon'); return null; }
    const hidden = s.total - s.drawn;
    const said = /^\+(\d+) more/.exec(s.route || '');
    t('R1 named @ ' + tag, s.named >= 1, `${s.named} named of ${s.total} — ${JSON.stringify(s.words)}`);
    t('R2 on screen @ ' + tag, s.allHit, `${s.hits} hit tests, host=${s.host}, rect=${JSON.stringify(s.rect)}`);
    t('R3 label true @ ' + tag, (said ? +said[1] : 0) === hidden, `label ${JSON.stringify(s.route)} vs ${hidden} hidden`);
    return s;
  };

  const U = 'http://localhost:8777/app/';
  await page.goto(U, { waitUntil: 'load' }); await settled(page, 2800);
  await check('plate'); await shot('plate');
  await page.goto(U + '#year=1900&filter=stage:working', { waitUntil: 'load' }); await settled(page, 2600);
  await check('working');
  await page.goto(U + '#year=1900&filter=stage:apparatus', { waitUntil: 'load' }); await settled(page, 2600);
  await check('apparatus');
  await page.goto(U + '#year=1900&sel=british-india', { waitUntil: 'load' }); await settled(page, 3000);
  await check('dossier open'); await shot('dossier');
  /* R4 — close the rail and come home. */
  await page.evaluate(() => window.BEA.store.dispatch('select', null));
  await page.waitForTimeout(1400);
  const home = await check('dossier closed');
  t('R4 no orphan pin', !!home && home.orphans === 0 && !/legend__pin/.test(home.host),
    home ? `host=${home.host}, pins in overlay=${home.orphans}` : 'no ribbon');
  await shot('closed');
  /* the legend's own sheet, at every width */
  await page.goto(U, { waitUntil: 'load' }); await settled(page, 2600);
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(1400);
  await check('legend sheet'); await shot('sheet');
  await page.goto(U + '#year=1620', { waitUntil: 'load' }); await settled(page, 2200);
  await check('1620');
  await page.goto(U + '#year=1783', { waitUntil: 'load' }); await settled(page, 2200);
  await check('1783');

  t('R5 clean console', errs.length === 0, errs.join(' | ') || 'no errors, no page errors, no failed requests');
  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> P17 R8 FAILED' : '>>> P17 R8 holds');
};
