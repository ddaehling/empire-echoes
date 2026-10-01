module.exports = async ({ page, log, shot }) => {
  const where = process.env.HOD_WHERE || '#tour=lesson-two&step=4';
  await page.goto(page.url().split('#')[0] + where, { waitUntil:'load' });
  await page.waitForTimeout(12000);
  const res = await page.evaluate(()=>{
    const parse=(s)=>{const m=s.match(/rgba?\(([^)]+)\)/); if(!m)return null; const p=m[1].split(',').map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};};
    const bgOf=(el)=>{let n=el; while(n&&n!==document.documentElement){const c=parse(getComputedStyle(n).backgroundColor); if(c&&c.a>0.5) return c; n=n.parentElement;} return null;};
    const out=[];
    for(const e of document.querySelectorAll('*')){
      const r=e.getBoundingClientRect(); if(r.width<4||r.height<4||r.bottom<0||r.top>innerHeight) continue;
      const t=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');
      if(t.length<2) continue;
      const cs=getComputedStyle(e); const fg=parse(cs.color); const bg=bgOf(e);
      if(!fg||!bg) continue;
      out.push({t:t.slice(0,45), fg:[fg.r,fg.g,fg.b], bg:[bg.r,bg.g,bg.b], size:parseFloat(cs.fontSize), weight:cs.fontWeight, cls:String(e.className).slice(0,30)});
    }
    return out;
  });
  const L=(c)=>{const s=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*s[0]+0.7152*s[1]+0.0722*s[2];};
  const bad=[];
  for(const r of res){const l1=L(r.fg),l2=L(r.bg);const ratio=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
    const large=r.size>=24||(r.size>=18.66&&+r.weight>=700); const need=large?3:4.5;
    if(ratio<need) bad.push({t:r.t,ratio:+ratio.toFixed(2),need,size:r.size,cls:r.cls,fg:r.fg,bg:r.bg});}
  log('WHERE '+where+' checked '+res.length+' below AA: '+bad.length);
  bad.slice(0,25).forEach(b=>log('  '+JSON.stringify(b)));
  await shot('c2');
};
