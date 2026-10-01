module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(900);
  await page.locator('button:has-text("Tools")').first().click();
  await page.waitForTimeout(400);
  await page.locator('button:has-text("Teaching desk")').first().click();
  await page.waitForTimeout(1200);
  await page.locator('button:has-text("Classroom")').first().click();
  await page.waitForTimeout(1200);

  const grab = async (label) => {
    const txt = await page.evaluate(() => {
      const el = document.querySelector('.tsheet, .print-sheet, .tp-sheet, [data-print], #print-root, .tt-print') || null;
      return el ? el.innerText : null;
    });
    log('=== ' + label + ' ===');
    log(txt ? txt.slice(0, 9000) : '(no print root found)');
  };

  for (const name of ['Print the lesson plan', 'Print the board sheet']) {
    const b = page.locator('button:has-text("' + name + '")').first();
    if (!(await b.count())) { log('no control: ' + name); continue; }
    await b.click().catch(e => log('click fail ' + e.message));
    await page.waitForTimeout(1600);
    await shot(name.replace(/\s+/g, '-'));
    const all = await page.evaluate(() => document.body.innerText);
    log('=== AFTER ' + name + ' — MINUTE SENTENCES ===');
    log((all.match(/[^.\n]{0,180}\bminutes?\b[^.\n]{0,140}/gi) || ['(none)']).join('\n---\n'));
    /* escape any dialog */
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
  }
};
