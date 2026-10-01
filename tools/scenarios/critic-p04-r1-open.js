/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type()+': '+m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.waitForTimeout(2500);
  await shot('01-landing');
  log('title:', await page.title());
  log('BODY TEXT:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 3000));
  log('CONSOLE:', JSON.stringify(errs, null, 1));
  // what globals exist
  log('globals:', await page.evaluate(() => Object.keys(window).filter(k=>/app|data|store|bus|BE/i.test(k)).join(',')));
};
