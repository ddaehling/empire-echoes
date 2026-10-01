/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('[data-slot],[data-module],[data-piece]').forEach(e => {
      const r = e.getBoundingClientRect();
      out.push({ slot: e.dataset.slot||e.dataset.module||e.dataset.piece, cls: e.className, rect: [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)] });
    });
    return out;
  });
  log('SLOTS', JSON.stringify(info, null, 1));
  // find overflow-clipped elements inside legend
  const clip = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll('*').forEach(e => {
      if (e.scrollHeight > e.clientHeight + 2 && e.clientHeight > 20) {
        const cs = getComputedStyle(e);
        if (cs.overflowY === 'hidden' || cs.overflow === 'hidden') {
          res.push({ tag: e.tagName, cls: String(e.className).slice(0,80), sh: e.scrollHeight, ch: e.clientHeight, txt: e.innerText.slice(0,120) });
        }
      }
    });
    return res;
  });
  log('CLIPPED', JSON.stringify(clip, null, 1));
};
