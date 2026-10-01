/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.waitForFunction: Timeout 20000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P03 round 2 — the remaining acceptance evidence: deep links, determinism,
   keyboard reach, and the screen-reader sentence. */
module.exports = async ({ page, log, shot, url }) => {
  const base = url.split('#')[0];

  // 1. deep link carries the definition, and the row reproduces exactly
  const snap = async () => {
    await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl__count') && document.querySelector('.tl-chg'), null, { timeout: 20000 });
    await page.waitForTimeout(400);
    return page.evaluate(() => ({
      count: document.querySelector('.tl__count').textContent,
      head: document.querySelector('.tl__changecount').textContent,
      cards: [...document.querySelectorAll('.tl-chg:not(.tl-chg--more)')].filter(c => !c.hidden)
        .map(c => c.querySelector('.tl-chg__subject').textContent + ' | ' + c.querySelector('.tl-chg__mech').textContent),
    }));
  };
  await page.goto(base + '#year=1858&def=controlled', { waitUntil: 'load' });
  const a = await snap();
  log('deep link #year=1858&def=controlled -> ' + JSON.stringify(a, null, 1));
  await page.goto(base + '#year=1858&def=controlled', { waitUntil: 'load' });
  const b = await snap();
  log('SAME LINK REPRODUCES: ' + (JSON.stringify(a) === JSON.stringify(b)));

  // 2. keyboard: every card and the expander are reachable, and the marks rail
  await page.goto(base + '#year=1948', { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('.tl-chg'), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  log('keyboard reach: ' + await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.tl-chg')].filter(c => !c.hidden);
    return JSON.stringify({
      cards: cards.length,
      allFocusable: cards.every(c => c.tagName === 'BUTTON' && !c.disabled),
      moreIsButton: document.querySelector('.tl-chg--more').tagName,
      moreExpanded: document.querySelector('.tl-chg--more').getAttribute('aria-expanded'),
      railRole: document.querySelector('.tl-ax__rail').getAttribute('role'),
      railValue: document.querySelector('.tl-ax__rail').getAttribute('aria-valuetext'),
      lanes: [...document.querySelectorAll('.tl-lane')].map(l => l.getAttribute('aria-pressed')),
      markTabbable: [...document.querySelectorAll('.tl-mark')].filter(m => m.tabIndex === 0).length,
    });
  }));

  // 3. what a screen reader is told
  log('announcement: ' + await page.evaluate(() => {
    const tl = document.querySelector('.tl').__p03;
    tl.announceYear(true);
    const live = [...document.querySelectorAll('[aria-live]')].map(n => n.textContent).filter(Boolean);
    return JSON.stringify(live.slice(-2));
  }));

  // 4. the informal-empire rule: the word "independence" never appears for an
  //    informal-sphere place under the widest definition
  log('informal check: ' + await page.evaluate(() => {
    const tl = document.querySelector('.tl').__p03;
    const m = tl.model.forDefinition('influenced', (e) => e.controlDegree >= 1 || e.status === 'informal-sphere');
    const bad = [], good = [];
    for (const [y, rec] of m.years) for (const g of rec.groups) {
      if (!g.informal) continue;
      good.push(y + ' ' + g.subject + ' :: ' + g.mechanism);
      if (/independen/i.test(g.mechanism)) bad.push(y + ' ' + g.subject + ' :: ' + g.mechanism);
    }
    return JSON.stringify({ informalGroups: good.length, sayingIndependence: bad.length, sample: good.slice(0, 6) }, null, 1);
  }));

  // 5. 1948 Argentina and Uruguay, the two records the critic named
  await page.goto(base + '#year=1948&def=influenced', { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('.tl-chg'), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  log('1948 influenced, all groups: ' + await page.evaluate(() => {
    const tl = document.querySelector('.tl').__p03;
    return JSON.stringify((tl.groups || []).map(g => g.subject + ' :: ' + g.mechanism), null, 1);
  }));
  await shot('1948-influenced', '.tl');
};
