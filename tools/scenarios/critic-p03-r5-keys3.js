/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const yr = () => page.evaluate(() => document.querySelector('.tl__year')?.textContent);
  await page.evaluate(() => { location.hash = '#year=1856'; document.querySelector('.tl-ax__rail').focus(); });
  await page.waitForTimeout(700);
  log('focused rail. year', await yr());
  for (const k of ['ArrowRight','ArrowRight','ArrowLeft','Shift+ArrowRight','Alt+ArrowRight','Home','End']) {
    await page.keyboard.press(k); await page.waitForTimeout(500);
    log(k, '->', await yr());
  }
  // aria values
  const aria = await page.evaluate(() => { const r=document.querySelector('.tl-ax__rail'); return {now:r.getAttribute('aria-valuenow'),min:r.getAttribute('aria-valuemin'),max:r.getAttribute('aria-valuemax'),txt:r.getAttribute('aria-valuetext')}; });
  log('ARIA:', JSON.stringify(aria));
  // tab order through timeline
  await page.evaluate(() => { location.hash='#year=1900'; document.body.focus(); });
  await page.waitForTimeout(600);
  const tabs=[];
  for (let i=0;i<30;i++){ await page.keyboard.press('Tab'); tabs.push(await page.evaluate(()=>{const a=document.activeElement; return a.tagName+'.'+(typeof a.className==='string'?a.className.slice(0,40):'')+' ['+(a.getAttribute('aria-label')||a.textContent||'').slice(0,50)+']';})); }
  log('TAB ORDER:', JSON.stringify(tabs, null, 1));
};
