/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(3000);
  await shot('cold');
  log('vp:', JSON.stringify(page.viewportSize()));
  log('--- body text ---');
  log((await page.evaluate(() => document.body.innerText)).slice(0, 3000));
  log('--- controls ---');
  const ctrls = await page.evaluate(() => [...document.querySelectorAll('button,a[href],[role=button],input,select')]
    .filter(e => e.offsetParent !== null)
    .map(e => { const r = e.getBoundingClientRect(); return `${e.tagName}|${(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,50)}|${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`; }));
  ctrls.forEach(c => log(c));
  log('--- errors ---'); errs.forEach(e => log(e));
  log('horizontal overflow:', await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth));
};
