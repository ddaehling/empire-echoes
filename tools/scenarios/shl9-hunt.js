/* shl9-hunt.js — click every visible control in turn; report any state where the
 * axis or the spine band moves from its cold-plate y. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(2300);
  const read = () => page.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [+b.y.toFixed(1), +b.height.toFixed(1), +b.width.toFixed(1)]; };
    const time = document.querySelector('.app__time'); if (!time) return null;
    const box = time.getBoundingClientRect(); let worst = 0, who = '';
    time.querySelectorAll('*').forEach(el => { if (!el.getClientRects().length) return; const q = el.getBoundingClientRect();
      const d = Math.max(q.bottom - box.bottom, box.top - q.top); if (d > worst) { worst = d; who = (typeof el.className === 'string' ? el.className : el.tagName); } });
    return { axis: r('.tl-ax__axis'), spine: r('.tl-spine'), ax: r('.tl-ax'), time: r('.app__time'), body: r('.tl__body'), over: +worst.toFixed(1), who,
      stage: document.documentElement.dataset.stage };
  });
  const base = await read();
  log('BASE', JSON.stringify(base));
  const sels = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('button, [role=button], a[href^="#"], select, input[type=range]').forEach((el, i) => {
      if (!el.getClientRects().length) return;
      el.setAttribute('data-hunt', String(i));
      out.push({ i, label: (el.getAttribute('aria-label') || el.textContent || el.className || '').trim().slice(0, 46), cls: (typeof el.className === 'string' ? el.className : '').slice(0, 40) });
    });
    return out;
  });
  log('controls', sels.length);
  const moved = [];
  for (const s of sels) {
    const el = await page.$(`[data-hunt="${s.i}"]`);
    if (!el) continue;
    try { await el.click({ timeout: 1200 }); } catch (e) { continue; }
    await page.waitForTimeout(450);
    const m = await read();
    if (!m || !m.axis) { moved.push([s.label, 'GONE']); }
    else if (Math.abs(m.axis[0] - base.axis[0]) > 0.6 || Math.abs(m.spine[0] - base.spine[0]) > 0.6 || m.over > 0.5) {
      moved.push([s.label, s.cls, JSON.stringify(m)]);
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(200);
  }
  log('MOVED/OVER count', moved.length);
  moved.slice(0, 30).forEach(m => log(' *', JSON.stringify(m)));
};
