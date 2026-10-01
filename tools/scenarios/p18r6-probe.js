/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const READY = () => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready';
const BEAT = 'http://localhost:8777/app/#tour=thirty&step=9';
module.exports = async ({ page, shot, log }) => {
  await page.goto(BEAT, { waitUntil: 'load' });
  await page.waitForFunction(READY);
  await page.waitForTimeout(1200);
  const probe = () => page.evaluate(() => {
    const n = document.querySelector('.cmp__launch');
    const r = n && n.getBoundingClientRect();
    const anc = []; let p = n; while (p && p !== document.body) { const cs = getComputedStyle(p);
      anc.push(p.className + '|' + cs.display + '|' + cs.visibility); p = p.parentElement; }
    return { box: r && { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      text: n && n.textContent.trim(), aria: n && n.getAttribute('aria-label'),
      hidden: n && n.hidden, anc,
      barState: document.getElementById('app').dataset.bar,
      tools: document.getElementById('app').dataset.tools };
  });
  log('COLD ' + JSON.stringify(await probe(), null, 1));
  const more = await page.$('#bar-more');
  if (more) { await more.click(); await page.waitForTimeout(500); }
  log('TOOLS OPEN ' + JSON.stringify(await probe(), null, 1));
  await shot('tools-open');
  // legend ribbon while compare open
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.keyboard.press('v'); await page.waitForTimeout(1200);
  const leg = await page.evaluate(() => {
    const out = [];
    for (const s of ['.stage__key', '.legend__pin', '.legend', '.stage__over', '.stage__dock']) {
      const n = document.querySelector(s); if (!n) { out.push([s, 'absent']); continue; }
      const r = n.getBoundingClientRect(); const cs = getComputedStyle(n);
      out.push([s, Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height),
        cs.display, cs.visibility, n.parentElement.className]);
    }
    return out;
  });
  log('LEGEND ' + JSON.stringify(leg));
  // label-in-name audit inside cmp
  const names = await page.evaluate(() => {
    const out = [];
    for (const n of document.querySelectorAll('.cmp button, .cmp a[href], .cmp [role="button"], .cmp__launch')) {
      const vis = (n.innerText || n.textContent || '').replace(/\s+/g, ' ').trim();
      const al = n.getAttribute('aria-label');
      if (al && vis && !al.toLowerCase().includes(vis.toLowerCase())) out.push({ vis, al });
    }
    return out;
  });
  log('LABEL-IN-NAME misses ' + JSON.stringify(names, null, 1));
  const targets = await page.evaluate(() => {
    const out = [];
    for (const n of document.querySelectorAll('.cmp button, .cmp a[href], .cmp input, .cmp [role="button"]')) {
      const r = n.getBoundingClientRect(); if (r.width < 1) continue;
      if (r.width < 24 || r.height < 24) out.push({ t: (n.textContent||'').trim().slice(0,26), w: Math.round(r.width), h: Math.round(r.height) });
    }
    return out;
  });
  log('SUB-24 targets ' + JSON.stringify(targets));
};
