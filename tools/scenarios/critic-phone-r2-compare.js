/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=13',{waitUntil:'load'});
  await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
  await page.waitForTimeout(1300);
  const years = async (tag)=>{
    const r = await page.evaluate(()=>{
      const grab = s=>{const e=document.querySelector(s); return e?e.innerText.replace(/\n/g,' | ').slice(0,120):null;};
      const st=window.BEA.store.getState();
      const all=[...document.querySelectorAll('body *')].filter(e=>!e.children.length).map(e=>e.textContent.trim()).filter(t=>/^(1[5-9]\d\d|20\d\d)$/.test(t));
      return {storeYear:st.year, lede:grab('.app__lede'), time:grab('.app__time'), yearsOnScreen:[...new Set(all)]};
    });
    log(tag+' :: '+JSON.stringify(r));
  };
  await years('beat13 before compare');
  await shot('b13');
  // open compare
  const btn = page.locator('button:has-text("Compare"), [aria-label*="ompare"]').first();
  if (await btn.count()) { await btn.click().catch(e=>log('compare click fail '+e.message)); }
  else {
    // via tools
    const tools = page.locator('button:has-text("Tools")').first();
    if (await tools.count()) { await tools.click(); await page.waitForTimeout(500); await shot('tools-open');
      const c = page.locator('button:has-text("Compare")').first();
      if (await c.count()) await c.click().catch(()=>{}); else log('no Compare in tools');
    }
  }
  await page.waitForTimeout(1400);
  await shot('compare-open');
  await years('beat13 after compare');
  log('TEXT '+(await page.evaluate(()=>document.body.innerText)).slice(0,1400));
};
