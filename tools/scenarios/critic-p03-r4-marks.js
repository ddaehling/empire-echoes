/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  // uncertain / contested markers on axis
  const marks = await page.evaluate(() => [...document.querySelectorAll('.tl-mark')].map(n => ({ label: n.getAttribute('aria-label') || n.title, txt: n.innerText })).slice(0,60));
  log('marks(' + marks.length + '):', JSON.stringify(marks.slice(0,12)));
  // focus one and read
  await page.evaluate(() => document.querySelectorAll('.tl-mark')[10].focus());
  await page.waitForTimeout(500);
  await shot('mark-focused');
  log('after focus body tail:', await page.evaluate(()=>document.body.innerText.slice(-600).replace(/\n/g,' | ')));
  await page.evaluate(() => document.querySelectorAll('.tl-mark')[10].click());
  await page.waitForTimeout(700);
  await shot('mark-clicked');
  log('after click hash:', await page.evaluate(()=>location.hash));
  log('tail:', await page.evaluate(()=>document.body.innerText.slice(-900).replace(/\n/g,' | ')));
  // the account disputed chip
  await page.evaluate(() => { location.hash = '#year=1900'; });
  await page.waitForTimeout(700);
  const chip = await page.$('text=account disputed');
  if (chip) { await chip.click(); await page.waitForTimeout(700); await shot('disputed'); log('disputed panel:', await page.evaluate(()=>document.body.innerText.slice(-1200).replace(/\n/g,' | '))); }
  // phase lane popover
  await page.evaluate(() => document.querySelectorAll('.tl-lane')[3].click());
  await page.waitForTimeout(700);
  await shot('lane-iv');
  log('lane popover:', await page.evaluate(()=>document.querySelector('.tl-pop, [class*=pop]')?.innerText.replace(/\n/g,' | ').slice(0,1400)));
  // 2027 end
  await page.evaluate(() => { location.hash = '#year=2027'; });
  await page.waitForTimeout(700);
  await shot('year2027');
  log('2027 caption:', await page.evaluate(()=>document.querySelector('.tl-spine__caption')?.innerText));
};
