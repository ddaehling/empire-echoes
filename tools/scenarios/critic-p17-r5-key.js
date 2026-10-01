/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.waitForTimeout(3000);
  // find the "Open the full key" control
  const found = await page.evaluate(() => {
    const els = [...document.querySelectorAll('button,a,[role="button"]')];
    const m = els.find(e => /open the full key/i.test(e.innerText));
    if (!m) return null;
    const r = m.getBoundingClientRect();
    return { text: m.innerText.replace(/\s+/g,' '), x: r.x+r.width/2, y: r.y+r.height/2, tag: m.tagName };
  });
  log('FULLKEY BTN: ' + JSON.stringify(found));
  if (found) { await page.mouse.click(found.x, found.y); await page.waitForTimeout(1200); }
  await shot('01-fullkey');
  const t = await page.evaluate(() => document.body.innerText);
  log('AFTER OPEN (first 4000): ' + t.slice(0, 4000));
  log('ERR: ' + JSON.stringify(errs));
};
