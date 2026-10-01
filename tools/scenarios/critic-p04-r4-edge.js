/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const { fixGrid } = require('./critic-p04-r4-lib.js');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await fixGrid(page, log);
  await page.evaluate(() => { location.hash = '#year=1900&sel=no-such-place'; });
  await page.waitForTimeout(900);
  log('BAD ID:', (await page.evaluate(()=>document.querySelector('#dossier').innerText)).slice(0,400).replace(/\n+/g,' | '));
  await shot('bad-id');
  await page.evaluate(() => { location.hash = '#year=1900&sel=bermuda'; });
  await page.waitForTimeout(900);
  const b = await page.evaluate(()=>{
    const d=document.querySelector('#dossier');
    const m=[...d.querySelectorAll('*')].find(e=>/\[missing local actors\]/.test(e.textContent) && e.children.length===0);
    return m ? {cls:m.className, color:getComputedStyle(m).color, txt:m.textContent} : null;
  });
  log('bermuda missing mark:', JSON.stringify(b));
  await page.evaluate(()=>{const d=document.querySelector('#dossier');const m=[...d.querySelectorAll('*')].find(e=>/\[missing local actors\]/.test(e.textContent)&&e.children.length===0); m&&m.scrollIntoView({block:'center'});});
  await page.waitForTimeout(400);
  await shot('bermuda-missing');
  // very sparse / tiny territory
  await page.evaluate(() => { location.hash = '#year=1900&sel=ascension'; });
  await page.waitForTimeout(900);
  log('ASCENSION:', (await page.evaluate(()=>document.querySelector('#dossier').innerText)).slice(0,900).replace(/\n+/g,' | '));
  await shot('ascension');
};
