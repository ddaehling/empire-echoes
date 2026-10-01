/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1600);
  const read = () => page.evaluate(() => ({
    proj: (document.querySelector('#legend-byline [data-field=projection]')||{}).textContent,
    crit: [...document.querySelectorAll('.byline__crit, .lplate__crit li strong, .lplate__crit b, .lcrit__h')].map(e=>e.textContent.trim()).slice(0,6),
    critText: (document.querySelector('#legend-plate')||document.body).innerText.replace(/\s+/g,' ').match(/THREE THINGS WRONG WITH THIS RENDERING(.{0,320})/)?.[1] || null,
  }));
  const openPlate = async () => { const k = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>/full key/i.test(b.innerText));if(!b)return null;const r=b.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};}); if(k) await page.mouse.click(k.x,k.y); await page.waitForTimeout(1400); };
  await openPlate();
  log('MERCATOR:', JSON.stringify(await read()));
  await page.keyboard.press('p');
  await page.waitForTimeout(2500);
  log('EQUAL-AREA:', JSON.stringify(await read()));
  await page.keyboard.press('p');
  await page.waitForTimeout(2500);
  log('BACK TO MERCATOR:', JSON.stringify(await read()));
};
