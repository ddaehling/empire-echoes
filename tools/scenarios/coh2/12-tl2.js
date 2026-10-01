module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2400);
  log(JSON.stringify(await page.evaluate(() => {
    const t = document.querySelector('.tl__body');
    const walk = (el, d) => {
      const b = el.getBoundingClientRect();
      const rows = [{ d, c: (el.className||'').toString().slice(0,50), y: Math.round(b.y), h: Math.round(b.height) }];
      if (d < 2) for (const k of el.children) rows.push(...walk(k, d+1));
      return rows;
    };
    return walk(t, 0);
  })));
};
