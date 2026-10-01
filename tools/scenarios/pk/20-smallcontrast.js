module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1700);
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>/teaching desk|§/i.test(x.innerText||'')); if(b)b.click(); });
  await page.waitForTimeout(1500);
  log(JSON.stringify(await page.evaluate(() => {
    const lum = (c) => { const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);}); return 0.2126*r+0.7152*g+0.0722*b; };
    const bgOf = (e) => { let n=e; while(n){ const c=getComputedStyle(n).backgroundColor; if(c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; n=n.parentElement; } return 'rgb(255,255,255)'; };
    const ratio = (a,b)=>{const l1=lum(a),l2=lum(b);return +(((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2));};
    const out = {};
    for (const s of ['.tp-small__lead','.tp-small__why','.tp-small__h','.tp-small__where','.tp-small__addr code','.tp-small__w','.tp-small__lr']) {
      const e = document.querySelector(s); if(!e){ out[s]='absent'; continue; }
      const cs = getComputedStyle(e); out[s] = cs.fontSize + ' ' + ratio(cs.color, bgOf(e));
    }
    return out;
  })));
  await shot('small-dark');
};
