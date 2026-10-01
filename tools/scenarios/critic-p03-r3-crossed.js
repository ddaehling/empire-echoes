/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const years = [];
  for (let y=1600;y<=2027;y++) years.push(y);
  const hits = [];
  for (const y of [1941,1942,1922,1834,1798,1919,1882,1956,1971]) {
    await page.evaluate((yy)=>window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(450);
    await page.evaluate(()=>document.querySelector('.tl-chg--more')?.click());
    await page.waitForTimeout(400);
    const t = await page.evaluate(()=>{
      const rows=[...document.querySelectorAll('.tl-all__row')].map(r=>r.innerText.replace(/\n+/g,' | '));
      const cards=[...document.querySelectorAll('.tl-chg:not(.tl-chg--more)')].map(r=>r.innerText.replace(/\n+/g,' | '));
      const src = rows.length?rows:cards;
      return src.filter(s=>/Nothing was taken or given up/.test(s));
    });
    if (t.length) log(y+': '+t.join('  //  ').slice(0,900));
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Close'); if(b)b.click();});
    await page.waitForTimeout(150);
  }
};
