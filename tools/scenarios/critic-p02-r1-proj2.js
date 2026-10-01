/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const st = async () => page.evaluate(()=>({proj:document.querySelector('.map').dataset.projection, hash:location.hash}));
  log('start', JSON.stringify(await st()));
  // press p with focus on body
  await page.click('.map__plate', {position:{x:400,y:600}}).catch(e=>log('plate click fail', e.message));
  await page.keyboard.press('p'); await page.waitForTimeout(1500);
  log('after p', JSON.stringify(await st())); await shot('after-p');
  // direct button dispatch
  const r = await page.evaluate(()=>{ const b=document.querySelector('.map__proj'); const rect=b.getBoundingClientRect(); const top=document.elementFromPoint(rect.x+rect.width/2, rect.y+rect.height/2); b.click(); return {rect:{x:rect.x,y:rect.y,w:rect.width,h:rect.height}, top: top? (top.className||top.tagName):null}; });
  log('btn dispatch', JSON.stringify(r));
  await page.waitForTimeout(1600);
  log('after dispatch', JSON.stringify(await st())); await shot('after-dispatch');
  // via URL
  await page.goto('http://localhost:8777/app/#year=1913&proj=mercator', {waitUntil:'load'});
  await page.waitForTimeout(2500);
  log('via url', JSON.stringify(await st())); await shot('url-mercator');
};
