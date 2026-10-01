/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1000);
  // NOT enlarged
  await page.keyboard.press('p');
  await page.waitForTimeout(3000);
  await shot('small-equal');
  const info = async (tag) => {
    const r = await page.evaluate(() => {
      const b = [...document.querySelectorAll('*')].find(e => /ASK THESE THREE/.test(e.textContent||'') && !/ASK THESE THREE/.test(e.parentElement?.parentElement?.textContent?.replace(e.textContent,'')||''));
      const panel = document.querySelector('.byline, .map__byline, [class*=byline]');
      const pr = panel ? panel.getBoundingClientRect() : null;
      const gb = document.getElementById('map-u-great-britain');
      return { panelCls: panel && panel.className, panelRect: pr && {x:pr.x,y:pr.y,w:pr.width,h:pr.height},
        panelBg: panel && getComputedStyle(panel).backgroundColor,
        gbRect: gb && (()=>{const b2=gb.getBoundingClientRect(); return {x:b2.x,y:b2.y,w:b2.width,h:b2.height};})(),
        gbExists: !!gb };
    });
    log(tag + ' ' + JSON.stringify(r));
  };
  await info('small-equal');
  // now enlarge
  await page.keyboard.press('e');
  await page.waitForTimeout(2500);
  await shot('big-equal');
  await info('big-equal');
  await page.mouse.move(600, 700);
  await page.waitForTimeout(6000);
  await shot('big-equal-later');
  await info('big-equal-later');
};
