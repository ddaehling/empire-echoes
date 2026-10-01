/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'america', reveal: true }));
  await page.waitForTimeout(1200);
  // click somewhere in the eastern seaboard on plate B (the ghost of the 13 colonies)
  const box = await page.evaluate(() => { const c = document.querySelector('.cmp__side[data-side=b] canvas'); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await page.evaluate(() => { window.__picks = []; window.BEA.bus.on('compare:pick', p => window.__picks.push(JSON.stringify(p))); });
  log('PROBE', await page.evaluate(async () => {
    const { pick } = await import('/app/js/map/hit.js');
    const plates = [];
    // reach the compare plates through the module's own canvases via a bound probe
    const out = [];
    for (const rel of [[0.235,0.33],[0.30,0.35],[0.39,0.41],[0.36,0.38],[0.42,0.44]]) out.push(rel.join(','));
    return out.join(' | ');
  }));
  await page.mouse.click(box.x + 138, box.y + 137);   // Virginia, on the 1820 plate: a ghost
  await page.waitForTimeout(600);
  log('PICKS', await page.evaluate(() => JSON.stringify(window.__picks)));
  log('PICK', await page.evaluate(() => JSON.stringify({
    say: (document.querySelector('.cx-lede__say') || {}).textContent,
    pressed: [...document.querySelectorAll('.cmp__row[aria-pressed="true"]')].map(e => e.textContent.replace(/\s+/g, ' ')),
  })));
  await shot('picked');
  // click open ocean
  await page.mouse.click(box.x + 452, box.y + 241);   // New South Wales, which arrived
  await page.waitForTimeout(500);
  log('SECOND', await page.evaluate(() => JSON.stringify({
    say: (document.querySelector('.cx-lede__say') || {}).textContent,
    pressed: [...document.querySelectorAll('.cmp__row[aria-pressed="true"]')].map(e => e.textContent.replace(/\s+/g, ' ')),
  })));
  await shot('picked2');
};
