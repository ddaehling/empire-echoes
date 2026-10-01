/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1994'; });
  await page.waitForTimeout(700);
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('Space');
  for (let i=0;i<10;i++){
    await page.waitForTimeout(900);
    const y = await page.evaluate(() => document.querySelector('.time__slot').innerText.split('\n').filter(s=>/^\d{4}$/.test(s.trim()))[0]);
    const stopped = await page.evaluate(() => {
      const t = document.querySelector('.time__slot').innerText;
      const i = t.indexOf('STOPPED HERE');
      return i>=0 ? t.slice(i, i+420) : '';
    });
    log('t+'+i+'s year='+y+(stopped?('  '+stopped.replace(/\n/g,' | ')):''));
    if (stopped) break;
  }
  await shot('stop-1997');
  // next-change from 1996
  await page.evaluate(() => { location.hash = '#year=1996'; });
  await page.waitForTimeout(700);
  await page.evaluate(() => { const s=document.querySelector('[role="slider"]'); if(s) s.focus(); });
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(600);
  log('Shift+Right from 1996 ->', await page.evaluate(() => document.querySelector('.time__slot').innerText.split('\n').filter(s=>/^\d{4}$/.test(s.trim()))[0]));
};
