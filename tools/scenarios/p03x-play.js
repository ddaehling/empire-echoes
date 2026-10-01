/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  // tab order at second zero
  log('tab order:', JSON.stringify(await page.evaluate(async () => {
    const out = [];
    const all = [...document.querySelectorAll('a[href],button,select,input,[tabindex]:not([tabindex="-1"])')]
      .filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && !e.disabled; });
    for (const e of all) out.push((e.className || e.tagName).toString().split(' ')[0] + ':' + (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 22));
    return out;
  })));
  // second play = real playback
  await page.evaluate(() => { const p = document.querySelector('.tl').__p03; p.hasSwept = true; });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1855));
  await page.waitForTimeout(500);
  await page.click('.tl-btn--play');
  await page.waitForTimeout(6000);
  log('after 6s of playback:', JSON.stringify(await page.evaluate(() => ({
    year: window.BEA.store.getState().year, playing: window.BEA.store.getState().playing,
    say: (document.querySelector('.cx-lede__say') || {}).textContent,
    cta: (() => { const c = document.querySelector('.cx-cta'); return c && !c.hidden ? c.textContent.trim() : null; })(),
    tlH: Math.round(document.querySelector('.tl').getBoundingClientRect().height),
    clipped: (() => { const t = document.querySelector('.tl'); return t.scrollHeight > t.clientHeight + 1; })(),
  }))));
  await shot('playing');
  // let it hit a stop
  await page.waitForTimeout(8000);
  log('after 14s:', JSON.stringify(await page.evaluate(() => ({
    year: window.BEA.store.getState().year, playing: window.BEA.store.getState().playing,
    say: (document.querySelector('.cx-lede__say') || {}).textContent,
    cta: (() => { const c = document.querySelector('.cx-cta'); return c && !c.hidden ? c.textContent.trim() : null; })(),
  }))));
  await shot('stopped');
  const cta = await page.$('.cx-cta:not([hidden])');
  if (cta) { await cta.click(); await page.waitForTimeout(1200); }
  log('after keep going:', JSON.stringify(await page.evaluate(() => ({ year: window.BEA.store.getState().year, playing: window.BEA.store.getState().playing }))));
  await page.evaluate(() => window.BEA.bus.emit('ask:pause'));
  await page.waitForTimeout(500);
  log('settled:', JSON.stringify(await page.evaluate(() => ({ say: (document.querySelector('.cx-lede__say')||{}).textContent, cta: (()=>{const c=document.querySelector('.cx-cta'); return c&&!c.hidden?c.textContent.trim():null;})() }))));
};
