/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  const years = [1585,1600,1815,1838,1858,1942,1945,1947,1922,1997,1778,1900,1941,1968];
  for (const y of years) {
    await page.evaluate((yy) => { location.hash = '#year=' + (yy-1); }, y);
    await page.waitForTimeout(400);
    await page.locator('.tl-btn--play').click();
    let card = null;
    for (let i=0;i<14;i++){ await page.waitForTimeout(400);
      const s = await page.evaluate(()=>({y:document.querySelector('.tl__year')?.textContent, playing:document.querySelector('.tl-btn--play')?.getAttribute('data-playing'),
        card:(()=>{const c=Array.from(document.querySelectorAll('*')).filter(e=>/^STOPPED HERE/.test(e.innerText||'')).pop(); return c?c.innerText.replace(/\n/g,' | '):null;})()}));
      if (s.playing==='false' && s.card) { card = s.y + ' >> ' + s.card; break; }
    }
    log(y + ' :: ' + (card || 'NO STOP'));
    await page.evaluate(()=>{ const b=document.querySelector('.tl-btn--play'); if(b.getAttribute('data-playing')==='true') b.click(); });
  }
};
