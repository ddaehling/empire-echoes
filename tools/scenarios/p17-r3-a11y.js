/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.focus: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 r3 — keyboard operation, ARIA, and a hostile scrub with the criticism open. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.waitForTimeout(2800);

  /* Tab into the legend and walk it. */
  const focusables = await page.evaluate(() => {
    const sel = 'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
    const inLegend = [...document.querySelectorAll('.stage__legend ' + sel)];
    const inByline = [...document.querySelectorAll('#legend-byline ' + sel)];
    const bad = [];
    for (const e of [...inLegend, ...inByline]) {
      const name = (e.getAttribute('aria-label') || e.textContent || '').trim();
      if (!name) bad.push(e.outerHTML.slice(0, 120));
    }
    return { legend: inLegend.length, byline: inByline.length, unnamed: bad };
  });
  log('focusables:', JSON.stringify(focusables));

  const aria = await page.evaluate(() => ({
    toggle: (() => { const b = document.querySelector('.legend__toggle');
      return b && { expanded: b.getAttribute('aria-expanded'), controls: b.getAttribute('aria-controls') }; })(),
    crit: (() => { const b = document.querySelector('.byline__crit');
      return b && { expanded: b.getAttribute('aria-expanded'), controls: b.getAttribute('aria-controls'),
                    target: !!document.getElementById(b.getAttribute('aria-controls')) }; })(),
    row: (() => { const b = document.querySelector('.legend__entry[data-status]');
      return b && { pressed: b.getAttribute('aria-pressed'), expanded: b.getAttribute('aria-expanded'),
                    controls: b.getAttribute('aria-controls') }; })(),
    bylineRole: (document.querySelector('#legend-byline') || {}).getAttribute
      ? document.querySelector('#legend-byline').getAttribute('role') : null,
    headingLevels: [...document.querySelectorAll('.legend h2, .legend h3')].map(h => h.tagName + ':' + h.textContent.trim().slice(0, 30)),
  }));
  log('aria:', JSON.stringify(aria, null, 1));

  /* Keyboard: focus the first row and activate it with Enter. */
  await page.focus('.legend__entry[data-status]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => ({
    focus: document.activeElement ? document.activeElement.className : null,
    rollOpen: !!document.querySelector('.legend__roll'),
    rollVisible: (() => { const r = document.querySelector('.legend__roll'); if (!r) return null;
      const b = document.querySelector('#legend-body').getBoundingClientRect();
      const rr = r.getBoundingClientRect(); return rr.top < b.bottom && rr.bottom > b.top; })(),
  }));
  log('after Enter on a row:', JSON.stringify(after));
  await shot('01-row-keyboard');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);

  /* Escape closes the criticism and returns focus to its control. */
  await page.click('.byline__crit');
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  log('after Escape:', JSON.stringify(await page.evaluate(() => ({
    open: document.querySelector('.byline__crit').getAttribute('aria-expanded'),
    focus: document.activeElement ? document.activeElement.className : null,
  }))));

  /* Hostile: scrub 400 years with the criticism open. */
  await page.click('.byline__crit');
  await page.waitForTimeout(300);
  await page.evaluate(async () => {
    for (let y = 1600; y <= 2020; y += 3) { window.BEA.store.dispatch('setYear', y); await new Promise(r => setTimeout(r, 3)); }
  });
  await page.waitForTimeout(900);
  await shot('02-after-scrub');

  /* Fold and reopen. */
  await page.click('.legend__toggle');
  await page.waitForTimeout(400);
  log('folded to:', await page.evaluate(() => (document.querySelector('.stage__legend') || {}).innerText));
  await page.click('.legend__toggle');
  await page.waitForTimeout(400);
  log('reopened key rows:', await page.evaluate(() => document.querySelectorAll('.legend__entry[data-status]').length));

  log('errors:', errs.length ? JSON.stringify(errs.slice(0, 10), null, 1) : 'none');
};
