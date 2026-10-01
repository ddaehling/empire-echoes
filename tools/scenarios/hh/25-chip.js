module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=period&step=4', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2400);
  log(JSON.stringify(await page.evaluate(() => {
    const out = [];
    for (const sel of ['.dsr-chip__to', '.tr-gate__claimlab', '.map__defword']) {
      const e = document.querySelector(sel); if (!e) { out.push([sel, 'absent']); continue; }
      const cs = getComputedStyle(e);
      const chain = []; let p = e;
      while (p && chain.length < 6) { chain.push(p.tagName + '.' + String(p.className).split(' ')[0] + ' bg=' + getComputedStyle(p).backgroundColor); p = p.parentElement; }
      const r = e.getBoundingClientRect();
      out.push([sel, cs.color, cs.fontSize, cs.fontWeight, Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height), chain]);
    }
    return out;
  }), null, 1));
  await shot('chips');
};
