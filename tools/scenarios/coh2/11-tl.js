module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2400);
  log(JSON.stringify(await page.evaluate(() => {
    const t = document.querySelector('[data-mount="timeline"]');
    const walk = (el, d) => {
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const rows = [{ d, c: (el.className||'').toString().slice(0,60), y: Math.round(b.y), h: Math.round(b.height), pad: cs.padding, mar: cs.margin }];
      if (d < 2) for (const k of el.children) rows.push(...walk(k, d+1));
      return rows;
    };
    return walk(t, 0);
  }), null, 0));
  log('FOOT', JSON.stringify(await page.evaluate(()=>{const f=document.querySelector('.app__foot,[data-mount="statusbar"]');const b=f?.getBoundingClientRect();return b?[Math.round(b.y),Math.round(b.height)]:null;})));
};
