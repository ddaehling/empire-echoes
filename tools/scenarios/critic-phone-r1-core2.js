/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Element is not visible.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(1200);
  const go = page.locator('.tr-routes__go').first();
  if (await go.count()) { await go.click({force:true}); log('took short route'); } else log('NO OFFER');
  await page.waitForTimeout(1500);
  log('hash after: ' + (page.url().split('#')[1]||''));
  let chars = 0, n = 0, titles = [];
  for (let i = 1; i <= 22; i++) {
    await page.waitForTimeout(180);
    const b = page.locator('.tr-bar__next').first();
    if (!(await b.count())) break;
    if (await b.isDisabled().catch(()=>true)) {
      const f = page.locator('.tr-field__cell');
      if (await f.count()) { await f.nth(4).click({force:true}).catch(()=>{}); await page.waitForTimeout(250); }
    }
    const info = await page.evaluate(()=>({ s:(document.querySelector('.tr-bar__count')||{}).innerText?.replace(/\s+/g,'')||'?', t:(document.querySelector('.cx-sheet__title')||{}).innerText?.trim()||'', c:(document.querySelector('.cx-sheet__body')||{}).innerText?.length||0 }));
    chars += info.c; n++; titles.push(info.s+' '+info.t+' ('+info.c+')');
    if (!(await b.isVisible().catch(()=>false)) || await b.isDisabled().catch(()=>true)) { log('stop at ' + info.s); break; }
    await b.click({timeout:5000}).catch(e=>log('cf'));
  }
  log(titles.join('\n'));
  log(`CORE: ${n} steps, ${chars} chars ≈ ${Math.round(chars/5.5)} words ≈ ${(chars/5.5/180).toFixed(1)} min reading @180wpm`);
  await page.waitForTimeout(800);
  await shot('core-end');
  log('final panel head: ' + await page.evaluate(()=>document.querySelector('.cx-sheet__body')?.innerText.slice(0,300)));
};
