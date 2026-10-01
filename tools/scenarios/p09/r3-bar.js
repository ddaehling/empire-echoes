module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.mechanism && window.BEA.store, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1901));
  await page.waitForTimeout(700);
  const r = await page.evaluate(() => {
    const walk = (root, depth) => [...root.children].map((c) => {
      const b = c.getBoundingClientRect();
      return { tag: c.tagName.toLowerCase(), cls: c.className && String(c.className).slice(0, 60), slot: c.dataset && c.dataset.mount,
        x: Math.round(b.x), w: Math.round(b.width), txt: (c.textContent || '').trim().slice(0, 28),
        kids: depth > 0 ? walk(c, depth - 1) : undefined };
    });
    const bar = document.querySelector('.app__bar');
    const end = document.querySelector('[data-mount="chrome-end"]');
    const cs = end && getComputedStyle(end);
    return { vw: innerWidth, bar: bar && walk(bar, 2),
      end: end ? { x: Math.round(end.getBoundingClientRect().x), w: Math.round(end.getBoundingClientRect().width), sw: end.scrollWidth, overflow: cs.overflow, display: cs.display, gap: cs.gap } : null };
  });
  log(JSON.stringify(r, null, 1));
};
