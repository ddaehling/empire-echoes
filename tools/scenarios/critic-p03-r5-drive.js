/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: '+e.message.slice(0,200)));
  page.on('console', m => { if (m.type()==='error') errs.push('err: '+m.text().slice(0,200)); });
  await page.waitForTimeout(3000);

  // AT2: scrub to 1820
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(1200);
  await shot('1820-full');
  const spine = await page.evaluate(() => {
    const s = document.querySelector('.tl-spine');
    if (!s) return null;
    const lit = Array.from(s.querySelectorAll('*')).filter(e => /lit|active|on\b/.test(e.className||'')).map(e=>e.className+' :: '+e.innerText.slice(0,60));
    return { text: s.innerText, lit, rect: s.getBoundingClientRect().toJSON() };
  });
  log('SPINE @1820:\n'+JSON.stringify(spine, null, 1));

  // AT3: nextChangeYear
  const at3 = await page.evaluate(async () => {
    const st = window.__app || window.app || null;
    const d = (window.__data || (window.__app && window.__app.data));
    return { hasApp: !!st, keys: Object.keys(window).filter(k=>/app|data|store|bus/i.test(k)).slice(0,20) };
  });
  log('globals: '+JSON.stringify(at3));
  log('errors: '+errs.join('\n'));
};
