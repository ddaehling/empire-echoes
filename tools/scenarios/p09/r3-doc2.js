/** Which node makes documentElement.scrollHeight grow when the sides open? */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.mechanism, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.mechanism.open({}));
  await page.waitForTimeout(500);
  await page.evaluate(() => { const b = document.querySelector('.mx-ch'); if (b) b.click(); });
  await page.waitForTimeout(400);
  await page.evaluate(() => { const b = document.querySelector('.mx-pp .mx-ch'); if (b) b.click(); });
  await page.waitForTimeout(400);
  await page.evaluate(() => { const b = document.querySelector('.mx-cp .mx-ch'); if (b) b.click(); });
  await page.waitForTimeout(600);

  const r = await page.evaluate(() => {
    const de = document.documentElement;
    const out = { docOver: de.scrollHeight - innerHeight, offenders: [] };
    for (const n of document.querySelectorAll('body *')) {
      const b = n.getBoundingClientRect();
      const bottom = b.top + b.height + (window.scrollY || 0);
      if (bottom > innerHeight + 4 && b.height > 0) {
        const cs = getComputedStyle(n);
        out.offenders.push({
          cls: (n.className && n.className.toString().slice(0, 40)) || n.tagName,
          top: Math.round(b.top), h: Math.round(b.height),
          pos: cs.position, ov: cs.overflow,
          inSheet: !!n.closest('.cx-sheet__body'),
        });
      }
    }
    out.offenders = out.offenders.filter((o) => !o.inSheet).slice(0, 12);
    out.htmlOv = getComputedStyle(de).overflow;
    out.bodyOv = getComputedStyle(document.body).overflow;
    out.appH = Math.round(document.getElementById('app').getBoundingClientRect().height);
    return out;
  });
  log(JSON.stringify(r, null, 1));
};
