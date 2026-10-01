/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=3', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2200);
  await shot('01-closed');
  const before = await page.evaluate(() => {
    const b = document.getElementById('bar-more');
    const r = b ? b.getBoundingClientRect() : null;
    return { present: !!b, hidden: b && b.hidden, shown: r ? Math.round(r.width)+'x'+Math.round(r.height) : null,
      display: b ? getComputedStyle(b).display : null };
  });
  log('button: ' + JSON.stringify(before));
  await page.evaluate(() => { const b = document.getElementById('bar-more'); if (b) b.click(); });
  await page.waitForTimeout(700);
  const open = await page.evaluate(() => {
    const p = document.getElementById('bar-tools');
    const r = p.getBoundingClientRect();
    const ctrls = [...p.querySelectorAll('button, a[href]')].filter(e => { const b = e.getBoundingClientRect(); return b.width>2 && b.height>2; })
      .map(e => (e.textContent||'').trim().replace(/\s+/g,' ').slice(0,26) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
    return { tools: document.getElementById('app').dataset.tools, box: Math.round(r.width)+'x'+Math.round(r.height)+'@'+Math.round(r.y),
      ctrls, docScroll: document.documentElement.scrollHeight - innerHeight,
      wideBy: Math.max(document.documentElement.scrollWidth - document.documentElement.clientWidth, innerWidth - document.documentElement.clientWidth),
      focused: document.activeElement ? String(document.activeElement.className).slice(0,30) : null };
  });
  log('open: ' + JSON.stringify(open, null, 1));
  await shot('02-open');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  log('after esc: ' + await page.evaluate(() => document.getElementById('app').dataset.tools + ' focus=' + String(document.activeElement.id||document.activeElement.className)));
  await shot('03-closed-again');
};
