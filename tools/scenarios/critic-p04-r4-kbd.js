/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const { fixGrid } = require('./critic-p04-r4-lib.js');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '#year=1840&sel=new-zealand'; });
  await page.waitForTimeout(1600); await fixGrid(page, log);
  await shot('nz-1840');
  const t = await page.evaluate(()=>document.querySelector('#dossier').innerText);
  const i = t.search(/waitangi/i);
  log('NZ waitangi context:', i<0?'NONE':t.slice(Math.max(0,i-500), i+2200).replace(/\n+/g,' | '));
  // keyboard walk
  await page.evaluate(()=>{document.querySelector('#dossier').querySelector('button,a[href]').focus();});
  const seen=[];
  for (let k=0;k<14;k++){ await page.keyboard.press('Tab'); const f=await page.evaluate(()=>{const e=document.activeElement;return (e.tagName+':'+(e.textContent||'').trim().slice(0,34)+' :: outline='+getComputedStyle(e).outlineWidth+' '+getComputedStyle(e).outlineColor);}); seen.push(f); }
  log('tab walk:', JSON.stringify(seen,null,1));
  await shot('focus-ring');
  // print stylesheet present?
  const p = await page.evaluate(()=>{
    let n=0; for (const s of document.styleSheets){ try{ for (const r of s.cssRules){ if (r.media && /print/.test(r.conditionText||r.media.mediaText)) n++; } }catch(e){} }
    return n;
  });
  log('print @media rules found:', p);
};
