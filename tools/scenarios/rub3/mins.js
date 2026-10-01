const RX = /(\b\d{1,3}\s*[–—-]\s*\d{1,3}\s*(?:min|minute)|\b\d{1,3}\s*(?:min\b|minutes?\b)|\b(?:ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|twenty-five|thirty-five|forty-five|fifty-five)[- ]?(?:minute|minutes)\b|\bhalf an hour\b|\bperiods?\b)/gi;
module.exports = async ({ page, log }) => {
  const found = new Map();
  const scan = async (where) => {
    const t = await page.evaluate(() => document.body.innerText);
    for (const m of t.match(RX) || []) {}
  };
  const grab = async (where) => {
    const t = await page.evaluate(() => document.body.innerText + '\n' + (document.querySelector('.tp-paper') ? document.querySelector('.tp-paper').innerText : ''));
    const rx = new RegExp(RX.source, 'gi');
    let m; const out = new Set();
    while ((m = rx.exec(t))) {
      const s = Math.max(0, m.index - 70), e = Math.min(t.length, m.index + m[0].length + 60);
      out.add(m[0] + '   « ' + t.slice(s, e).replace(/\s+/g, ' ') + ' »');
    }
    log('### ' + where + '\n' + [...out].join('\n'));
  };
  const panels = ['classroom', 'workshop', 'evidence', 'methods'];
  for (const p of panels) {
    await page.goto('http://localhost:8777/app/#panel=' + p, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
    await page.waitForTimeout(3500);
    await grab('PANEL ' + p);
  }
  // every print sheet
  await page.goto('http://localhost:8777/app/#panel=classroom', { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  const n = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent && /^print/i.test((b.innerText||'').trim())).length);
  for (let i = 0; i < n; i++) {
    const lab = await page.evaluate((i) => {
      const bs = Array.from(document.querySelectorAll('button')).filter(b=>b.offsetParent && /^print/i.test((b.innerText||'').trim()));
      const b = bs[i]; if (!b) return null; const s=(b.innerText||'').replace(/\s+/g,' ').trim(); b.click(); return s;
    }, i);
    if (!lab) continue;
    await page.waitForTimeout(1200);
    await grab('PRINT[' + i + '] ' + lab);
  }
};
