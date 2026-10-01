module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.click('.cx-cta'); await page.waitForTimeout(1200);
  for (let i=1;i<=9;i++){ await page.evaluate(()=>{const n=document.querySelector('.tr-panel__next');if(n&&!n.disabled)n.click();else{const c=document.querySelector('.tr-field__cell');if(c)c.click();}}); await page.waitForTimeout(800); }
  await page.waitForTimeout(1500);
  const d = await page.evaluate(()=>{
    const p = document.querySelector('.qz') || document.querySelector('.tr-panel');
    const walk=(el,d)=>{if(!el||d>7)return '';let s='';for(const c of el.children){const t=c.tagName.toLowerCase();
      s+='  '.repeat(d)+t+'.'+(c.className||'').toString().slice(0,55)+((t==='button'||t==='input'||t==='label')?(' ["'+(c.innerText||c.value||'').trim().slice(0,40)+'" dis='+c.disabled+' type='+(c.type||'')+']'):'')+'\n';
      s+=walk(c,d+1);} return s;};
    return (p?p.className+'\n'+walk(p,0):'NONE').slice(0,4000);
  });
  log(d);
  log('HASH '+await page.evaluate(()=>location.hash));
};
