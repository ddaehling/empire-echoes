/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.click('.cx-cta');
  await page.waitForTimeout(1200);
  for (let i=0;i<5;i++){ await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled)n.click();}); await page.waitForTimeout(700); }
  const probe = async(tag)=>{
    const r = await page.evaluate(()=>{
      const out=[];
      document.querySelectorAll('*').forEach(e=>{
        if (!/It started as/.test(e.textContent||'')) return;
        if ([...e.children].some(c=>/It started as/.test(c.textContent||''))) return;
        const b=e.getBoundingClientRect(); const cs=getComputedStyle(e);
        out.push({cls:(e.className||'').toString().slice(0,50), tag:e.tagName, rect:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)], disp:cs.display, txt:e.innerText.replace(/\s+/g,' ').slice(0,240)});
      });
      return {out, foot: document.getElementById('app')?.dataset.foot, dock: document.getElementById('app')?.dataset.dock};
    });
    log(tag+' foot='+r.foot+' dock='+r.dock);
    r.out.forEach(o=>log('  '+JSON.stringify(o)));
  };
  await probe('BEAT6');
  await shot('beat6');
  // scroll the beat panel to the bottom
  await page.evaluate(()=>{
    const sc=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+40 && e.clientHeight>100);
    sc.forEach(e=>e.scrollTop=e.scrollHeight);
  });
  await page.waitForTimeout(600);
  await shot('beat6-scrolled');
  await probe('BEAT6-SCROLLED');
};
