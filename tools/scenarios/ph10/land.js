module.exports = async ({ page, log, shot }) => {
  const base = 'http://localhost:8777/app/';
  const check = async (tag) => {
    const m = await page.evaluate(() => {
      const out = { ctrls: [] };
      const want = /commit|place it|that is my guess|take a side|finish|print|step it|count it/i;
      document.querySelectorAll('button').forEach(e => {
        const t = (e.textContent || '').trim().replace(/\s+/g, ' ');
        if (!want.test(t)) return;
        const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden' || b.width < 2) return;
        const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
        const inVp = cx >= 0 && cx <= innerWidth && cy >= 0 && cy <= innerHeight;
        const top = inVp ? document.elementFromPoint(cx, cy) : null;
        out.ctrls.push({ t: t.slice(0, 30), r: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
          inVp, occl: inVp ? !(top === e || e.contains(top) || (top && top.contains(e))) : null,
          small: b.width < 44 || b.height < 44, dis: e.disabled });
      });
      out.fig = !!document.querySelector('.viz-onpath');
      return out;
    });
    log(tag + ' ' + JSON.stringify(m));
    await shot(tag);
  };
  for (const [w, h] of [[844, 390], [740, 360]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const step of [1, 6, 7]) {
      await page.goto(base + '#tour=period&step=' + step, { waitUntil: 'load' });
      await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
      await page.waitForTimeout(1800);
      await check(w + 'x' + h + '-step' + step + '-top');
      /* scroll the panel to the bottom, the way a thumb does */
      await page.evaluate(() => {
        for (const s of [document.querySelector('.tr-panel__scroll'), document.querySelector('.qz'), document.querySelector('.cx-sheet__body')])
          if (s) s.scrollTop = s.scrollHeight;
      });
      await page.waitForTimeout(700);
      await check(w + 'x' + h + '-step' + step + '-bottom');
    }
  }
};
