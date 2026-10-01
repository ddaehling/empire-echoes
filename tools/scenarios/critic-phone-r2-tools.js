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
  await page.waitForTimeout(1200);
  await page.locator('button:has-text("Tools")').first().click();
  await page.waitForTimeout(800);
  await shot('tools');
  const items = await page.evaluate(()=>[...document.querySelectorAll('button,a[href]')].filter(e=>e.offsetParent).map(e=>({t:(e.textContent||'').trim().replace(/\s+/g,' ').slice(0,60), r:(r=>[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)])(e.getBoundingClientRect())})));
  log('VISIBLE CONTROLS '+JSON.stringify(items));
  // try compare
  const c = page.locator('button:has-text("Compare")').first();
  log('compare visible? '+(await c.count()? await c.isVisible().catch(()=>false) : 'absent'));
  if (await c.count() && await c.isVisible().catch(()=>false)) {
    await c.click(); await page.waitForTimeout(1500); await shot('compare');
    const y = await page.evaluate(()=>{
      const st=window.BEA.store.getState();
      const all=[...document.querySelectorAll('body *')].filter(e=>!e.children.length).map(e=>e.textContent.trim()).filter(t=>/^(1[5-9]\d\d|20\d\d)$/.test(t));
      return {store:st.year, lede:(document.querySelector('.app__lede')||{innerText:''}).innerText.replace(/\n/g,'|').slice(0,80), years:[...new Set(all)]};
    });
    log('AFTER COMPARE '+JSON.stringify(y));
  }
};
