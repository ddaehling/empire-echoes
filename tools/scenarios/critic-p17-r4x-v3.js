/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const r = await page.evaluate(() => {
    const D = window.BEA.data, M = D.unitMeta;
    const st = D.statusAt(1900);
    const d5 = [...st.values()].filter(v=>v.controlDegree===5);
    const d5t = d5.filter(v=>{const m=M.get(v.unitId);return m&&m.tiny;});
    const d3 = [...st.values()].filter(v=>v.controlDegree>=3);
    const d3t = d3.filter(v=>{const m=M.get(v.unitId);return m&&m.tiny;});
    return { d5: d5.length, d5tiny: d5t.length, d3: d3.length, d3tiny: d3t.length };
  });
  log('COUNTS ' + JSON.stringify(r));
  // now drive: stitching on, read byline at several years
  await page.keyboard.press('s'); await page.waitForTimeout(1200);
  for (const y of [1900, 1750, 1650, 1620, 1990, 2020]) {
    await page.evaluate(yy => { const h=new URLSearchParams(location.hash.slice(1)); h.set('year',yy); location.hash='#'+h.toString().replace(/%3A/g,':').replace(/%2C/g,','); }, y);
    await page.waitForTimeout(1300);
    const t = await page.evaluate(() => {
      const by = document.querySelector('.byline'); const leg = document.querySelector('.legend');
      const grab = s => { const m = (s||'').match(/small place[^\n]*/); return m?m[0]:'(none)'; };
      return { year: (document.querySelector('.byline')||{}).innerText ? null : null,
        by: grab(by&&by.innerText), leg: grab(leg&&leg.innerText), hash: location.hash };
    });
    log('year=' + y + ' ' + JSON.stringify(t));
  }
};
