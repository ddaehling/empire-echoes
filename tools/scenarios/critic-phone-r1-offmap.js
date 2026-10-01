/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(1000);
  for (let i = 1; i <= 26; i++) {
    await page.waitForTimeout(220);
    for (let p=0;p<3;p++){
      const n = page.locator('.tr-bar__next').first();
      if (!(await n.count()) || !(await n.isDisabled().catch(()=>true))) break;
      const f = page.locator('.tr-field__cell');
      if (await f.count()) { await f.nth(4).click({force:true}).catch(()=>{}); await page.waitForTimeout(250); continue; }
      break;
    }
    const n = page.locator('.tr-bar__next').first();
    if (!(await n.count()) || !(await n.isVisible().catch(()=>false))) break;
    await n.click().catch(()=>{});
  }
  await page.waitForTimeout(1200);
  const found = await page.evaluate(() => {
    const t = document.body.innerText;
    const hits = [];
    ['off this map','Congo','Lumumba','Algeria','Angola','Mozambique','One more'].forEach(k => { if (t.includes(k)) hits.push(k); });
    const btns = [...document.querySelectorAll('button,a')].filter(e=>/off this map|congo|one more/i.test(e.innerText||'')).map(e=>e.className+' :: '+e.innerText.trim().slice(0,60)+' vis='+(e.getBoundingClientRect().height>0));
    return {hits, btns, len:t.length};
  });
  log('END page hits: ' + JSON.stringify(found));
  // deep-link the congo beat directly
  await page.goto(page.url().split('#')[0] + '#tour=thirty&step=25&filter=stage:working,pressure:off');
  await page.waitForTimeout(2000);
  await shot('step25');
  log('after step=25: ' + (await page.evaluate(()=>document.querySelector('.cx-sheet__title')?.innerText || document.body.innerText.slice(0,200))));
};
