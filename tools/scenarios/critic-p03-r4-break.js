/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = []; page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type()==='error') errs.push('CONSOLE ' + m.text()); });
  await page.waitForTimeout(3000);
  // invalid years
  for (const h of ['#year=99999','#year=-500','#year=abc','#year=1765.7','#year=','#year=1200&filter=def:nonsense']) {
    await page.evaluate(x => { location.hash = x; }, h);
    await page.waitForTimeout(400);
    log(h + ' -> ' + await page.evaluate(()=>location.hash + ' | ' + (document.querySelector('.tl__year, .tl-head')?.innerText||document.body.innerText.match(/\n(1\d{3}|2\d{3})\n/)?.[1]||'?')));
  }
  await shot('after-bad-hashes');
  // key mash
  await page.evaluate(()=>{ location.hash='#year=1800'; });
  await page.waitForTimeout(500);
  await page.evaluate(()=>document.querySelector('.tl-ax__rail').focus());
  for (let i=0;i<60;i++){ await page.keyboard.press(['ArrowRight','ArrowLeft','Shift+ArrowRight','Alt+ArrowLeft','Home','End','Space'][i%7]); }
  await page.waitForTimeout(1500);
  log('after mash:', await page.evaluate(()=>location.hash));
  await shot('after-mash');
  // play then resize
  await page.evaluate(()=>{ location.hash='#year=1900'; });
  await page.click('.tl-btn--play');
  await page.setViewportSize({ width: 320, height: 700 });
  await page.waitForTimeout(1500);
  await shot('narrow-playing');
  const g = await page.evaluate(()=>{ const t=document.querySelector('.tl__track'); const b=document.body; return { bodyScrollW: b.scrollWidth, innerW: innerWidth, trackW: t?.clientWidth, spine: document.querySelector('.tl-spine')?.getBoundingClientRect().width }; });
  log('320px:', JSON.stringify(g));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(1200);
  log('errors:', JSON.stringify(errs));
};
