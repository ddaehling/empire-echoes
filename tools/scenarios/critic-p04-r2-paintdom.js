/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const snap = () => page.evaluate(() => {
    const nodes = [...document.querySelectorAll('.map__unit, [data-unit]')];
    const lit = [], dim = [];
    for (const n of nodes) {
      const cs = getComputedStyle(n);
      const o = parseFloat(cs.opacity);
      const id = n.dataset.unit || n.getAttribute('data-unit-id') || n.id;
      (o >= 0.9 ? lit : dim).push(id + '@' + o.toFixed(2));
    }
    return { total: nodes.length, litN: lit.length, dimN: dim.length, litSample: lit.slice(0, 60) };
  });
  await page.evaluate(() => { const b=document.querySelector('[data-block="nested"]'); if(b) b.scrollIntoView({block:'center'}); });
  await page.waitForTimeout(300);
  log('BEFORE ' + JSON.stringify(await snap()));
  await page.click('[data-act="paint-direct"]');
  await page.waitForTimeout(1000);
  log('DIRECT ' + JSON.stringify(await snap()));
  await page.click('[data-act="paint-children"]');
  await page.waitForTimeout(1000);
  log('INSIDE ' + JSON.stringify(await snap()));
};
