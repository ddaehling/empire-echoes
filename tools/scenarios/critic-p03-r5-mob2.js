/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.evaluate(()=>{location.hash='#year=1947';}); await page.waitForTimeout(900);
  const r = await page.evaluate(()=>{
    const m = document.querySelector('.tl-chg--more');
    const cards = document.querySelectorAll('.tl-chg:not(.tl-chg--more)');
    const rowEl = document.querySelector('.tl__track');
    return { moreText: m? JSON.stringify(m.innerText) : 'none', moreRect: m? m.getBoundingClientRect().toJSON():null,
      moreStyles: m? (getComputedStyle(m).fontSize+' / '+getComputedStyle(m).overflow+' / color '+getComputedStyle(m).color) : null,
      cards: cards.length, rowScrollW: rowEl? rowEl.scrollWidth : null, rowClientW: rowEl? rowEl.clientWidth : null };
  });
  log(JSON.stringify(r,null,1));
  const m = await page.$('.tl-chg--more');
  if (m) { await m.click(); await page.waitForTimeout(900); await shot('mob-more'); 
    log('after more: '+await page.evaluate(()=>document.querySelector('#timebar').innerText.slice(0,700))); }
};
