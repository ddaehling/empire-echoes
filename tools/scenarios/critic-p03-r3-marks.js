/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const marks = await page.$$('.tl-mark');
  log('mark count:', marks.length);
  log('tabindexes:', await page.evaluate(() => [...document.querySelectorAll('.tl-mark')].map(b=>b.tabIndex).join(',')));
  // click the ring near 1857
  await marks[10].click();
  await page.waitForTimeout(700);
  await shot('markpop');
  log('popover:', await page.evaluate(() => {
    const p = document.querySelector('.tl-pop, [class*="pop"]');
    return p ? {cls:p.className, hidden:p.hidden, txt:p.innerText.slice(0,1600)} : 'none';
  }));
  // keyboard through marks
  await page.evaluate(() => document.querySelector('.tl-mark').focus());
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(600);
  await shot('markkbd');
  log('popover2:', await page.evaluate(() => {
    const p = document.querySelector('.tl-pop, [class*="pop"]');
    return p ? p.innerText.slice(0,1600) : 'none';
  }));
  // the "account disputed — why?" chip
  const warn = await page.$('.tl__warn');
  log('warn chip:', warn ? await warn.evaluate(n=>n.outerHTML.slice(0,400)) : 'none');
  if (warn) { await warn.click(); await page.waitForTimeout(600); await shot('warnpop');
    log('warn popover:', await page.evaluate(() => { const p=document.querySelector('.tl-pop'); return p?p.innerText.slice(0,1600):'none';})); }
};
