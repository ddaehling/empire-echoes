/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.waitForTimeout(3000);
  // click the byline criticism link
  const b = await page.evaluate(()=>{const e=document.querySelector('.byline__crit'); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2, aria:e.getAttribute('aria-expanded'), tag:e.tagName};});
  log('CRIT LINK '+JSON.stringify(b));
  await page.mouse.click(b.x,b.y); await page.waitForTimeout(1200);
  await shot('01-crit-clicked');
  const after = await page.evaluate(()=>{
    const k=[...document.querySelectorAll('*')].find(e=>/^THREE THINGS WRONG/.test((e.innerText||'').trim()));
    const r=k?k.getBoundingClientRect():null;
    return {inView: r? (r.top>=0 && r.top<window.innerHeight) : false, top: r?Math.round(r.top):null, focus: document.activeElement ? document.activeElement.className+'|'+(document.activeElement.innerText||'').slice(0,40) : null};
  });
  log('AFTER CRIT '+JSON.stringify(after));
  // tab through
  const seq=[];
  for(let i=0;i<25;i++){ await page.keyboard.press('Tab'); const a=await page.evaluate(()=>{const e=document.activeElement; if(!e)return 'none'; const r=e.getBoundingClientRect(); return e.tagName+'|'+(e.className||'').toString().slice(0,32)+'|'+(e.innerText||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,38)+'|vis='+(r.width>0&&r.height>0&&r.top<window.innerHeight&&r.bottom>0);}); seq.push(a); }
  log('TAB SEQ:\n'+seq.join('\n'));
  await shot('02-tabbed');
  // escape to close
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  const closed = await page.evaluate(()=>!!document.querySelector('.lplate'));
  log('KEY STILL OPEN AFTER ESC: '+closed);
  log('ERR '+JSON.stringify(errs));
};
