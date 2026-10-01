module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1700);
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>/teaching desk|§/i.test(x.innerText||'')); if(b)b.click(); });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const t=[...document.querySelectorAll('[role="tab"]')].find(x=>/classroom/i.test(x.innerText)); if(t)t.click(); });
  await page.waitForTimeout(1200);
  log(JSON.stringify(await page.evaluate(() => {
    const lum = (c) => { const [r,g,b]=c.match(/\d+/g).map(Number).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);}); return 0.2126*r+0.7152*g+0.0722*b; };
    const bgOf = (e) => { let n=e; while(n){ const c=getComputedStyle(n).backgroundColor; if(c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; n=n.parentElement; } return 'rgb(255,255,255)'; };
    const ratio = (a,b)=>{const l1=lum(a),l2=lum(b);return +(((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2));};
    const page = document.querySelector('#tp-page-classroom') || document;
    const out = {};
    for (const s of ['.tp-unit__n','.tp-unit__t','.tp-unit__r','.tp-lesson__oth','.tp-unit__why','.tp-moves__w']) {
      const e = page.querySelector(s); if(!e){ out[s]='absent'; continue; }
      const cs = getComputedStyle(e);
      out[s] = { fs: cs.fontSize, weight: cs.fontWeight, ratio: ratio(cs.color, bgOf(e)) };
    }
    const j = page.querySelector('.tp-jump');
    out.jump = j ? { w: Math.round(j.getBoundingClientRect().width), items: j.children.length } : null;
    return out;
  }), null, 1));
};
