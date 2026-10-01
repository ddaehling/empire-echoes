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
  await page.waitForTimeout(1800);
  for (let i = 1; i <= 16; i++) {
    await shot('b' + String(i).padStart(2,'0'));
    const info = await page.evaluate(() => {
      const g = s => { const e = document.querySelector(s); if(!e) return null; const r = e.getBoundingClientRect(); return `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`; };
      const head = document.querySelector('[class*=masthead],header');
      const step = (document.body.innerText.match(/(\d+)\s*\/\s*(\d+)/)||[])[0];
      const panel = document.querySelector('[class*="beat"][class*="body"], .beat__body, [aria-label*="scrollable"]');
      const pr = panel && panel.getBoundingClientRect();
      return {
        step,
        map: g('.stage__map'),
        panelBox: pr ? `${Math.round(pr.width)}x${Math.round(pr.height)} scroll=${panel.scrollHeight}` : 'none',
        cloze: (document.body.innerText.match(/\d\/6/)||['-'])[0],
        text: document.body.innerText.replace(/\s+/g,' ').slice(0, 1400)
      };
    });
    log(`=== step ${i} :: ${info.step} map=${info.map} panel=${info.panelBox} cloze=${info.cloze}`);
    log(info.text);
    const next = page.getByRole('button', { name: /^Next beat|^Next/i }).first();
    if (await next.count() === 0 || !(await next.isVisible())) { log('no next at step ' + i); break; }
    await next.click();
    await page.waitForTimeout(1400);
  }
  await shot('end');
  log('--- errors ---'); errs.forEach(e => log(e));
};
