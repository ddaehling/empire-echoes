module.exports = async ({ page, shot, log }) => {
  const steps = [1,6,7,14];
  for (const s of steps) {
    await page.goto('http://localhost:8777/app/#tour=core&step='+s, { waitUntil:'load' });
    await page.waitForTimeout(3200);
    const d = await page.evaluate(() => {
      const p = document.querySelector('.tr-panel');
      const walk = (el, depth) => {
        if (!el || depth > 7) return '';
        let s='';
        for (const c of el.children) {
          const tag=c.tagName.toLowerCase();
          const lbl = (tag==='button'||tag==='input')?(' ["'+(c.innerText||c.value||c.placeholder||'').trim().slice(0,45)+'" dis='+(c.disabled)+' type='+(c.type||'')+']'):'';
          s += '  '.repeat(depth) + tag + '.' + (c.className||'').toString().slice(0,60) + lbl + '\n';
          s += walk(c, depth+1);
        }
        return s;
      };
      return p ? walk(p,0).slice(0,5000) : 'NO PANEL';
    });
    log('===== STEP '+s+' =====\n'+d);
  }
};
