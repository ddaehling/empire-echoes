/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'children').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const leg = await page.$('.legend');
  if (leg) { const p = await shot('legend-el'); }
  await shot('full');
  const r = await page.evaluate(() => {
    const leg = document.querySelector('.legend');
    const kids = [...leg.children].map(n => ({ c: n.className, h: Math.round(n.getBoundingClientRect().height), t: n.innerText.replace(/\s+/g,' ').slice(0,120) }));
    const head = leg.querySelector('.legend__head');
    const hk = [...head.children].map(n => ({ c: n.className, h: Math.round(n.getBoundingClientRect().height), t: n.innerText.replace(/\s+/g,' ').slice(0,140) }));
    const hh = [...head.querySelectorAll('.legend__rulebox > *')].map(n => ({ c: n.className, h: Math.round(n.getBoundingClientRect().height), t: n.innerText.replace(/\s+/g,' ').slice(0,140) }));
    return { kids, hk, hh };
  });
  log(JSON.stringify(r, null, 1));
};
