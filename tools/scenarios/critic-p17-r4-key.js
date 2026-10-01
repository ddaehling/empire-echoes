/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0,200)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0,200)));
  await page.waitForTimeout(2800);
  // geometry of legend
  const geo = await page.evaluate(() => {
    const g = sel => { const n = document.querySelector(sel); if (!n) return null; const r = n.getBoundingClientRect();
      return { sel, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), clientH:n.clientHeight, scrollH:n.scrollHeight }; };
    const out = { stage: g('.app__stage'), legend: g('.stage__legend') };
    const leg = document.querySelector('.stage__legend');
    out.children = leg ? [...leg.querySelectorAll('*')].filter(n=>n.className && typeof n.className==='string' && /lkey|lplate|lbyline|legend/.test(n.className)).slice(0,40).map(n=>{const r=n.getBoundingClientRect();return n.className+' @'+Math.round(r.y)+' h'+Math.round(r.height)+(n.scrollHeight>n.clientHeight+2?' SCROLLS '+n.clientHeight+'/'+n.scrollHeight:'');}) : [];
    return out;
  });
  log('GEO ' + JSON.stringify(geo, null, 1));
  // click "Open the full key"
  const btn = await page.$('text=Open the full key');
  if (btn) { await btn.click(); await page.waitForTimeout(1200); await shot('02-fullkey'); }
  else log('NO full-key button');
  const t = await page.evaluate(() => document.body.innerText.slice(0, 6000));
  log('AFTER OPEN TEXT:\n' + t);
  log('ERRORS ' + JSON.stringify(errs));
};
