module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2600);
  log('MOUNTS', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-mount]')].map(e => ({ m: e.dataset.mount, cls: e.className, kids: e.children.length, h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width), empty: !e.innerText.trim() })))));
  log('MAP SVG', JSON.stringify(await page.evaluate(() => {
    const svg = document.querySelector('[data-mount="map"] svg');
    if (!svg) return 'no svg';
    const paths = svg.querySelectorAll('path');
    const sample = [...paths].slice(0, 4).map(p => ({ cls: p.getAttribute('class'), attrs: [...p.attributes].map(a=>a.name).join(',') }));
    return { paths: paths.length, sample, gs: [...svg.children].map(c=>c.tagName+'.'+(c.getAttribute('class')||'')) };
  })));
  log('ATTRS IN USE', JSON.stringify(await page.evaluate(() => {
    const set = new Set();
    document.querySelectorAll('*').forEach(e => [...e.attributes].forEach(a => { if (a.name.startsWith('data-')) set.add(a.name); }));
    return [...set].sort();
  })));
  log('FOCUSABLES', JSON.stringify(await page.evaluate(() => {
    const f = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')];
    return { count: f.length, first20: f.slice(0,20).map(e => (e.tagName + ':' + (e.className||'').slice(0,40) + ':' + (e.innerText||e.getAttribute('aria-label')||'').slice(0,30).replace(/\n/g,'|'))) };
  })));
};
