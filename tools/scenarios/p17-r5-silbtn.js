/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2600);
  await page.keyboard.press('h'); await page.waitForTimeout(900);
  await page.evaluate(() => window.BEA.legend.openPlate('marks'));
  await page.waitForTimeout(800);
  const btn = await page.$('[data-focus-key^="mark-go:"]');
  log('button: ' + (btn ? await btn.textContent() : 'MISSING'));
  const note = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#legend-plate .legend__row')];
    const r = rows.find(n => /Coastline only/.test(n.textContent));
    return r ? r.innerText.replace(/\s+/g,' ') : null;
  });
  log('silence entry: ' + note);
  if (btn) { await btn.click(); await page.waitForTimeout(1200); }
  const after = await page.evaluate(() => {
    let h=0; for (const rec of window.__map.plate.paint.values()) if (rec.mode==='hole') h++;
    const rows = [...document.querySelectorAll('#legend-plate .legend__row')];
    const r = rows.find(n => /Coastline only/.test(n.textContent));
    return { year: window.BEA.store.getState().year, holes: h, entry: r ? r.innerText.replace(/\s+/g,' ') : null };
  });
  log('after: ' + JSON.stringify(after));
  await shot('silence-marks');
  log('ERRORS ' + JSON.stringify(errs));
};
