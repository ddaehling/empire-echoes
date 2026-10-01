function lum(c){const s=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*s[0]+0.7152*s[1]+0.0722*s[2];}
module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(9000);
  const res = await page.evaluate(()=>{
    const parse=(s)=>{const m=s.match(/rgba?\(([^)]+)\)/); if(!m)return null; const p=m[1].split(',').map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};};
    const bgOf=(el)=>{let n=el; while(n&&n!==document.documentElement){const c=parse(getComputedStyle(n).backgroundColor); if(c&&c.a>0.5) return c; n=n.parentElement;} return {r:255,g:255,b:255,a:1};};
    const out=[];
    const els=[...document.querySelectorAll('p,li,span,button,a,h1,h2,h3,h4,div')].filter(e=>{
      const r=e.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      if(r.bottom<0||r.top>innerHeight) return false;
      const t=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');
      return t.length>1;
    });
    for(const e of els.slice(0,400)){
      const cs=getComputedStyle(e); const fg=parse(cs.color); const bg=bgOf(e);
      if(!fg) continue;
      out.push({t:e.textContent.trim().replace(/\s+/g,' ').slice(0,40), fg:[fg.r,fg.g,fg.b], bg:[bg.r,bg.g,bg.b], size:parseFloat(cs.fontSize), weight:cs.fontWeight});
    }
    return out;
  });
  const L=(c)=>{const s=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*s[0]+0.7152*s[1]+0.0722*s[2];};
  const bad=[];
  for(const r of res){
    const l1=L(r.fg), l2=L(r.bg);
    const ratio=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
    const large = r.size>=24 || (r.size>=18.66 && +r.weight>=700);
    const need = large?3:4.5;
    if(ratio < need) bad.push({t:r.t, ratio:+ratio.toFixed(2), need, size:r.size, fg:r.fg, bg:r.bg});
  }
  log('checked '+res.length+' text nodes; below AA: '+bad.length);
  bad.slice(0,30).forEach(b=>log('  '+JSON.stringify(b)));
  await shot('theme');
};
