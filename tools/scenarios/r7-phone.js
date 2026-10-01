/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1799&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const b = await page.$('.dossier__body button.dsr__idxbtn:has-text("Every step of the taking")');
  if (b) { await b.click(); await page.waitForTimeout(700); }
  const r = await page.evaluate(() => {
    const el = document.querySelector('.wq__w');
    if (el) el.scrollIntoView({ block: 'center' });
    const cs = el ? getComputedStyle(el) : null;
    const note = document.querySelector('.wq__note');
    return { fs: cs && cs.fontSize, col: cs && cs.color, noteCol: note && getComputedStyle(note).color,
      w: el ? Math.round(el.getBoundingClientRect().width) : 0 };
  });
  log(JSON.stringify(r));
  await shot('warrant-here');
  // map sizes
  for (const [w, h] of [[390, 844], [1366, 768]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:8777/app/#year=1921', { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const m = await page.evaluate(() => {
      const el = document.querySelector('.map');
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), vh: window.innerHeight, pct: Math.round(r.height / window.innerHeight * 100) };
    });
    log(w + 'x' + h + '  map ' + JSON.stringify(m));
    await shot('map-' + w);
  }
};
