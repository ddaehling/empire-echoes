/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const step = process.env.STEP || '9';
  await page.goto('http://localhost:8777/app/#tour=thirty&step='+step, {waitUntil:'load'});
  await page.waitForTimeout(2500);
  const m = await page.evaluate(() => {
    const out = {};
    ['.cl-bar','.cl-say','.cl-block','[class^="cl-"]'].forEach(s=>{
      const e=document.querySelector(s); if(!e){out[s]='none';return;}
      const b=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      out[s]={hidden:e.hidden, disp:cs.display, x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height), text:(e.innerText||'').replace(/\s+/g,' ').slice(0,300)};
    });
    out.all = [...document.querySelectorAll('[class*="cl-say"],[class*="cl-block"],[class*="cl-bar"]')].map(e=>({c:e.className, vis: !!e.offsetParent, t:(e.innerText||'').replace(/\s+/g,' ').slice(0,200)})).slice(0,10);
    return out;
  });
  log(JSON.stringify(m,null,1));
};
