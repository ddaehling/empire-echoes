/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(700);
  await page.locator('button:has-text("Start the lesson"), a:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(900);

  const snap = async () => await page.evaluate(() => {
    const R = e => { const b=e.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; };
    const q = s => { const e=document.querySelector(s); return e?R(e):null; };
    const map = q('.map__frame')||q('.stage__map');
    const scr=[];
    document.querySelectorAll('*').forEach(e=>{
      const cs=getComputedStyle(e);
      if ((cs.overflowY==='auto'||cs.overflowY==='scroll') && e.scrollHeight>e.clientHeight+8 && e.clientHeight>40)
        scr.push({cls:(e.className||'').toString().slice(0,44), ch:e.clientHeight, sh:e.scrollHeight, y:Math.round(e.getBoundingClientRect().y)});
    });
    const step = (document.querySelector('.cx-transport__count,.cl-count')||{}).textContent||'';
    // year printed in lede vs time vs dossier
    const yrs=[...document.querySelectorAll('body *')].filter(e=>!e.children.length&&/^\s*1[5-9]\d\d|20\d\d\s*$/.test(e.textContent||'')).map(e=>e.textContent.trim());
    return { map, scrollers: scr, step,
      overflowX: document.documentElement.scrollWidth>innerWidth,
      docScroll: document.documentElement.scrollHeight>innerHeight,
      text: document.body.innerText.replace(/\n{2,}/g,'\n') };
  });

  const advance = async (i) => {
    // primary: the panel-foot next
    const tryClick = async (sel) => {
      const l = page.locator(sel).first();
      if (await l.count() === 0) return false;
      if (!(await l.isVisible().catch(()=>false))) return false;
      if (await l.isDisabled().catch(()=>false)) return false;
      await l.click({timeout:4000}).catch(()=>{});
      return true;
    };
    // satisfy gate if present
    if (await page.locator('.tr-field__cell').count()) {
      log('  gate at step '+i+': clicking a field cell');
      await page.locator('.tr-field__cell').nth(4).click({timeout:4000}).catch(e=>log('  cell click fail '+e.message));
      await page.waitForTimeout(500);
    }
    // beat-level asks: predict/choice/sort/loop/tension
    const asks = ['.tr-choice','.tr-order__btn','.tr-loop__next','.tr-go'];
    for (const a of asks) {
      const n = await page.locator(a).count();
      if (n) { log('  ask '+a+' x'+n); }
    }
    if (await page.locator('.tr-choice').count()) {
      await page.locator('.tr-choice').first().click({timeout:3000}).catch(()=>{});
      await page.waitForTimeout(500);
    }
    if (await tryClick('.tr-bar__next')) return true;
    if (await tryClick('button:has-text("Next")')) return true;
    if (await tryClick('.cx-transport button:not([disabled]):last-of-type')) return true;
    return false;
  };

  for (let i=1;i<=30;i++){
    const s = await snap();
    log('=== STEP '+i+' step-label:'+JSON.stringify(s.step));
    log('   map '+JSON.stringify(s.map)+'  overflowX:'+s.overflowX+'  docScroll:'+s.docScroll);
    log('   scrollers '+JSON.stringify(s.scrollers));
    log('   TEXT >>>'+s.text.slice(0,1600)+'<<<');
    await shot('s'+String(i).padStart(2,'0'));
    const ok = await advance(i);
    if (!ok) { log('CANNOT ADVANCE at step '+i); 
      // dump buttons
      const b = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent).map(x=>({t:(x.textContent||'').trim().replace(/\s+/g,' ').slice(0,40),d:x.disabled,c:(x.className||'').toString().slice(0,40)})));
      log('BUTTONS '+JSON.stringify(b));
      break; }
    await page.waitForTimeout(850);
  }
  await shot('final');
};
