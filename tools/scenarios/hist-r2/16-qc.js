module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1919', { waitUntil:'load' });
  await page.waitForTimeout(3000);
  const attrs = await page.evaluate(() => {
    const p = document.querySelector('svg path[class*="unit"], svg path[data-id]');
    return p ? [...p.attributes].map(a=>a.name+'='+a.value.slice(0,40)) : 'none';
  });
  log('SAMPLE PATH ATTRS', JSON.stringify(attrs));
  const all = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll('svg [class]').forEach(e => { const c = e.getAttribute('class'); if (c && /unit|fill|shape|land/.test(c)) res.push(c); });
    return [...new Set(res)].slice(0,25);
  });
  log('CLASSES', JSON.stringify(all));
  const qc = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('svg *').forEach(e => {
      const s = JSON.stringify([...e.attributes].map(a=>a.name+'='+a.value));
      if (/quebec|qc-/i.test(s)) out.push({ tag: e.tagName, attrs: [...e.attributes].map(a=>a.name+'='+a.value.slice(0,50)), fill: getComputedStyle(e).fill });
    });
    return out.slice(0,10);
  });
  log('QUEBEC NODES', JSON.stringify(qc, null, 1));
};
