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
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(2000);
  await shot('beat1');
  log('--- text ---');
  log(await page.evaluate(() => document.body.innerText));
  log('--- controls ---');
  const ctrls = await page.evaluate(() => [...document.querySelectorAll('button,a[href],[role=button],input,select,[tabindex]')]
    .filter(e => e.offsetParent !== null)
    .map(e => { const r = e.getBoundingClientRect(); return `${e.tagName}|${(e.getAttribute('aria-label')||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,60)}|${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`; }));
  ctrls.forEach(c => log(c));
  log('--- geometry ---');
  log(await page.evaluate(() => {
    const sel = ['.stage__map','.map','svg','.beat','.panel','[data-stage]'];
    const out = [];
    for (const s of sel) document.querySelectorAll(s).forEach(el => { const r = el.getBoundingClientRect(); if(r.width>10) out.push(`${s} ${el.className}`.slice(0,80)+` :: ${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`); });
    return out.join('\n');
  }));
  log('--- errors ---'); errs.forEach(e => log(e));
};
