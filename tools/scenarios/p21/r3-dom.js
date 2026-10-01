module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1800);
  const r = await page.evaluate(() => {
    const chain = [];
    let n = document.querySelector('.cl-blk');
    while (n && n !== document.documentElement) {
      const b = n.getBoundingClientRect(); const c = getComputedStyle(n);
      chain.push({ tag: n.tagName.toLowerCase(), cls: n.className && String(n.className).slice(0, 60), y: Math.round(b.y), h: Math.round(b.height),
        oflowY: c.overflowY, pos: c.position, sh: n.scrollHeight, ch: n.clientHeight });
      n = n.parentElement;
    }
    return { chain, vh: innerHeight };
  });
  log(JSON.stringify(r, null, 1));
  await shot('dom390');
};
