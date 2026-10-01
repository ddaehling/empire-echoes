/** Bisect: remove each child of .mx-cp and see which one owns the doc growth. */
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
    const base = de.scrollHeight - innerHeight;
    const cp = document.querySelector('.mx-cp');
    const rows = [];
    for (const child of [...cp.children]) {
      const keep = child.style.display;
      child.style.display = 'none';
      void de.offsetHeight;
      rows.push({ cls: (child.className || child.tagName).toString().slice(0, 40), over: de.scrollHeight - innerHeight });
      child.style.display = keep;
    }
    void de.offsetHeight;
    const whole = (() => { cp.style.display = 'none'; void de.offsetHeight; const v = de.scrollHeight - innerHeight; cp.style.display = ''; return v; })();
    return { base, whole, rows };
  });
  log(JSON.stringify(r, null, 1));
};
