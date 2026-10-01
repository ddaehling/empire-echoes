/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2800);
  log(JSON.stringify(await page.evaluate(() => {
    const R = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; };
    const body = document.querySelector('.map__switchbody');
    return { rail: R('.map__furniture'), switchEl: R('.map__switch'), body: R('.map__switchbody'),
      controls: R('.map__controls'), modes: R('.map__modes'), zooms: R('.map__zooms'),
      scrollH: body ? body.scrollHeight : null, clientH: body ? body.clientHeight : null,
      pageable: document.querySelector('.map__switch').className,
      text: body ? body.innerText.slice(0, 320) : null };
  }), null, 1));
  await shot('rail');
};
