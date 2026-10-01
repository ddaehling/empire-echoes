/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10-look — the card in every skin: return, offer, mobile, dark, reduced. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 10000 });
  await page.waitForTimeout(1200);

  // a session's worth of work, then a day passes
  await page.evaluate(() => { BEA.quiz.open('t6-who-conquered'); });
  await page.waitForTimeout(200);
  await page.evaluate(() => BEA.quiz.answer('navy'));
  await page.waitForTimeout(200);
  await page.evaluate(() => { BEA.quiz.close(); BEA.quiz.open('t13-berlin'); });
  await page.waitForTimeout(200);
  await page.evaluate(() => BEA.quiz.answer('carved'));
  await page.waitForTimeout(200);
  await page.evaluate(() => { BEA.quiz.close(); BEA.quiz.open('t19-exits'); });
  await page.waitForTimeout(200);
  await page.evaluate(() => BEA.quiz.answer(90));
  await page.waitForTimeout(300);
  await page.evaluate(() => { BEA.quiz.close(); BEA.quiz._age(26*60*60*1000); BEA.quiz._openOnReturn(); });
  await page.waitForTimeout(800);
  await shot('01-return');

  // what the lede band says when something falls due mid-session
  await page.evaluate(() => { BEA.quiz.close(); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { BEA.store.dispatch('setYear', 1885); });
  await page.waitForTimeout(700);
  await shot('02-offer-in-the-band');
  const say = await page.evaluate(() => (document.querySelector('.cx-lede__say')||{}).innerText || '');
  log('LEDE SAYS: ' + say);
  const ctl = await page.evaluate(() => { const b=document.querySelector('.qz-open'); return b? {text:b.innerText, title:b.title, hidden:b.hidden} : null; });
  log('CONTROL: ' + JSON.stringify(ctl));

  // an answered explain item
  await page.evaluate(() => { BEA.quiz.open('t7-explain'); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { const ta=document.querySelector('.qz-ta'); ta.value='The company got the right to tax Bengal and used the money to hire more soldiers.'; ta.dispatchEvent(new Event('input',{bubbles:true})); });
  await page.waitForTimeout(150);
  await page.evaluate(() => document.querySelector('.qz__commit').click());
  await page.waitForTimeout(500);
  await shot('03-explain-model');

  // nothing due
  await page.evaluate(() => { BEA.quiz.close(); BEA.quiz.forget(); });
  await page.waitForTimeout(200);
  await page.evaluate(() => { const q=BEA.quiz; q.close(); document.querySelector('.qz-open').click(); });
  await page.waitForTimeout(400);
  await page.evaluate(() => BEA.quiz.close());
  await page.waitForTimeout(200);
  await page.evaluate(() => { window.__done = true; });
  // force the "nothing due" panel
  await page.evaluate(() => { const m = BEA.registry ? null : null; });
  await page.evaluate(() => { BEA.quiz.open('t20-still'); });
  await page.waitForTimeout(400);
  await shot('04-map-question');
};
