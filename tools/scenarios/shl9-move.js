/* shl9-move.js — does the axis/spine move as disclosure changes, by REAL routes? */
module.exports = async ({ page, log, shot }) => {
  const M = async label => {
    const m = await page.evaluate(() => {
      const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [+b.x.toFixed(1), +b.y.toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; };
      const time = document.querySelector('.app__time');
      const box = time.getBoundingClientRect();
      const over = [];
      time.querySelectorAll('*').forEach(el => {
        if (!el.getClientRects().length) return;
        const q = el.getBoundingClientRect();
        const d = Math.max(q.bottom - box.bottom, box.top - q.top, q.right - box.right, box.left - q.left);
        if (d > 0.5) over.push([(typeof el.className === 'string' ? el.className.trim().split(/\s+/).join('.') : el.tagName), +d.toFixed(1), +q.y.toFixed(1), +q.height.toFixed(1)]);
      });
      over.sort((a, b) => b[1] - a[1]);
      return { stage: document.documentElement.dataset.stage, time: [+box.x.toFixed(1), +box.y.toFixed(1), +box.width.toFixed(1), +box.height.toFixed(1)],
        axis: r('.tl-ax__axis'), spine: r('.tl-spine'), ax: r('.tl-ax'), map: r('.stage__map'), stage_: r('.app__stage'), deck: r('.tl__deck'), over: over.slice(0, 8) };
    });
    log(label, JSON.stringify(m));
    return m;
  };
  await page.waitForTimeout(2300);
  const a = await M('L0 plate    ');
  // real working: press +1
  await page.click('.tl__transport .tl-btn:has-text("+1")').catch(() => {});
  await page.waitForTimeout(900);
  const b = await M('L1 working  ');
  // real apparatus: click a .cx-more
  const more = await page.$('.cx-more:visible');
  if (more) { await more.click().catch(() => {}); } else { await page.evaluate(() => window.BEA?.bus?.emit?.('ask:stage', { level: 'apparatus' })); }
  await page.waitForTimeout(1100);
  const c = await M('L2 apparatus');
  await shot('apparatus');
  // deep: open the sheet
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:sheet', { id: 'legend-key' }));
  await page.waitForTimeout(1100);
  const d = await M('L3 sheet    ');
  await shot('sheet');
  // deep: open a dossier by clicking the map
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:close-sheet'));
  await page.waitForTimeout(600);
  const st = await page.$('.stage__map');
  if (st) { const bb = await st.boundingBox(); await page.mouse.click(bb.x + bb.width * 0.52, bb.y + bb.height * 0.45); }
  await page.waitForTimeout(1200);
  const e = await M('L3 dossier  ');
  await shot('dossier');
  const dy = (p, q) => p && q ? { axis: +(q.axis[1] - p.axis[1]).toFixed(1), spine: +(q.spine[1] - p.spine[1]).toFixed(1) } : null;
  log('DELTA plate->working  ', JSON.stringify(dy(a, b)));
  log('DELTA plate->apparatus', JSON.stringify(dy(a, c)));
  log('DELTA plate->sheet    ', JSON.stringify(dy(a, d)));
  log('DELTA plate->dossier  ', JSON.stringify(dy(a, e)));
};
