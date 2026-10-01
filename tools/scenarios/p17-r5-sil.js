/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2600);
  await page.keyboard.press('h'); await page.waitForTimeout(900);
  const r = await page.evaluate(() => {
    const m = window.__map;
    const froms = [...m.silences.values()].map(e => e.from);
    let holes = 0; for (const rec of m.plate.paint.values()) if (rec.mode==='hole') holes++;
    return { froms, min: Math.min(...froms.filter(Number.isFinite)), holesNow: holes,
      legendFirst: window.BEA.legend ? null : null };
  });
  log('silences: ' + JSON.stringify(r));
  const goto = async (y) => { await page.evaluate(yy=>{location.hash='#year='+yy;}, y); await page.waitForTimeout(1200);
    return page.evaluate(() => { let h=0; for (const rec of window.__map.plate.paint.values()) if (rec.mode==='hole') h++;
      const by=document.getElementById('legend-byline'); return { h, by: by.innerText.replace(/\s+/g,' ').slice(-220) }; }); };
  for (const y of [1900, r.min, r.min + 1, 1965]) log('@'+y+' '+JSON.stringify(await goto(y)));
};
