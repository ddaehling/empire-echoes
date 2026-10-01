const L = ([r,g,b]) => { const f=c=>{c/=255; return c<=0.03928? c/12.92 : Math.pow((c+0.055)/1.055,2.4);}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=11&filter=stage:working,pressure:off');
  await page.waitForTimeout(2500);
  const rows = await page.evaluate(() => {
    const parse = s => (s.match(/[\d.]+/g)||[0,0,0]).slice(0,3).map(Number);
    const bgOf = el => { let e=el; while(e){ const c=getComputedStyle(e).backgroundColor; if(c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return parse(c); e=e.parentElement;} return [255,255,255]; };
    const out=[];
    const sel = ['.tr-bar *','.cx-lede','.cx-note','button','a','p','li','.tr-source__fhint','[class*="hint"]','[class*="note"]','[class*="meta"]','[class*="caption"]'];
    const seen=new Set();
    for (const s of sel) for (const el of document.querySelectorAll(s)) {
      if (!el.offsetParent) continue;
      const t=(el.innerText||'').trim(); if(!t||t.length>90) continue;
      if (el.children.length) continue;
      const cs=getComputedStyle(el);
      const key=t.slice(0,30)+cs.color; if(seen.has(key))continue; seen.add(key);
      out.push({t:t.slice(0,44), fg:parse(cs.color), bg:bgOf(el), size:parseFloat(cs.fontSize), w:cs.fontWeight});
    }
    return out;
  });
  const bad=[];
  for (const r of rows) { const l1=L(r.fg),l2=L(r.bg); const c=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
    const big = r.size>=24 || (r.size>=18.66 && +r.w>=700);
    const need = big?3:4.5;
    if (c < need) bad.push(r.t + '  ratio=' + c.toFixed(2) + ' need ' + need + ' size ' + r.size); }
  log('checked ' + rows.length + ' text nodes; failures: ' + bad.length);
  bad.slice(0,25).forEach(b=>log('  FAIL ' + b));
};
