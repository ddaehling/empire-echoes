/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(1000);
  const recs = [];
  for (let i = 0; i < 40; i++) {
    const st = await page.evaluate(() => {
      const c = document.querySelector('.tr-bar__count');
      const panel = document.querySelector('.tr-panel');
      return {
        count: c ? c.innerText.replace(/\s+/g,' ') : '',
        hash: location.hash,
        panel: panel ? panel.innerText : '',
      };
    });
    const words = st.panel.split(/\s+/).filter(Boolean).length;
    recs.push({ n: st.count, hash: st.hash.slice(0,80), words, head: st.panel.split('\n').filter(x=>x.trim()).slice(0,3).join(' | ').slice(0,150) });
    // resolve gates
    for (let k=0;k<4;k++){
      const next = page.locator('.tr-bar__next');
      if (!(await next.isDisabled().catch(()=>true))) break;
      const cands = ['.tr-field__cell', '.dsr__choice', '.tr-gate__decline', '.qz-choice', '[class*="choice"]', '[class*="cell"]'];
      let clicked=false;
      for (const c of cands){ const l = page.locator(c).first(); if (await l.count() && await l.isVisible().catch(()=>false)) { await l.click({timeout:1500}).catch(()=>{}); clicked=true; break; } }
      await page.waitForTimeout(400);
      if(!clicked) break;
    }
    const next = page.locator('.tr-bar__next');
    if (await next.isDisabled().catch(()=>true)) { log('STUCK at', st.count, st.hash); await shot('stuck'); break; }
    await next.click({timeout:3000}).catch(e=>log('clickfail',e.message));
    await page.waitForTimeout(450);
    const done = await page.evaluate(()=>!!document.querySelector('.close, .cl-, [class*="close__"]') && /Finish|argument/i.test(document.body.innerText));
  }
  log('TOTALWORDS', recs.reduce((a,b)=>a+b.words,0));
  recs.forEach(r=>log(r.n+' | '+r.words+'w | '+r.head));
};
