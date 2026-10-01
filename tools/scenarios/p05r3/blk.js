module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '#tour=core&step=6'; });
  await page.waitForTimeout(2600);
  await page.evaluate(() => { const t = document.querySelector('.cl-blk__toggle'); if (t) t.click(); });
  await page.waitForTimeout(700);
  const d = await page.evaluate(() => {
    const t = document.querySelector('.cl-blk__toggle');
    const head = document.querySelector('.cl-blk__full .cl-blk__count');
    const box = document.querySelector('.cl-blk');
    const r = box ? box.getBoundingClientRect() : null;
    return { title: t && t.title, aria: t && t.getAttribute('aria-label'), head: head && head.textContent,
      blk: r ? { h: Math.round(r.height), w: Math.round(r.width), b: Math.round(r.bottom) } : null,
      vw: innerWidth, vh: innerHeight,
      overflow: head ? (head.scrollWidth > head.clientWidth + 1) : null };
  });
  log(JSON.stringify(d, null, 1));
  await shot('blk');
};
