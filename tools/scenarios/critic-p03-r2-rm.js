/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1750'; });
  await page.waitForTimeout(800);
  const play = await page.$('.tl-btn--play');
  log('play label: ' + await page.evaluate(()=>{const b=document.querySelector('.tl-btn--play'); return b.textContent + ' | aria=' + b.getAttribute('aria-label') + ' | disabled=' + b.disabled;}));
  await play.click();
  await page.waitForTimeout(2500);
  log('after click, 2.5s: year=' + await page.evaluate(()=>document.querySelector('.time__slot').innerText.split('\n').filter(s=>/^\d{4}$/.test(s.trim()))[0]));
  await shot('rm-play');
  log('slot: ' + await page.evaluate(()=>document.querySelector('.time__slot').innerText.slice(0,400).replace(/\n/g,' | ')));
  const note = await page.evaluate(()=>{const n=document.querySelector('.foot__slot'); return n?n.innerText.slice(0,400):'';});
  log('foot: '+note);
};
