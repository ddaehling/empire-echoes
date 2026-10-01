/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9',{waitUntil:'load'});
  await page.waitForTimeout(2500);
  const before = await page.evaluate(()=>({year:window.BEA.store.getState().year, head:(document.querySelector('.cx-say')||{}).innerText, lede:(document.querySelector('.cx-lede,[class*=lede]')||{}).innerText}));
  log('BEFORE>>'+JSON.stringify(before));
  await shot('before');
  // open compare
  const opened = await page.evaluate(()=>{
    const b=document.querySelector('.cmp__launch'); if(b){ b.click(); return 'launch'; }
    const c=[...document.querySelectorAll('button')].filter(x=>/compare/i.test(x.getAttribute('aria-label')||x.textContent));
    if(c[0]){c[0].click(); return c[0].textContent.trim();} return null;
  });
  log('opened: '+opened);
  await page.waitForTimeout(1800);
  await shot('compare-open');
  const after = await page.evaluate(()=>{
    const st=window.BEA.store.getState();
    const texts=[...document.querySelectorAll('*')].filter(e=>e.children.length===0).map(e=>e.textContent.trim()).filter(t=>/^1[6-9]\d\d$|^20[0-2]\d$/.test(t));
    return {year:st.year, cmp:st.compareYear||st.compare, head:(document.querySelector('.cx-say')||{}).innerText,
      mast:(document.querySelector('.tr-bar')||{}).innerText, years:[...new Set(texts)].slice(0,20),
      lede:(document.querySelector('[class*=lede], .cx-mark')||{}).innerText};
  });
  log('AFTER>>'+JSON.stringify(after));
  // masthead control count in beats
  for (const s of [1,5,8,9,14,23]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s,{waitUntil:'load'});
    await page.waitForTimeout(1600);
    const n = await page.evaluate(()=>{
      const bar=document.querySelector('.app__mast, header, .mast');
      const els=[...document.querySelectorAll('.app__mast button,.app__mast a, header button, header a')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>2&&r.height>2;});
      return {n:els.length, labels: els.map(e=>(e.textContent||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,26))};
    });
    log('MAST step'+s+' n='+n.n+' :: '+JSON.stringify(n.labels));
  }
};
