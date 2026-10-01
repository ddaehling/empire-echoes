const IDS = (process.env.HIDS||'').split(',').filter(Boolean);
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#sel=' + IDS[0], { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const cls = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(e=>/HOW IT WAS/i.test(e.textContent||'')).slice(-3).map(e=>e.tagName+'.'+e.className));
  log('candidates: ' + JSON.stringify(cls));
  for (const id of IDS) {
    await page.evaluate((i)=>{ location.hash = '#sel=' + i; }, id);
    await page.waitForTimeout(1500);
    const t = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('div,section,aside'));
      const c = nodes.filter(n => /HOW IT WAS|HOW IT ENDED|LEGAL STATUS/i.test(n.innerText||''));
      c.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
      return c.length ? c[c.length-1].innerText : document.body.innerText;
    });
    log('\n\n############ ' + id + ' ############\n' + t.slice(0, 3000));
  }
};
