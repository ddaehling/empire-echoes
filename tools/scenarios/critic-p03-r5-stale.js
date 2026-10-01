/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(() => { location.hash = '#year=1997'; });
  await page.waitForTimeout(1200);
  const t = await page.evaluate(() => Array.from(document.querySelectorAll('.tl__changes .tl-chg')).map(e => {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return { txt: e.innerText.replace(/\n/g,' | ').slice(0,70), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), disp: cs.display, vis: cs.visibility, op: cs.opacity, hidden: e.hidden, aria: e.getAttribute('aria-hidden') };
  }));
  log('CARDS @1997:', JSON.stringify(t, null, 1));
  await shot('y1997');
};
