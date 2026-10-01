/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1997));
  await page.waitForTimeout(700);
  await shot('bar-1997');
  await page.evaluate(() => window.BEA.bus.emit('timeline:openClose'));
  await page.waitForTimeout(600);
  await shot('close-ask');
  // answer the question
  await page.evaluate(() => { const b=[...document.querySelectorAll('.tl-close__choice')].find(x=>/1 or 2/.test(x.textContent)); b && b.click(); });
  await page.waitForTimeout(400);
  await shot('close-revealed');
  // expand a place
  await page.evaluate(() => { const b=[...document.querySelectorAll('.tl-close__name')].find(x=>/Gibraltar/.test(x.textContent)); b && b.click(); b && b.scrollIntoView({block:'center'}); });
  await page.waitForTimeout(300);
  await shot('close-place');
  // scroll to the disputes
  await page.evaluate(() => { const h=[...document.querySelectorAll('.cx-panel__head')].find(x=>/disputed/.test(x.textContent)); h && h.scrollIntoView({block:'start'}); });
  await page.waitForTimeout(300);
  await shot('close-disputed');
  await page.evaluate(() => { const h=[...document.querySelectorAll('.cx-panel__head')].find(x=>/since the story/.test(x.textContent)); h && h.scrollIntoView({block:'start'}); });
  await page.waitForTimeout(300);
  await shot('close-since');
  // the sentence
  await page.evaluate(() => { const i=document.querySelector('.tl-close__blank'); i && i.scrollIntoView({block:'center'}); });
  await page.waitForTimeout(300);
  await shot('close-sentence');
  await page.evaluate(() => {
    const v=['sugar plantations','a company','lots of different kinds of rule',''];
    document.querySelectorAll('.tl-close__blank').forEach((n,i)=>{ n.value=v[i]; });
    document.querySelector('.tl-close__commit').click();
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => { const m=document.querySelector('.tl-close__mine'); m && m.scrollIntoView({block:'center'}); });
  await shot('close-mine');
  await page.evaluate(() => { const h=[...document.querySelectorAll('.cx-panel__head')].find(x=>/argue/.test(x.textContent)); h && h.scrollIntoView({block:'start'}); });
  await page.waitForTimeout(300);
  await shot('close-argue');
  const t = await page.evaluate(() => document.querySelector('.tl-close').innerText);
  log(t);
};
