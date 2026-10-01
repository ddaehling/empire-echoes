/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const path=require('path');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const out='/tmp/cp02r4-key'; require('fs').mkdirSync(out,{recursive:true});
  const b = await page.$('text=Open the full key');
  await b.click(); await page.waitForTimeout(1500);
  await page.screenshot({path: path.join(out,'full.png'), fullPage:false});
  await page.screenshot({path: path.join(out,'right.png'), clip:{x:700,y:380,width:740,height:520}});
  const overlap = await page.evaluate(()=>{
    const els=[...document.querySelectorAll('.tl-chg, .tl-rate__lbl, .tl-word, [class*="tl-"]')].slice(0,60);
    const boxes=els.map(e=>({c:e.className, r:e.getBoundingClientRect(), t:e.innerText.slice(0,30)})).filter(x=>x.r.width>0);
    const hits=[];
    for(let i=0;i<boxes.length;i++) for(let j=i+1;j<boxes.length;j++){
      const a=boxes[i].r,c=boxes[j].r;
      const ov = Math.max(0,Math.min(a.right,c.right)-Math.max(a.left,c.left))*Math.max(0,Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top));
      if(ov> 0.35*Math.min(a.width*a.height,c.width*c.height) && !boxes[i].c.includes(boxes[j].c) && !boxes[j].c.includes(boxes[i].c)) hits.push([boxes[i].c,boxes[j].c,Math.round(ov)]);
    }
    return hits.slice(0,15);
  });
  log('OVERLAPS:', JSON.stringify(overlap));
  const mapw = await page.evaluate(()=>{const m=document.querySelector('.map').getBoundingClientRect(); return {x:Math.round(m.x),w:Math.round(m.width),h:Math.round(m.height)};});
  log('MAP with key open:', JSON.stringify(mapw));
};
