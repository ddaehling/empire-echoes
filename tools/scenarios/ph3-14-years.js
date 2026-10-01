/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1600);
  for (let i=1;i<=15;i++){
    const r = await page.evaluate(()=>{
      const eyeb = document.querySelector('.tr-beat__eyebrow,[class*=eyebrow]');
      const yearEl = document.querySelector('.tl__year,[class*=tl__year],[class*=year-big]');
      const dossierYear = document.querySelector('[class*=ds__year],[class*=dossier] [class*=year]');
      const hash = location.hash;
      return { step:(document.body.innerText.match(/\d+ \/ \d+/)||[''])[0],
        eyebrow: eyeb?eyeb.textContent.trim():'-',
        year: yearEl?yearEl.textContent.trim():'-',
        dossier: dossierYear?dossierYear.textContent.trim():'-',
        hashYear:(hash.match(/year=(\d+)/)||[])[1] };
    });
    log(JSON.stringify(r));
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(weakens) it, sure$/i.test((x.getAttribute('aria-label')||'').trim())&&!x.disabled); if(b)b.click();});
    await page.waitForTimeout(400);
    const ok = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className)&&!x.disabled)[0]; if(b){b.click();return true;} return false;});
    if(!ok){ log('blocked at '+i); 
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Show me what they wrote|rather read this atlas|rather not/i.test(x.textContent)&&!x.disabled); if(b)b.click();});
      await page.waitForTimeout(600);
      const grp = await page.evaluate(()=>{const bs=[...document.querySelectorAll('[class*=tension] button')].filter(b=>!b.disabled&&!/Show me/.test(b.textContent)); bs.forEach((b,ix)=>{ if(ix%3===0) b.click(); }); return bs.length;});
      await page.waitForTimeout(500);
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Show me what they wrote/i.test(x.textContent)&&!x.disabled); if(b)b.click();});
      await page.waitForTimeout(900);
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className)&&!x.disabled)[0]; if(b)b.click();});
    }
    await page.waitForTimeout(1400);
  }
};
