/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const st = () => { const leg=document.querySelector('.stage__legend'); const lr=leg.getBoundingClientRect();
  const sw=[...leg.querySelectorAll('svg,[class*="swatch"],[class*="chip-w"]')].filter(n=>{const r=n.getBoundingClientRect();return r.width>3&&r.height>3&&r.bottom<=lr.bottom+1;});
  return {h:Math.round(lr.height), sw:sw.length, colours:/COLOURS/.test(leg.innerText), first:leg.innerText.replace(/\s+/g,' ').slice(0,140)}; };
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  log('base ' + JSON.stringify(await page.evaluate(st)));
  await page.keyboard.press('2'); await page.waitForTimeout(700);
  log('after2 ' + JSON.stringify(await page.evaluate(st)));
  await page.keyboard.press('1'); await page.waitForTimeout(700);
  log('after1 ' + JSON.stringify(await page.evaluate(st)));
  // click FOLD
  const f = await page.$('.stage__legend >> text=FOLD');
  if (f) { await f.click(); await page.waitForTimeout(700); log('foldA ' + JSON.stringify(await page.evaluate(st)));
           await f.click().catch(()=>{}); await page.waitForTimeout(700); log('foldB ' + JSON.stringify(await page.evaluate(st))); }
  else log('no FOLD control found');
  await shot('01-after-fold');
  // does a reload restore?
  await page.reload(); await page.waitForTimeout(3000);
  log('reload ' + JSON.stringify(await page.evaluate(st)));
  // deep link with a definition
  await page.goto('http://localhost:8777/app/#year=1900&def=administered'); await page.waitForTimeout(3000);
  log('deeplink-admin ' + JSON.stringify(await page.evaluate(st)));
  await shot('02-deeplink');
};
