module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2200);
  const d = await page.evaluate(() => {
    const D = window.BEA.data;
    return { n: D.territories.length, ids: D.territories.slice(0,40).map(t=>t.id), bounds: D.bounds,
      hasBengal: !!D.get('bengal'), search: D.search('bengal',{limit:5}).map(r=>r.id) };
  });
  log(JSON.stringify(d, null, 1));
};
