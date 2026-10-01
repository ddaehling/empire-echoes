module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=12', { waitUntil:'load' });
  await page.waitForTimeout(3200);
  const d = await page.evaluate(() => {
    const p = document.querySelector('.tr-panel');
    const walk = (el, depth) => { if (!el||depth>7) return ''; let s='';
      for (const c of el.children) { const t=c.tagName.toLowerCase();
        s += '  '.repeat(depth)+t+'.'+(c.className||'').toString().slice(0,60)+((t==='button'||t==='input')?(' ["'+(c.innerText||c.value||'').trim().slice(0,45)+'" dis='+c.disabled+']'):'')+'\n';
        s += walk(c,depth+1);} return s; };
    return p ? walk(p,0).slice(0,4000) : 'NO';
  });
  log(d);
  log('TEXT: '+(await page.evaluate(()=>document.querySelector('.tr-panel').innerText.replace(/\s+/g,' ').slice(0,1500))));
};
