/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1799&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(900);
  const b = await page.$('.dossier__body button.dsr__idxbtn:has-text("Every step of the taking")');
  if (b) { await b.click(); await page.waitForTimeout(700); }
  const r = await page.evaluate(() => {
    const el = document.querySelector('.wq__w');
    if (!el) return { none: true };
    el.scrollIntoView({ block: 'center' });
    const rc = el.getBoundingClientRect();
    const doc = document.documentElement;
    return { w: Math.round(rc.width), h: Math.round(rc.height), overflowX: doc.scrollWidth > doc.clientWidth,
      fs: getComputedStyle(el).fontSize, text: (el.textContent||'').replace(/\s+/g,' ').slice(0, 120) };
  });
  log(JSON.stringify(r));
  await shot('mob-warrant');
};
