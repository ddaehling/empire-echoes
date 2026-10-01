/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const openKey = async () => {
    const b = page.getByRole('button', { name: /Open the full key/i }).first();
    if (await b.count()) { await b.click(); await page.waitForTimeout(900); return true; }
    const l = page.getByText(/Three things wrong with this rendering/i).first();
    if (await l.count()) { await l.click(); await page.waitForTimeout(900); return true; }
    return false;
  };
  const closeKey = async () => {
    const c = page.getByRole('button', { name: /Close/i }).first();
    if (await c.count()) { await c.click(); await page.waitForTimeout(500); }
  };
  const readCaveats = async (tag) => {
    await openKey();
    const txt = await page.evaluate(() => {
      const heads = [...document.querySelectorAll('*')].filter(e => /THREE THINGS WRONG/i.test(e.textContent||'') && e.children.length < 4);
      const h = heads[0];
      let box = h; for (let i=0;i<6 && box;i++){ if (box.innerText && box.innerText.length > 300) break; box = box.parentElement; }
      return box ? box.innerText.slice(0, 2200) : 'NOT FOUND';
    });
    log('### ' + tag + '\n' + txt + '\n');
    await shot('key-'+tag);
    await closeKey();
  };
  await readCaveats('mercator-claimed');
  await page.keyboard.press('p'); await page.waitForTimeout(1200);
  await readCaveats('equalearth-claimed');
  await page.keyboard.press('3'); await page.waitForTimeout(1000);
  await readCaveats('equalearth-controlled');
  await page.keyboard.press('w'); await page.waitForTimeout(1200);
  await readCaveats('weight-controlled');
  await page.keyboard.press('w'); await page.waitForTimeout(600);
  await page.keyboard.press('s'); await page.waitForTimeout(1200);
  await readCaveats('stitch-controlled');
};
