module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=13', { waitUntil:'load' });
  await page.waitForTimeout(3500);
  const d = await page.evaluate(() => {
    const p = document.querySelector('.tr-panel');
    const walk = (el, depth) => {
      if (!el || depth > 6) return '';
      let s='';
      for (const c of el.children) {
        s += '  '.repeat(depth) + c.tagName.toLowerCase() + '.' + (c.className||'').toString().slice(0,70) + (c.tagName==='BUTTON'?(' ["'+c.innerText.trim().slice(0,40)+'" dis='+c.disabled+']'):'') + '\n';
        s += walk(c, depth+1);
      }
      return s;
    };
    return p ? walk(p,0).slice(0,6000) : 'NO PANEL';
  });
  log(d);
};
