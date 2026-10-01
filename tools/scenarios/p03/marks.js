module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(1200);
  log(JSON.stringify(await page.evaluate(() => {
    const row = document.querySelector('.tl-ax__marks');
    const rb = row.getBoundingClientRect();
    const ms = [...row.querySelectorAll('.tl-mark')].filter(b => !b.hidden);
    const first = ms[0] ? ms[0].getBoundingClientRect() : null;
    const withN = ms.filter(b => b.querySelector('.tl-mark__n').textContent.trim());
    return {
      rowH: Math.round(rb.height), rowW: Math.round(rb.width), rowX: Math.round(rb.x), rowY: Math.round(rb.y),
      n: ms.length, withNumeral: withN.length,
      firstLeft: first ? Math.round(first.x - rb.x) : null,
      leftGutter: ms.length ? Math.min(...ms.map(b => Math.round(b.getBoundingClientRect().x - rb.x))) : null,
      markW: first ? Math.round(first.width) : null,
      deck: (() => { const d = document.querySelector('.tl__deck'); const b = d.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; })(),
      body: (() => { const d = document.querySelector('.tl__body'); const b = d.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.x) }; })(),
      ax: (() => { const d = document.querySelector('.tl-ax'); const b = d.getBoundingClientRect(); return { h: Math.round(b.height) }; })(),
      spine: (() => { const d = document.querySelector('.tl-spine') || document.querySelector('.tl__body > *:last-child'); const b = d.getBoundingClientRect(); return { cls: d.className, h: Math.round(b.height) }; })(),
    };
  })));
};
