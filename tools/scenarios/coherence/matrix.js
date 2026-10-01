module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await shot('a-default');
  // overlap detector: which text nodes are painted over by another box?
  log('OVERPRINT', JSON.stringify(await page.evaluate(() => {
    const out = [];
    const leaves = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && (e.textContent||'').trim().length > 1);
    for (const e of leaves) {
      const r = e.getBoundingClientRect();
      if (r.width < 6 || r.height < 6 || r.bottom < 0 || r.top > innerHeight) continue;
      const pts = [[r.left+2, r.top+r.height/2], [r.left+r.width/2, r.top+r.height/2], [r.right-2, r.top+r.height/2]];
      for (const [x,y] of pts) {
        const hit = document.elementFromPoint(x,y);
        if (!hit || hit === e || e.contains(hit) || hit.contains(e)) continue;
        out.push({ text: e.textContent.trim().slice(0,48), cls: (e.className||'').toString().slice(0,40), over: hit.tagName+'.'+(hit.className||'').toString().slice(0,40) });
        break;
      }
    }
    const seen = new Set();
    return out.filter(o => { const k = o.cls+'|'+o.over; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0,20);
  })));
  log('PAGE SCROLL', JSON.stringify(await page.evaluate(() => ({ sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight, bodyOverflowX: document.documentElement.scrollWidth > innerWidth }))));
  await page.evaluate(() => BEA.store.dispatch('setYear', 1948));
  await page.waitForTimeout(700);
  await shot('b-1948');
  log('OVERPRINT 1948', JSON.stringify(await page.evaluate(() => {
    const out = [];
    const leaves = [...document.querySelectorAll('.tl-ax *, .tl-chg, .tl-chg *')].filter(e => e.children.length === 0 && (e.textContent||'').trim());
    for (const e of leaves) {
      const r = e.getBoundingClientRect(); if (r.width<4||r.height<4) continue;
      const hit = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
      if (hit && hit !== e && !e.contains(hit) && !hit.contains(e)) out.push({ t: e.textContent.trim().slice(0,40), cls:(e.className||'').toString().slice(0,30), over: (hit.className||hit.tagName).toString().slice(0,40) });
    }
    return out.slice(0,12);
  })));
};
