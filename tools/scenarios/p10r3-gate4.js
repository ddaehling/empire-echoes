/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=4', { waitUntil: 'load' });
  await page.waitForTimeout(2400);
  const state = () => page.evaluate(() => {
    const bar = document.querySelector('.tr-bar');
    const pn = document.querySelector('.tr-panel__next');
    const bn = document.querySelector('.tr-bar__next');
    return {
      bar: bar ? bar.textContent.replace(/\s+/g, ' ').slice(0, 70) : null,
      panelNext: pn ? (pn.textContent.trim().slice(0, 24) + ' dis=' + (pn.disabled || pn.getAttribute('aria-disabled') === 'true')) : null,
      barNext: bn ? (bn.textContent.trim().slice(0, 24) + ' dis=' + (bn.disabled || bn.getAttribute('aria-disabled') === 'true')) : null,
      opts: document.querySelectorAll('.tr-tension__opt').length,
      pressed: document.querySelectorAll('.tr-tension__opt[aria-pressed="true"]').length,
      go: (() => { const g = document.querySelector('.tr-tension__go'); return g ? 'dis=' + g.disabled : null; })(),
      groups: document.querySelectorAll('.tr-tension__opts').length,
    };
  });
  log('before: ' + JSON.stringify(await state()));
  for (let pass = 0; pass < 4; pass++) {
    await page.evaluate(() => {
      for (const g of document.querySelectorAll('.tr-tension__opts')) {
        const opt = g.querySelector('.tr-tension__opt:not([aria-pressed="true"])');
        if (opt) opt.click();
      }
      const go = document.querySelector('.tr-tension__go');
      if (go && !go.disabled) go.click();
    });
    await page.waitForTimeout(400);
    log('pass ' + pass + ': ' + JSON.stringify(await state()));
  }
  await shot('gate4-after');
};
