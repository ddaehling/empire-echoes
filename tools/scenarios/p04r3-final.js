/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('requestfailed', (r) => errs.push('REQFAIL ' + r.url()));
  await page.goto('http://localhost:8777/app/#year=1913&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(2400);
  await page.evaluate(() => { for (const s of ['.stage__over', '.stage__legend']) { const n = document.querySelector(s); if (n) n.style.visibility = 'hidden'; } });
  await shot('01-fold-india');
  log('FOLD', await page.evaluate(() => document.querySelector('.dsr__fold').innerText.replace(/\n+/g, ' | ')));
  await page.evaluate(() => document.querySelector('#dsr-think').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  await shot('02-think-india');
  await page.evaluate(() => window.BEA.store.batch((d) => { d('setYear', 1947); d('select', 'british-india'); }));
  await page.waitForTimeout(500);
  await page.evaluate(() => { const n = document.querySelector('.dsr__ask--toll'); if (n) n.scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(300);
  await shot('03-toll-india');
  log('TOLL', await page.evaluate(() => { const n = document.querySelector('.dsr__ask--toll'); return n ? n.innerText.replace(/\s+/g, ' ').slice(0, 300) : 'none'; }));
  log('errors', errs.length, JSON.stringify(errs.slice(0, 4)));
};
