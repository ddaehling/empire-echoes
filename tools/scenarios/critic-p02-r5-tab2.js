/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  const focusables = await page.evaluate(() => {
    const sel = 'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
    return [...document.querySelectorAll(sel)].map((e,i) => i+' '+e.tagName+'.'+(e.className||'').toString().slice(0,40)+' :: '+((e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').slice(0,60)));
  });
  log('TOTAL FOCUSABLE: ' + focusables.length);
  log(focusables.filter(f => /rail|proj|weight|stitch|silen|enlarge|zoom|def|map__/i.test(f)).join('\n'));
  log('---- first 60 ----');
  log(focusables.slice(0,60).join('\n'));
};
