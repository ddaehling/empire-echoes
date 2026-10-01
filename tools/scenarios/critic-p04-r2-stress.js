/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  // rapid year scrub with dossier open
  const t0 = Date.now();
  for (let y = 1700; y <= 1980; y += 4) {
    await page.evaluate((yy) => { location.hash = '#year=' + yy + '&sel=british-india'; }, y);
  }
  await page.waitForTimeout(1500);
  log('scrub 70 steps in ' + (Date.now()-t0) + 'ms');
  log('after scrub: ' + await page.evaluate(() => (document.querySelector('.dossier')||{innerText:'GONE'}).innerText.slice(0,200).replace(/\n/g,' | ')));
  await shot('after-scrub');
  // rapid selection changes
  const ids=['kenya','egypt','jamaica','hong-kong','malta','barbados','ireland','uganda'];
  for (let i=0;i<40;i++){ await page.evaluate((id)=>{location.hash='#year=1913&sel='+id;}, ids[i%ids.length]); }
  await page.waitForTimeout(1500);
  log('after 40 selects: ' + await page.evaluate(() => (document.querySelector('.dossier')||{innerText:'GONE'}).innerText.slice(0,160).replace(/\n/g,' | ')));
  // escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  log('after Escape: ' + await page.evaluate(() => { const d=document.querySelector('.dossier'); return d ? d.innerText.slice(0,120).replace(/\n/g,' | ') : 'REMOVED'; }));
  log('url: ' + page.url());
  await shot('after-escape');
  // close button
  await page.evaluate(()=>{location.hash='#year=1913&sel=kenya';});
  await page.waitForTimeout(700);
  const cb = await page.$('.dsr__close'); if (cb) { await cb.click(); await page.waitForTimeout(600); }
  log('after close click url: ' + page.url());
  log('panel: ' + await page.evaluate(() => { const d=document.querySelector('.dossier'); return d ? d.innerText.slice(0,120).replace(/\n/g,' | ') : 'REMOVED'; }));
};
