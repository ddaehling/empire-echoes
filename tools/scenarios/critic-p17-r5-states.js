/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  const byline = async (tag) => {
    const r = await page.evaluate(() => {
      const el = document.querySelector('[class*="byline"]');
      if(!el) return {present:false};
      const b=el.getBoundingClientRect();
      const cs=getComputedStyle(el);
      return {present:true, text:el.innerText.replace(/\s+/g,' ').slice(0,260), x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height), vis:cs.visibility, disp:cs.display, op:cs.opacity};
    });
    log(tag+' :: '+JSON.stringify(r));
  };
  const go = async (hash, tag, wait=2500) => {
    await page.evaluate(h=>{location.hash=h;}, hash);
    await page.waitForTimeout(wait);
    await byline(tag);
    await shot(tag);
  };
  await page.waitForTimeout(3000);
  await byline('default');
  await go('#year=1913&compare=1857','compare');
  await go('#year=1913&panel=evidence','evidence-panel');
  await go('#panel=close','close');
  await go('#tour=atlantic','tour');
  await go('#year=1913&sel=bengal','selected');
  log('ERR '+JSON.stringify(errs));
};
