/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// Coherence pass 2: land cold, as a 15-year-old with no instructions.
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(400);
  await shot('t0-4');
  await page.waitForTimeout(1000);
  await shot('t1-4');
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 }).catch(()=>{});
  await page.waitForTimeout(1800);
  await shot('landed');
  log('URL:', page.url());
  log('boot:', await page.evaluate(() => document.documentElement.dataset.boot));
  log('slots:', await page.evaluate(() => [...document.querySelectorAll('[data-mount]')].map(e => e.dataset.mount + '=' + (e.children.length ? e.children.length : 'EMPTY')).join(' | ')));
  const txt = await page.evaluate(() => document.body.innerText);
  log('--- BODY TEXT (' + txt.length + ' chars) ---\n' + txt.slice(0, 6000));
  log('state:', await page.evaluate(() => { try { return JSON.stringify(window.BEA?.store?.getState?.() ?? {}, (k,v)=> v instanceof Set ? [...v] : v).slice(0,2000);} catch(e){return 'ERR '+e.message;} }));
  log('BEA keys:', await page.evaluate(() => Object.keys(window.BEA||{})));
  // Where can I click? enumerate top-level interactive controls with their labels
  const ctrls = await page.evaluate(() => [...document.querySelectorAll('button,[role=button],a[href],input,select,[tabindex]:not([tabindex="-1"])')]
    .filter(e => e.offsetParent !== null)
    .map(e => { const r = e.getBoundingClientRect(); return { tag:e.tagName.toLowerCase(), t:(e.innerText||e.getAttribute('aria-label')||e.value||'').replace(/\s+/g,' ').trim().slice(0,60), x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) }; })
    .filter(c => c.w>0));
  log('VISIBLE CONTROLS (' + ctrls.length + '):');
  ctrls.forEach(c => log('  ', JSON.stringify(c)));
};
