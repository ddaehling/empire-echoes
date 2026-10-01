/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const FIX = () => { const s=document.createElement('style'); s.textContent='.dsr__prose,.dsr__name{font-size:1rem !important;line-height:1.35 !important}'; document.head.append(s); };
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate(FIX);
  await page.evaluate(() => { location.hash = '#year=1858'; });
  await page.waitForTimeout(800);
  await shot('tl-1858', '.tl');
  log('1858 chips:', await page.evaluate(() => [...document.querySelectorAll('.tl-chip')].map(c=>c.innerText.replace(/\n/g,' ')).join(' || ')));
  log('1858 acquisitions raw:', await page.evaluate(() => window.BEA.data.acquisitions.filter(a=>a.year===1858).map(a=>a.mechanism+' :: '+(a.territoryName||a.territoryId)).join(' || ')));
  log('1858 departures raw:', await page.evaluate(() => window.BEA.data.departures.filter(a=>a.year===1858).map(a=>a.mechanism+' :: '+(a.territoryName||a.territoryId)).join(' || ')));
  // off-by-one announcement test
  await page.evaluate(() => document.querySelector('.tl-ax__rail').focus());
  const before = await page.evaluate(() => document.querySelector('.tl__count').innerText);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(50);
  const ann = await page.evaluate(() => { const n=[...document.querySelectorAll('[aria-live]')].map(x=>x.textContent.trim()).filter(t=>/^\d{4}\./.test(t)); return n.join(' || '); });
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => document.querySelector('.tl__count').innerText);
  const vt = await page.evaluate(() => document.querySelector('.tl-ax__rail').getAttribute('aria-valuetext'));
  log('count at 1858:', before, '| announced on move to 1859:', ann, '| count after:', after, '| valuetext:', vt);
};
