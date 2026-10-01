/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1600);
  for (let k=0;k<4;k++){ await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(weakens) it, sure$/i.test((x.getAttribute('aria-label')||'').trim())&&!x.disabled); if(b)b.click();}); await page.waitForTimeout(500);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className)&&!x.disabled)[0]; if(b)b.click();}); await page.waitForTimeout(1400);}
  const before = await page.evaluate(()=>({hash:location.hash, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,260)}));
  log('BEFORE compare: ' + JSON.stringify(before));
  await shot('pre-compare');
  const opened = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Compare/i.test((x.getAttribute('aria-label')||x.textContent||''))&&x.offsetParent); if(b){b.click();return (b.getAttribute('aria-label')||b.textContent).trim();} return null;});
  log('opened via: ' + opened);
  await page.waitForTimeout(1800);
  await shot('compare');
  const after = await page.evaluate(()=>{
    const t=document.body.innerText;
    const years=[...t.matchAll(/\b1[5-9]\d\d\b|\b20[0-2]\d\b/g)].map(m=>m[0]);
    return { hash:location.hash, years:[...new Set(years)].slice(0,25), txt:t.replace(/\s+/g,' ').slice(0,900) };
  });
  log('AFTER compare: ' + JSON.stringify(after,null,1));
  log('--- errors ---'); errs.forEach(e=>log(e));
};
