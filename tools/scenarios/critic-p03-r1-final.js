/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const FIX = () => { const s=document.createElement('style'); s.textContent='.dsr__prose,.dsr__name{font-size:1rem !important;line-height:1.35 !important}'; document.head.append(s); };
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate(FIX);

  // 1947 — the biggest year
  await page.evaluate(() => { location.hash = '#year=1947'; });
  await page.waitForTimeout(700);
  await shot('tl-1947', '.tl');
  log('more element tag:', await page.evaluate(() => { const n=document.querySelector('.tl__more'); return n ? n.tagName + ' :: ' + n.innerText + ' :: tabindex=' + n.tabIndex + ' :: onclick=' + !!n.onclick : 'none'; }));
  log('chips at 1947:', await page.evaluate(() => document.querySelectorAll('.tl-chip').length));

  // Home
  await page.click('.tl-ax__rail');
  await page.keyboard.press('Home');
  await page.waitForTimeout(500);
  log('Home count text:', await page.evaluate(() => document.querySelector('.tl__count').innerText));
  log('Home caption:', await page.evaluate(() => document.querySelector('.tl-spine__caption').innerText));
  await shot('tl-home-1200', '.tl');

  // compare ghost
  await page.evaluate(() => { location.hash = '#year=1913&compare=1947'; });
  await page.waitForTimeout(700);
  log('ghost hidden?', await page.evaluate(() => document.querySelector('.tl-ax__ghost').hidden), await page.evaluate(() => document.querySelector('.tl-ax__ghost').innerText));
  await shot('tl-compare', '.tl');

  // visit all four phases
  for (const y of [1600, 1700, 1900, 1960]) { await page.evaluate((yy)=>{location.hash='#year='+yy;}, y); await page.waitForTimeout(350); }
  log('seen line:', await page.evaluate(() => document.querySelector('.tl-spine__seen').innerText));
  await shot('tl-seen-all', '.tl');

  // tab order through the timeline
  await page.evaluate(() => document.querySelector('.tl-btn--play').focus());
  const order = [];
  for (let i = 0; i < 14; i++) {
    order.push(await page.evaluate(() => { const a=document.activeElement; return a.tagName + '.' + (typeof a.className==='string'?a.className.split(' ')[0]:'') + ' [' + (a.innerText||a.getAttribute('aria-label')||'').slice(0,28).replace(/\n/g,' ') + ']'; }));
    await page.keyboard.press('Tab');
  }
  log('TAB ORDER:\n' + order.join('\n'));
};
