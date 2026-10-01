/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 }).catch(()=>{});
  await page.waitForTimeout(1800);
  await shot('rt-def', '[data-mount="map-overlay"]').catch(()=>{});
  // right definition card
  const boxes = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach(e => {
      const c = e.className && typeof e.className === 'string' ? e.className : '';
      if (/defcard|defplate|mapmodes|legend|lplate|stage__note|howread/i.test(c)) {
        const r = e.getBoundingClientRect();
        if (r.width > 40 && r.height > 20) out.push({ c: c.slice(0,70), x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height), sh: e.scrollHeight, ch: e.clientHeight, ov: getComputedStyle(e).overflowY });
      }
    });
    return out;
  });
  boxes.forEach(b => log('BOX', JSON.stringify(b)));
  await page.screenshot({ path: require('path').join(process.env.OUTD || '/tmp/cohx02', 'zz.png') }).catch(()=>{});
  await shot('crop-topleft');
  await shot('crop-right');
};
