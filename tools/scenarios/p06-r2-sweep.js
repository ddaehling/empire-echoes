/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Every viewport in the brief, one dossier with role groups, keyboard only. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.evaluate(() => { window.BEA.store.act.setYear(1900); window.BEA.store.act.select('nepal'); });
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => {
    const b = document.querySelector('[data-block=taken]');
    const rows = [...document.querySelectorAll('[data-block=taken] .dsr__from')].map((p) => {
      const r = p.getBoundingClientRect();
      return { k: p.dataset.k, clip: p.dataset.clip || null, h: Math.round(r.height), w: Math.round(r.width), text: p.textContent.replace(/\s+/g, ' ').trim() };
    });
    const also = document.querySelector('.dsr__also');
    return { rows, blockH: b ? Math.round(b.getBoundingClientRect().height) : null,
      alsoColor: also ? getComputedStyle(also).color : null, vp: { w: innerWidth, h: innerHeight },
      theme: document.documentElement.dataset.theme || getComputedStyle(document.documentElement).getPropertyValue('--paper') };
  });
  log('measure', JSON.stringify(m, null, 1));
  await shot('taken');
  /* keyboard only: tab into the dossier and confirm a from-row "more" is reachable */
  for (let i = 0; i < 30; i++) await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => { const a = document.activeElement; return a ? (a.className + ' | ' + (a.getAttribute('aria-label') || a.textContent || '').slice(0, 60)) : null; });
  log('focus after 30 tabs:', focused);
};
