/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&def=claimed', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  const measure = () => page.evaluate(() => {
    const plate = document.querySelector('.map__plate').getBoundingClientRect();
    // sample grid over plate; count points where topmost element is NOT map layer
    let cov=0, tot=0; const who={};
    for(let x=plate.x+3;x<plate.right-3;x+=6) for(let y=plate.y+3;y<plate.bottom-3;y+=6){
      tot++;
      const t=document.elementFromPoint(x,y);
      if(!t) continue;
      if(t.closest('.map')) continue;
      cov++; const k=(t.className&&t.className.baseVal!==undefined?t.className.baseVal:t.className)||t.tagName; who[k]=(who[k]||0)+1;
    }
    const ts=[...document.querySelectorAll('.map__target')];
    let hidden=0; const hid=[];
    for(const el of ts){const r=el.getBoundingClientRect(); const cx=r.x+r.width/2, cy=r.y+r.height/2; const t=document.elementFromPoint(cx,cy); if(t&&!t.closest('.map')){hidden++; hid.push(el.dataset.unit);} }
    return {plate:{w:Math.round(plate.width),h:Math.round(plate.height)}, vw:innerWidth, vh:innerHeight, pctCovered: Math.round(100*cov/tot), who, hiddenTargets:hidden, ofTotal:ts.length, hid: hid.slice(0,30)};
  });
  log('DEFAULT:', JSON.stringify(await measure(), null, 1));
  await page.keyboard.press('e'); await page.waitForTimeout(1400);
  await shot('enlarged');
  log('ENLARGED:', JSON.stringify(await measure(), null, 1));
};
