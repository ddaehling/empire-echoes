/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Failed to execute 'getComputedStyle' on 'Window': parameter 1 is.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1765'; });
  await page.waitForTimeout(800);
  const t = await page.evaluate(() => {
    const tr = document.querySelector('.tl__track');
    const cs = getComputedStyle(tr);
    return { scrollW: tr.scrollWidth, clientW: tr.clientWidth, overflowX: cs.overflowX, rect: tr.getBoundingClientRect().toJSON() };
  });
  log('track:', JSON.stringify(t));
  await shot('a-before-scroll');
  // try scrolling
  await page.evaluate(() => { document.querySelector('.tl__track').scrollLeft = 900; });
  await page.waitForTimeout(400);
  await shot('b-scrolled');
  log('scrollLeft after set:', await page.evaluate(() => document.querySelector('.tl__track').scrollLeft));
  // wheel over the track
  await page.evaluate(() => { document.querySelector('.tl__track').scrollLeft = 0; });
  await page.mouse.move(900, 800);
  await page.mouse.wheel(300, 0);
  await page.waitForTimeout(400);
  log('scrollLeft after wheel:', await page.evaluate(() => document.querySelector('.tl__track').scrollLeft));
  // click open the other
  await page.evaluate(() => { document.querySelector('.tl__track').scrollLeft = 0; });
  const more = await page.$('.tl-chg--more');
  log('more visible', await more.isVisible(), await more.innerText());
  await more.click();
  await page.waitForTimeout(700);
  await shot('c-opened');
  const after = await page.evaluate(() => {
    const tr = document.querySelector('.tl__track');
    return { n: [...document.querySelectorAll('.tl-chg')].filter(n=>n.offsetParent).length, scrollW: tr.scrollWidth, clientW: tr.clientWidth, h: tr.getBoundingClientRect().height };
  });
  log('after open:', JSON.stringify(after));
  // tab order through cards
  await page.keyboard.press('Tab');
  log('focus:', await page.evaluate(()=>document.activeElement.className));
};
