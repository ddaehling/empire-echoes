/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  // 1 keyboard only: tab 40 times, record focus, check visible ring + no trap
  const seen = [];
  for (let i=0;i<45;i++){
    await page.keyboard.press('Tab');
    const f = await page.evaluate(()=>{const a=document.activeElement; if(!a) return null; const b=a.getBoundingClientRect(); const cs=getComputedStyle(a);
      return {tag:a.tagName, c:(a.className||'').toString().slice(0,30), lab:(a.innerText||a.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,40), w:Math.round(b.width),h:Math.round(b.height), onscreen: b.top>=-2&&b.bottom<=innerHeight+2&&b.left>=-2&&b.right<=innerWidth+2, outline: cs.outlineStyle+' '+cs.outlineWidth};});
    seen.push(f);
  }
  const off = seen.filter(x=>x&&!x.onscreen);
  log('TAB stops: '+seen.length+'  offscreen-focus: '+off.length);
  off.slice(0,6).forEach(o=>log('  OFFSCREEN '+JSON.stringify(o)));
  const noRing = seen.filter(x=>x && x.outline.startsWith('none'));
  log('no visible outline on: '+noRing.length+' '+JSON.stringify(noRing.slice(0,5).map(x=>x.c)));
  await shot('kbd');

  // 2 deep link restore + back
  await page.goto('http://localhost:8777/app/#year=1857&sel=bengal-presidency&tour=thirty&step=11', {waitUntil:'load'});
  await page.waitForTimeout(2000);
  log('deep hash: '+await page.evaluate(()=>location.hash));
  log('deep count: '+await page.locator('.tr-bar__count').innerText().catch(()=>'?'));
  await shot('deeplink');
  await page.goBack(); await page.waitForTimeout(1200);
  log('after back hash: '+await page.evaluate(()=>location.hash));
  await shot('afterback');

  // 3 rapid scrub
  await page.goto('http://localhost:8777/app/', {waitUntil:'load'});
  await page.waitForTimeout(2000);
  const plus = page.locator('button[aria-label="Forward one year"]');
  for (let i=0;i<60;i++) await plus.click({timeout:900}).catch(()=>{});
  await page.waitForTimeout(800);
  log('after scrub year: '+await page.evaluate(()=>location.hash));
  await shot('scrub');

  // 4 resize mid interaction
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(1200);
  await shot('resized-390');
  await page.setViewportSize({width:1440,height:900});
  await page.waitForTimeout(1200);
  await shot('resized-back');
  const over = await page.evaluate(()=>document.documentElement.scrollHeight-window.innerHeight);
  log('doc overflow after resize: '+over);
};
