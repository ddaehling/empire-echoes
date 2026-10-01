/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const r = await page.evaluate(() => {
    const b = document.querySelector('.tl-rate__ask');
    if (!b) return 'missing';
    const rc = b.getBoundingClientRect();
    const cx = rc.x+rc.width/2, cy = rc.y+rc.height/2;
    const top = document.elementFromPoint(cx,cy);
    return { text: b.innerText, hidden: b.hidden, rect: rc.toJSON(), topAtCentre: top? top.tagName+'.'+top.className : null };
  });
  log('ask button: '+JSON.stringify(r));
  // keyboard: tab until we reach it
  let found = -1;
  for (let i=0;i<120;i++){
    await page.keyboard.press('Tab');
    const cur = await page.evaluate(()=>{const a=document.activeElement; return (a?a.tagName+'.'+(typeof a.className==='string'?a.className:''):'')+' | '+(a&&a.innerText?a.innerText.slice(0,40).replace(/\n/g,' '):'');});
    if (/tl-rate__ask/.test(cur)) { found=i; log('reached ask by Tab at step '+i); break; }
    if (i<40) log(i+': '+cur);
  }
  if (found<0) log('NEVER reached ask button in 120 tabs');
  await shot('focus-state');
};
