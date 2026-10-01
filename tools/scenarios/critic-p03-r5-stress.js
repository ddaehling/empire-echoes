/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.click('.tl-btn--play');
  for (const k of ['4','1','3','2','4','1']) { await page.keyboard.press(k); await page.waitForTimeout(220); }
  await page.evaluate(()=>{const s=document.querySelector('.tl-speed'); s.value='16'; s.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForTimeout(2500);
  for (let i=0;i<10;i++){ await page.keyboard.press('Shift+ArrowRight'); }
  await page.waitForTimeout(600);
  await page.click('.tl-rate__ask'); await page.waitForTimeout(300);
  const w = await page.$(".tl__warn"); if (w && await w.isVisible()) { await w.click(); await page.waitForTimeout(300); }
  const lanes = await page.$$('.tl-lane'); for (const l of lanes) { await l.click(); await page.waitForTimeout(150); }
  await page.waitForTimeout(800);
  await shot('stress');
  log('year:', await page.evaluate(()=>document.querySelector('.tl__year').textContent));
  log('playing:', await page.evaluate(()=>document.querySelector('.tl-btn--play').dataset.playing));
  log('body height vs viewport:', await page.evaluate(()=>document.documentElement.scrollHeight + ' / ' + window.innerHeight));
  // weird years
  for (const y of [1200, 1300, 1450, 2027, 2026]) {
    await page.evaluate(yy=>{location.hash='#year='+yy;}, y); await page.waitForTimeout(500);
    log(y, await page.evaluate(()=>({c:document.querySelector('.tl__count')?.textContent, h:document.querySelector('.tl__changehead')?.innerText.replace(/\n/g,' · ').slice(0,160), cap:document.querySelector('.tl-spine__caption')?.innerText.slice(0,200)})));
  }
  await shot('year1450');
};
