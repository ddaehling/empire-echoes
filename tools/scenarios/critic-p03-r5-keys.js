/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message.slice(0,200)));
  await page.waitForTimeout(3000);
  const yr = () => page.evaluate(() => {
    const m = /year=(\d+)/.exec(location.hash); 
    const big = document.querySelector('.tl__year, .tl-year, [class*=year]');
    return { hash: location.hash, big: big ? big.innerText.slice(0,40) : null };
  });
  await page.evaluate(()=>{location.hash='#year=1856';});
  await page.waitForTimeout(900);
  await page.click('body', {position:{x:700,y:640}}).catch(()=>{});
  await page.waitForTimeout(300);
  log('after set 1856: '+JSON.stringify(await yr()));
  // shift+right
  await page.keyboard.press('Shift+ArrowRight'); await page.waitForTimeout(600);
  log('Shift+Right: '+JSON.stringify(await yr()));
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(400);
  log('Right: '+JSON.stringify(await yr()));
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(400);
  log('Left: '+JSON.stringify(await yr()));
  await page.keyboard.press('Home'); await page.waitForTimeout(500);
  log('Home: '+JSON.stringify(await yr()));
  await page.keyboard.press('End'); await page.waitForTimeout(500);
  log('End: '+JSON.stringify(await yr()));
  await shot('end-year');
  // space play
  await page.evaluate(()=>{location.hash='#year=1880';}); await page.waitForTimeout(700);
  await page.keyboard.press('Space'); await page.waitForTimeout(2500);
  log('after space 2.5s: '+JSON.stringify(await yr()));
  await shot('playing');
  await page.keyboard.press('Space'); await page.waitForTimeout(500);
  const after = await yr();
  await page.waitForTimeout(1500);
  log('paused: '+JSON.stringify(after)+' then '+JSON.stringify(await yr()));
  log('errors: '+errs.join('|'));
};
