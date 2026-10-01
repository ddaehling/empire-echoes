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
  for(let k=0;k<7;k++){ await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(weakens) it, sure$/i.test((x.getAttribute('aria-label')||'').trim())&&!x.disabled); if(b)b.click();}); await page.waitForTimeout(350);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className)&&!x.disabled)[0]; if(b)b.click();}); await page.waitForTimeout(1200);}
  log(await page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('button').forEach(b=>{ if(!b.offsetParent) return;
      const name=(b.getAttribute('aria-label')||b.textContent||'').trim();
      if(!name) out.push(`class=${b.className} title=${b.title} html=${b.outerHTML.slice(0,220)}`);
    });
    return out.join('\n---\n');
  }));
};
