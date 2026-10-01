const IDS = (process.env.HIDS||'').split(',').filter(Boolean);
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#sel=' + IDS[0], { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  for (const id of IDS) {
    await page.evaluate((i)=>{ location.hash = '#sel=' + i; }, id);
    await page.waitForTimeout(1200);
    const t = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('div,section,aside'));
      const c = nodes.filter(n => /HOW IT WAS|HOW IT ENDED|LEGAL STATUS/i.test(n.innerText||''));
      c.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
      const txt = c.length ? c[c.length-1].innerText : document.body.innerText;
      // keep only the block from LEGAL STATUS to THINK,
      const i0 = txt.search(/LEGAL STATUS|Britain held nothing/);
      const i1 = txt.search(/THINK, BEFORE|WHAT THIS ENTRY|\d+ TEXTS? WRITTEN/);
      return txt.slice(i0 < 0 ? 0 : i0, i1 < 0 ? i0 + 2000 : i1);
    });
    log('\n######## ' + id + ' ########\n' + t.slice(0, 1800));
  }
};
