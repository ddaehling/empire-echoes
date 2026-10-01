/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: exits 1.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
  await page.waitForTimeout(800);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(900);
  const t0=Date.now(); let clicks=0; let blocked=[];
  for (let i=1;i<=40;i++){
    const nxt = page.locator('.tr-bar__next').first();
    if (!await nxt.count()) { log('no .tr-bar__next at '+i); break; }
    const dis = await nxt.isDisabled().catch(()=>true);
    const label = (await nxt.textContent().catch(()=>''))||'';
    const step = await page.evaluate(()=>{const e=document.querySelector('.cx-transport__count,.cl-count'); return e?e.textContent.trim().replace(/\s+/g,' '):'?';});
    log(i+' step='+step+' nextLabel='+JSON.stringify(label.trim().replace(/\s+/g,' '))+' disabled='+dis);
    if (dis) { blocked.push(i);
      // satisfy the minimum: a gate cell
      if (await page.locator('.tr-field__cell').count()) { await page.locator('.tr-field__cell').nth(4).click().catch(()=>{}); await page.waitForTimeout(400); }
      else { const b = await page.evaluate(()=>[...document.querySelectorAll('.tr-panel__scroll button')].filter(x=>!x.disabled).slice(0,6).map(x=>(x.textContent||'').trim().slice(0,40))); log('   need: '+JSON.stringify(b)); break; }
    }
    const d2 = await nxt.isDisabled().catch(()=>true);
    if (d2) { log('STILL BLOCKED at '+i); break; }
    await nxt.click().catch(()=>{}); clicks++;
    await page.waitForTimeout(500);
    if (await page.locator('.cl-close, .close__page, [data-close]').count()) { /* maybe */ }
  }
  log('CLICK-THROUGH SECONDS='+Math.round((Date.now()-t0)/1000)+' clicks='+clicks+' blockedAt='+JSON.stringify(blocked));
  await shot('end');
  log('END TEXT '+(await page.evaluate(()=>document.body.innerText)).slice(0,900));
};
