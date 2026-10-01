/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const st = async () => page.evaluate(()=>({proj:document.querySelector('.map').dataset.projection, def:document.querySelector('.map').dataset.definition, hash:location.hash}));
  const probe = async (sel, idx) => page.evaluate(([sel,idx])=>{
    const b=[...document.querySelectorAll(sel)][idx]; const r=b.getBoundingClientRect();
    const t=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
    return {x:r.x+r.width/2,y:r.y+r.height/2, top: t?(t.className||t.tagName):null, isSelfOrChild: !!(t && (t===b || b.contains(t)))};
  },[sel,idx]);
  for (const [sel,idx,name] of [['.map__def',1,'def-administered'],['.map__zoom',0,'zoom-in'],['.map__proj',0,'proj']]) {
    const p = await probe(sel, idx);
    log(name+' probe', JSON.stringify(p));
    await page.mouse.move(p.x, p.y);
    await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up();
    await page.waitForTimeout(900);
    log(name+' after real mouse click', JSON.stringify(await st()));
  }
  await shot('end');
  // and check that the same buttons respond to keyboard Enter when focused
  await page.evaluate(()=>[...document.querySelectorAll('.map__def')][1].focus());
  await page.keyboard.press('Enter'); await page.waitForTimeout(700);
  log('after focus+Enter on def tile', JSON.stringify(await st()));
};
