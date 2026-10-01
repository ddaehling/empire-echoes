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
  await page.waitForTimeout(3000);
  await shot('landing');
  const tl = await page.$('#slot-timeline, [data-slot=timeline], .timeline');
  log('timeline slot found:', !!tl);
  const html = await page.evaluate(() => {
    const n = document.querySelector('.timeline') || document.querySelector('[data-slot="timeline"]') || document.querySelector('#slot-timeline');
    return n ? n.outerHTML.slice(0, 6000) : 'NONE';
  });
  log('TIMELINE HTML:', html);
  const txt = await page.evaluate(() => {
    const n = document.querySelector('.timeline') || document.querySelector('[data-slot="timeline"]');
    return n ? n.innerText : 'NONE';
  });
  log('TIMELINE TEXT:', txt);
  log('console errors:', JSON.stringify(errs));
};
