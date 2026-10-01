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
  await page.waitForTimeout(1500);
  const gate = async () => { await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^complicates it, fairly sure$/i.test((x.getAttribute('aria-label')||'').trim())); if(b)b.click();}); await page.waitForTimeout(800); };
  for (let i=2;i<=8;i++){
    await gate();
    const n = page.getByRole('button',{name:/^Next/i}).first();
    if (await n.isEnabled()) { await n.click(); } else { await gate(); await n.click(); }
    await page.waitForTimeout(1300);
  }
  log('step: ' + await page.evaluate(()=> (document.body.innerText.match(/\d+ \/ \d+/)||[''])[0]));
  await shot('b8');
  log('--- all visible controls with boxes + overflow ---');
  const c = await page.evaluate(() => {
    const out=[];
    document.querySelectorAll('button,a[href],input,select').forEach(e=>{
      if(!e.offsetParent) return; const r=e.getBoundingClientRect(); if(r.width<1) return;
      const clipped = r.x < -1 || r.right > innerWidth+1 || r.y < 0 || r.bottom > innerHeight+1;
      out.push(`${clipped?'CLIP ':'     '}${(e.getAttribute('aria-label')||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,55)} :: ${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    });
    return out;
  });
  c.forEach(x=>log(x));
  log('--- masthead children ---');
  log(await page.evaluate(()=>{const h=document.querySelector('header,[class*=masthead]'); if(!h)return '?'; const r=h.getBoundingClientRect(); return `header ${Math.round(r.width)}x${Math.round(r.height)} scrollW=${h.scrollWidth} clientW=${h.clientWidth}\n`+[...h.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()).map(e=>{const b=e.getBoundingClientRect(); return `  ${e.tagName}.${e.className} "${e.textContent.trim().slice(0,20)}" ${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}`;}).join('\n');}));
};
