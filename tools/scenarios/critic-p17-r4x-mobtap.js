/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  const info = await page.evaluate(() => {
    const b = document.querySelector('.legend__open');
    const r = b.getBoundingClientRect();
    const cx = r.x + r.width/2, cy = r.y + r.height/2;
    const top = document.elementFromPoint(cx, cy);
    const chain = []; let e = top; while(e && chain.length<5){ chain.push(e.tagName+'.'+(e.className||'')); e=e.parentElement; }
    return { rect:{x:r.x,y:r.y,w:r.width,h:r.height}, topEl: chain,
      hitsSelf: !!(top && (top===b || b.contains(top))),
      viewport: [innerWidth, innerHeight] };
  });
  log('OPEN BUTTON: ' + JSON.stringify(info, null, 1));
  // try tap anyway
  try { await page.locator('.legend__open').first().tap({ timeout: 4000 }); log('tap OK'); }
  catch(e){ log('tap FAILED: ' + e.message.slice(0,200)); }
  await page.waitForTimeout(900);
  await shot('after-tap');
  const leg = await page.evaluate(()=>{const l=document.querySelector('.legend');return l&&l.innerText;});
  log('LEGEND NOW: ' + leg);
  const ov = await page.evaluate(()=>{const o=document.querySelector('.app__overlay'); return o? o.innerText.slice(0,300):'(none)';});
  log('OVERLAY: ' + ov);
  // three things wrong link
  try { await page.locator('.byline__crit').first().tap({timeout:4000}); log('crit tap OK'); }
  catch(e){ log('crit tap FAILED: ' + e.message.slice(0,160)); }
  await page.waitForTimeout(1200);
  await shot('after-crit');
  const ov2 = await page.evaluate(()=>{const o=document.querySelector('.app__overlay'); return o? o.innerText.slice(0,1500):'(none)';});
  log('OVERLAY2: ' + ov2);
};
