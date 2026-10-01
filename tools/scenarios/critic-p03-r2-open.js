/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('landing');
  log('title:', await page.title());
  const t = await page.evaluate(() => {
    const el = document.querySelector('#timeline, .timeline, [data-module="timeline"], .timeline-root');
    return el ? {sel: el.className + '#' + el.id, text: el.innerText} : null;
  });
  log('timeline block:', JSON.stringify(t));
  log('full body text:', (await page.evaluate(() => document.body.innerText)).slice(0, 4000));
  const shell = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('[class*="slot"],[data-slot]').forEach(e => out.push(e.tagName + '.' + e.className + ' slot=' + e.getAttribute('data-slot')));
    return out.slice(0,40);
  });
  log('slots:', JSON.stringify(shell, null, 1));
};
