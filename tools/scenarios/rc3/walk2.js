module.exports = async ({ page, shot, log }) => {
  const t0 = Date.now();
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1200);
  const headline = async () => await page.evaluate(() => {
    const h = document.querySelector('.tr-bar__line, [class*="bar__line"], [class*="beatline"]');
    const step = document.querySelector('.tr-bar__count, [class*="count"]');
    return { line: (h?.innerText||'').replace(/\s+/g,' ').trim().slice(0,180), step: (step?.innerText||'').replace(/\s+/g,' ').trim() };
  });
  for (let i = 1; i <= 30; i++) {
    const h = await headline();
    const url = page.url();
    log(`STEP ${i} [${h.step}] ${h.line}`);
    log(`    url=${url}`);
    if (i<=3 || i>=13) await shot('s'+String(i).padStart(2,'0'));
    // gate?
    let next = page.getByRole('button', { name: /^Next beat$/i }).first();
    if (!(await next.count())) {
      // gate: try to satisfy
      const cells = page.locator('input[type=radio]');
      const c = await cells.count();
      log(`    GATE: ${c} radios`);
      if (c) { await cells.nth(Math.floor(c/2)).check({force:true}).catch(e=>log('    radio fail '+e.message)); await page.waitForTimeout(800); }
      else {
        const opt = page.locator('[role=radio], .gate button, [data-place]');
        log('    alt options: ' + await opt.count());
        if (await opt.count()) { await opt.nth(0).click({force:true}); await page.waitForTimeout(800); }
      }
      next = page.getByRole('button', { name: /^Next beat$|^Place it|^Go on/i }).first();
      if (!(await next.count())) { log('    STILL BLOCKED'); await shot('blocked'+i); break; }
    }
    await next.click({ timeout: 5000 }).catch(e => log('    click fail ' + e.message));
    await page.waitForTimeout(1000);
    if (/step=(15|25)/.test(page.url())) { /* keep going */ }
  }
  log('elapsed ms ' + (Date.now()-t0));
  await shot('end');
  log('END TEXT>>> ' + (await page.evaluate(()=>document.body.innerText)).slice(0,3000));
};
